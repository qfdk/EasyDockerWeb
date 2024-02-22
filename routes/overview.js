const express = require('express');
const router = express.Router();
const Docker = require('dockerode');
const docker = new Docker();
/* GET home page. */
const returnOverviewRouter = (io) => {
    router.get('/', (req, res, next) => {
        docker.info((err, info) => {
            // console.log(info)
            if (err) {
                res.render('error', {
                    message: 'Docker is running ?',
                    error: err
                });
            } else {
                res.render('overview', {
                    info: info
                });
            }
        });
    });

    return router;
};

module.exports = returnOverviewRouter;
