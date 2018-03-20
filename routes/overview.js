var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();
/* GET home page. */
router.get('/', function (req, res, next) {
  docker.info(function (err, info) {
    if (err) {
      res.render('error', {
        message: "Docker is running ?"
      });
    }
    res.render('overview', {
      info: info
    });
  });
});

module.exports = router;
