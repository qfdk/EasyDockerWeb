const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker();

const returnImagesRouter = (io) => {
    /* GET users listing. */
    router.get('/', (req, res, next) => {
        docker.listImages((err, listImages) => {
            res.locals.imageName = (str) => {
                if (str) {
                    if (str.length != 0) {
                        return str[0].split(':')[0];
                    }
                }
                return str;
            };
            // image Tag
            res.locals.imageTag = (str) => {
                if (str) {
                    if (str.length != 0) {
                        return str[0].split(':')[1];
                    }
                }
                return str;
            };
            // imageSize
            res.locals.imageSize = (str) => {
                const newSiez = parseInt(str, 10);
                str = (newSiez / 1000 / 1000).toFixed(2).
                toString().
                substring(0, 4);
                if (str.indexOf('.') == 3) {
                    return str.split('.')[0];
                }
                return str;
            };
            res.render('images', {
                images: listImages,
            });
        });
    });

    router.get('/remove/:id', (req, res, next) => {
        let imageId = req.params.id;
        if (imageId.indexOf(':') > 0) {
            imageId = imageId.split(':')[1];
        }
        let image = docker.getImage(imageId);
        image.remove({force: true}, (err, data) => {
            if (err) {
                res.render('error', {error: err, message: err.json.message});
            } else {
                res.redirect('/images');
            }
        });
    });

    router.get('/search/:name', (req, res, next) => {
        let name = req.params.name;
        docker.searchImages({term: name}, (err, data) => {
            if (err) throw err;
            res.json(data);
        });
    });
    io.on('connection', (socket) => {
        socket.on('pull', (imageName, w, h) => {
            docker.pull(imageName, (err, stream) => {
                if (err) {
                    const tmp = err.toString();
                    socket.emit('show', tmp);
                    setTimeout(() => {
                        socket.emit('end');
                    }, 10000);
                } else {
                    docker.modem.followProgress(stream, onFinished, onProgress);

                    function onFinished(err, output) {
                        if (err) {
                            console.log(err);
                        }
                        socket.emit('end');
                    }

                    function onProgress(event) {
                        if (event.id) {
                            socket.emit('show',
                                event.status + ':' + event.id + '\n');
                        } else {
                            socket.emit('show', event.status + '\n');
                        }
                        if (event.progress) {
                            socket.emit('show', event.progress + '\n');
                        }
                    }
                }

            });
        });
    });
    return router;
};
module.exports = returnImagesRouter;
