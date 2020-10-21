const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const stream = require('stream');

const docker = new Docker();
const returnContainersRouter = (io) => {
    /* GET containers. */
    router.get('/', (req, res, next) => {
        docker.listContainers({all: true}, (err, containers) => {
            res.locals.formatName = function (str) {
                return str[0].split('/')[1];
            };
            docker.listImages(null, (err, listImages) => {
                res.render('containers',
                    {
                        containers: containers,
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

    router.get('/stop/:id', function (req, res, next) {
        const container = docker.getContainer(req.params.id);
        container.stop(null, (err, data) => {
            res.redirect('/containers');
        });
    });

    router.get('/remove/:id', function (req, res, next) {
        const container = docker.getContainer(req.params.id);
        container.remove({force: true}, function (err, data) {
            res.redirect('/containers');
        });
    });

    router.post('/create', function (req, res, next) {
        let options = {
            Image: req.body.containerImage,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            HostConfig: {
                PortBindings: {}
            }
        };

        // name
        if (req.body.containerName !== "") {
            options = {
                ...options,
                name: req.body.containerName
            }
        }

        // volume
        if (req.body.containerVolumeSource !== "" && req.body.containerVolumeDistination !== "") {
            const src = req.body.containerVolumeSource;
            const dis = req.body.containerVolumeDistination;
            options['Volumes'] = JSON.parse('{"' + dis + '": {}}');
            options.HostConfig = {
                'Binds': [src + ':' + dis],
                "RestartPolicy": {
                    "Name": req.body.isAlways === 'on' ? "always" : "",
                    "MaximumRetryCount": 5
                },
            }
        }

        // port
        if (req.body.containerPortSource !== "" && req.body.containerPortDistination !== "") {
            var src = req.body.containerPortSource + '/tcp';
            var dis = req.body.containerPortDistination;
            options['ExposedPorts'] = JSON.parse('{"' + src + '": {}}');
            var tmp = '{ "' + src + '": [{ "HostPort":"' + dis + '" }]}';
            options.HostConfig.PortBindings = JSON.parse(tmp);
        }

        if (req.body.containerCmd != "") {
            options.Cmd = ['/bin/bash', '-c', req.body.containerCmd];
            // console.log(options)
            docker.createContainer(options, function (err, container) {
                if (err) throw err
                container.start(function (err, data) {
                    res.redirect('/containers/logs/' + container.id);
                });
            });
        } else {
            const runOpt = {
                Image: req.body.containerImage,
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                //Cmd: ['/bin/bash'],
                OpenStdin: false,
                StdinOnce: false,
                ...options
            };
            docker.createContainer(runOpt).then(function (container) {
                return container.start();
            }).then(function (container) {
                res.redirect('/containers');
            })
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
                "AttachStdout": true,
                "AttachStderr": true,
                "AttachStdin": true,
                "Tty": true,
                Cmd: ['/bin/bash']
            };
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
                    const dimensions = {h, w};
                    if (dimensions.h != 0 && dimensions.w != 0) {
                        exec.resize(dimensions, () => {
                        });
                    }

                    stream.on('data', (chunk) => {
                        socket.emit('show', chunk.toString());
                    });

                    socket.on('cmd', (data) => {
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

            var logs_opts = {
                follow: true,
                stdout: true,
                stderr: true,
                timestamps: false
            };

            function handler(err, stream) {
                container.modem.demuxStream(stream, logStream, logStream);
                if (!err && stream) {
                    stream.on('end', () => {
                        logStream.end('===Logs stream finished===');
                        socket.emit('end', 'ended');
                        stream.destroy();
                    });
                }
            }

            container.logs(logs_opts, handler);
        });

        socket.on('getSysInfo', function (id) {
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
                console.log("socket.io => getContainersInfo " + id);
                var container = docker.getContainer(id);
                container.stats((err, stream) => {
                    streams.push(stream);
                    if (!err && stream != null) {
                        stream.on('data', (data) => {
                            const toSend = JSON.parse(data.toString('utf8'));
                            socket.emit("containerInfo", toSend);
                        });
                        stream.on('end', function () {
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
