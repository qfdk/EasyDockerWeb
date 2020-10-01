const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker();

/* GET  overview. */
router.get('/overview', (req, res, next) => {
    docker.info((err, info) => {
        if (err) {
            res.json({
                msg: "error",
                message: "Docker is running ?"
            });
        } else {
            res.json(info);
        }
    });
});

/**
 * containers list
 */
router.get('/containers', (req, res, next) => {
    docker.listContainers({all: true}, (err, containers) => {
        res.json(containers);
    });
});

router.get('/containers/start/:id', (req, res, next) => {
    const container = docker.getContainer(req.params.id);
    container.start((err, data) => {
        if (!err) {
            res.json({
                code: 200,
                msg: 'OK'
            })
        } else {
            res.json({
                code: 400,
                msg: err.toString()
            })
        }
    });
});

router.get('/containers/stop/:id', (req, res, next) => {
    const container = docker.getContainer(req.params.id);
    container.stop((err, data) => {
        if (!err) {
            res.json({
                code: 200,
                msg: 'OK'
            })
        } else {
            res.json({
                code: 400,
                msg: err.toString()
            })
        }
    });
});

router.get('/containers/remove/:id', (req, res, next) => {
    const container = docker.getContainer(req.params.id);
    container.remove({force: true}, (err, data) => {
        if (!err) {
            res.json({
                code: 200,
                msg: 'OK'
            })
        } else {
            res.json({
                code: 400,
                msg: err.toString()
            })
        }
    });
});

router.get('/images', (req, res, next) => {
    docker.listImages(null, (err, listImages) => {
        if (err) {
            res.json(err);
        } else {
            res.json(listImages);
        }
    });
});

router.get('/images/remove/:id', (req, res, next) => {
    let imageId = req.params.id;
    if (imageId.indexOf(":") > 0) {
        imageId = imageId.split(":")[1];
    }
    const image = docker.getImage(imageId);
    image.remove({force: true}, (err, data) => {
        if (err) {
            res.json(err);
        } else {
            res.json(data);
        }
    });
});

router.get('/search/:name', (req, res, next) => {
    const name = req.params.name;
    docker.searchImages({term: name}, (err, data) => {
        if (err) throw err;
        res.json(data);
    });
});

module.exports = router;
