var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();

/* GET  overview. */
router.get('/overview', function (req, res, next) {
  docker.info(function (err, info) {
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
router.get('/containers', function (req, res, next) {
  docker.listContainers({ all: true }, function (err, containers) {
    res.json(containers);
  });
});

module.exports = router;
