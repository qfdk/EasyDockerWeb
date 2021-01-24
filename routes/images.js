var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();

var returnImagesRouter = function (io) {
    /* GET users listing. */
    router.get('/', function (req, res, next) {
        docker.listImages(function (err, listImages) {
            res.locals.imageName = function (str) {
                if (str) {
                    if (str.length != 0) {
                        return str[0].split(':')[0];
                    }
                }
                return str;
            }
            res.locals.imageTag = function (str) {
                if (str) {
                    if (str.length != 0) {
                        return str[0].split(':')[1];
                    }
                }
                return str;
            }
            res.locals.imageSize = function (str) {
                var newSiez = parseInt(str, 10);
                var str = (newSiez / 1000 / 1000).toFixed(2).toString().substring(0, 4);
                if (str.indexOf('.') == 3) {
                    return str.split('.')[0];
                }
                return str;
            }
            res.render('images', {
                images: listImages
            })
        });
    });

    router.get('/remove/:id', function (req, res, next) {
        var imageId = req.params.id;
        if (imageId.indexOf(":") > 0) {
            imageId = imageId.split(":")[1];
        }
        var image = docker.getImage(imageId);
        image.remove({force: true}, function (err, data) {
            if (err) {
                res.render('error', {error: err, message: err.json.message});
            } else {
                res.redirect('/images');
            }
        });
    });

    router.get('/search/:name', function (req, res, next) {
        var name = req.params.name;
        docker.searchImages({term: name}, function (err, data) {
            if (err) throw err;
            res.json(data);
        });
    });
    io.on('connection', function (socket) {
        socket.on('pull', function (imageName, w, h) {
            docker.pull(imageName, function (err, stream) {
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
                            socket.emit('show', event.status + ':' + event.id + '\n');
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
