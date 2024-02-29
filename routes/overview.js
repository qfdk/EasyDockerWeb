const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker();

router.get('/', async (req, res, next) => {
    try {
        const info = await docker.info();
        return res.render('overview', {
            info: info
        });
    } catch (error) {
        return res.render('error', {
            message: "Docker is running ?",
            error
        });
    }
});

module.exports = router;
