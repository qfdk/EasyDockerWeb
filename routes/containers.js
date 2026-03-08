const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const stream = require('stream');

const docker = new Docker();
const returnContainersRouter = (io) => {
    /* GET containers. */
    router.get('/', (req, res, next) => {
        docker.listContainers({all: true}, (err, containers) => {
            res.locals.formatName = (str) => {
                return str[0].split('/')[1];
            };
            const stateOrder = {running: 0, created: 1, exited: 2};
            containers.sort((a, b) => (stateOrder[a.State] ?? 3) - (stateOrder[b.State] ?? 3));

            const groups = {};
            const standalone = [];
            containers.forEach((c) => {
                const project = c.Labels && c.Labels['com.docker.compose.project'];
                if (project) {
                    if (!groups[project]) groups[project] = [];
                    groups[project].push(c);
                } else {
                    standalone.push(c);
                }
            });

            docker.listImages(null, (err, listImages) => {
                res.render('containers',
                    {
                        containers: containers,
                        composeGroups: groups,
                        standalone: standalone,
                        images: listImages
                    });
            });
        });
    });

    router.get('/start/:id', (req, res, next) => {
        const container = docker.getContainer(req.params.id);
        container.start(null, (err, data) => {
            res.redirect('/containers');
        });
    });

    router.get('/stop/:id', (req, res, next) => {
        const container = docker.getContainer(req.params.id);
        container.stop(null, (err, data) => {
            res.redirect('/containers');
        });
    });

    router.get('/remove/:id', (req, res, next) => {
        const container = docker.getContainer(req.params.id);
        container.remove({force: true}, (err, data) => {
            if (err) {
                res.render('error', {error: err, message: err.json.message});
            } else {
                res.redirect('/containers');
            }
        });
    });

    router.post('/create', (req, res, next) => {
        console.log('Container create request:', {
            image: req.body.containerImage,
            name: req.body.containerName,
            cmd: req.body.containerCmd,
            ports: `${req.body.containerPortSource}:${req.body.containerPortDistination}`,
            volumes: `${req.body.containerVolumeSource}:${req.body.containerVolumeDistination}`,
            isAlways: req.body.isAlways
        });

        if (!req.body.containerImage || typeof req.body.containerImage !== 'string') {
            return res.status(400).send('Invalid image name');
        }

        // Handle comma-separated image names
        const imageName = req.body.containerImage.split(',')[0].trim();

        let options = {
            Image: imageName,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            HostConfig: {
                PortBindings: {},
                Binds: [],
                RestartPolicy: {
                    Name: req.body.isAlways === 'on' ? 'always' : 'no'
                }
            }
        };

        if (req.body.containerName !== '') {
            options.name = req.body.containerName;
        }

        if (req.body.containerVolumeSource !== '' &&
            req.body.containerVolumeDistination !== '') {
            const src = req.body.containerVolumeSource;
            const dis = req.body.containerVolumeDistination;

            if (!options.Volumes) {
                options.Volumes = {};
            }
            options.Volumes[dis] = {};
            options.HostConfig.Binds.push(`${src}:${dis}`);
        }

        if (req.body.containerPortSource !== '' &&
            req.body.containerPortDistination !== '') {
            const src = `${req.body.containerPortSource}/tcp`;
            const dis = req.body.containerPortDistination;

            if (!options.ExposedPorts) {
                options.ExposedPorts = {};
            }
            options.ExposedPorts[src] = {};
            options.HostConfig.PortBindings[src] = [{HostPort: dis}];
        }

        if (req.body.containerCmd !== '') {
            // Use /bin/sh instead of /bin/bash
            options.Cmd = ['/bin/sh', '-c', req.body.containerCmd];

            docker.createContainer(options)
                .then(container => container.start())
                .then(container => {
                    res.redirect('/containers/logs/' + container.id);
                })
                .catch(err => {
                    console.error('Docker错误:', err);
                    next(err);
                });
        } else {
            const runOpt = {
                ...options,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                OpenStdin: false,
                StdinOnce: false
                // Don't set Cmd to avoid shell issues
            };

            docker.createContainer(runOpt)
                .then(container => container.start())
                .then(container => {
                    res.redirect('/containers');
                })
                .catch(err => {
                    console.error('Docker错误:', err);
                    next(err);
                });
        }
    });

    router.get('/console/:id', (req, res, next) => {
        res.render('terminal');
    });

    router.get('/logs/:id', (req, res, next) => {
        res.render('logs');
    });

    io.on('connection', (socket) => {
        socket.on('exec', (id, w, h) => {
            const container = docker.getContainer(id);
            let cmd = {
                'AttachStdout': true,
                'AttachStderr': true,
                'AttachStdin': true,
                'Tty': true,
                Cmd: ['/bin/bash']
            };
            socket.on('resize', (data) => {
                container.resize({h: data.rows, w: data.cols}, () => {
                });
            });
            container.exec(cmd, (err, exec) => {
                let options = {
                    'Tty': true,
                    stream: true,
                    stdin: true,
                    stdout: true,
                    stderr: true,
                    // fix vim
                    hijack: true
                };

                container.wait((err, data) => {
                    socket.emit('end', 'ended');
                });

                if (err) {
                    return;
                }

                exec.start(options, (err, stream) => {
                    stream.on('data', (chunk) => {
                        socket.emit('show', chunk.toString());
                    });

                    socket.on('cmd', (data) => {
                        if (typeof data !== 'object')
                            stream.write(data);
                    });
                });
            });
        });

        socket.on('attach', (id, w, h) => {
            const container = docker.getContainer(id);

            const logStream = new stream.PassThrough();
            logStream.on('data', (chunk) => {
                socket.emit('show', chunk.toString('utf8'));
            });

            const logs_opts = {
                follow: true,
                stdout: true,
                stderr: true,
                timestamps: false
            };

            const handler = (err, stream) => {
                container.modem.demuxStream(stream, logStream, logStream);
                if (!err && stream) {
                    stream.on('end', () => {
                        logStream.end('===Logs stream finished===');
                        socket.emit('end', 'ended');
                        stream.destroy();
                    });
                }
            };

            container.logs(logs_opts, handler);
        });

        socket.on('getSysInfo', (id) => {
            const container = docker.getContainer(id);
            container.stats((err, stream) => {
                if (!err && stream != null) {
                    stream.on('data', (data) => {
                        socket.emit(id, data.toString('utf8'));
                    });
                    stream.on('end', () => {
                        socket.emit('end', 'ended');
                        stream.destroy();
                    });
                }
            });
        });

        socket.on('end', () => {
            array = [];
            streams.map((stream) => {
                stream.destroy();
            });
            console.log('--------end---------');
        });

        let array = [];
        let streams = [];
        // for react web ui
        socket.on('getContainersInfo', (id) => {
            if (array.indexOf(id) === -1) {
                array.push(id);
                console.log('socket.io => getContainersInfo ' + id);
                const container = docker.getContainer(id);
                container.stats((err, stream) => {
                    streams.push(stream);
                    if (!err && stream != null) {
                        stream.on('data', (data) => {
                            const toSend = JSON.parse(data.toString('utf8'));
                            socket.emit('containerInfo', toSend);
                        });
                        stream.on('end', () => {
                            socket.emit('end', 'ended');
                            stream.destroy();
                        });
                    }
                });
            }
        });

    });

    return router;
};

module.exports = returnContainersRouter;
