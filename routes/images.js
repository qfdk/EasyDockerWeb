const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker();

const returnImagesRouter = (io) => {
    router.get('/', (req, res, next) => {
        docker.listContainers({all: true}, (err, containers) => {
            const usedImageIds = new Set();
            if (containers) {
                containers.forEach((c) => usedImageIds.add(c.ImageID));
            }

            docker.listImages((err, listImages) => {
                res.locals.imageName = (str) => {
                    if (str && str.length !== 0) return str[0].split(':')[0];
                    return str;
                };
                res.locals.imageTag = (str) => {
                    if (str && str.length !== 0) return str[0].split(':')[1];
                    return str;
                };
                res.locals.imageSize = (str) => {
                    const bytes = parseInt(str, 10);
                    str = (bytes / 1000 / 1000).toFixed(2).toString().substring(0, 4);
                    if (str.indexOf('.') === 3) return str.split('.')[0];
                    return str;
                };

                if (listImages) {
                    listImages.sort((a, b) => {
                        const aUsed = usedImageIds.has(a.Id) ? 1 : 0;
                        const bUsed = usedImageIds.has(b.Id) ? 1 : 0;
                        return aUsed - bUsed;
                    });
                }

                res.render('images', {
                    images: listImages,
                    usedImageIds: Array.from(usedImageIds)
                });
            });
        });
    });

    router.post('/remove-batch', (req, res, next) => {
        let ids = req.body?.imageIds;
        if (!ids) return res.redirect('/images');
        if (!Array.isArray(ids)) ids = [ids];
        if (ids.length === 0) return res.redirect('/images');
        let remaining = ids.length;
        let errors = [];
        ids.forEach((id) => {
            const imageId = id.indexOf(':') > 0 ? id.split(':')[1] : id;
            docker.getImage(imageId).remove({force: true}, (err) => {
                if (err) errors.push(err.json?.message || err.message);
                remaining--;
                if (remaining === 0) {
                    if (errors.length > 0) {
                        res.status(400).json({message: errors[0], errors: errors});
                    } else {
                        res.json({success: true});
                    }
                }
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

                    const onFinished = (err, output) => {
                        if (err) {
                            console.log(err);
                        }
                        socket.emit('end');
                    };

                    const onProgress = (event) => {
                        if (event.id) {
                            socket.emit('show',
                                event.status + ':' + event.id + '\n');
                        } else {
                            socket.emit('show', event.status + '\n');
                        }
                        if (event.progress) {
                            socket.emit('show', event.progress + '\n');
                        }
                    };

                    docker.modem.followProgress(stream, onFinished, onProgress);
                }

            });
        });
    });
    return router;
};
module.exports = returnImagesRouter;
