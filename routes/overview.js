var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();
/* GET home page. */
var returnOverviewRouter = function (io) {

  router.get('/', function (req, res, next) {
    docker.info(function (err, info) {
      // console.log(info)
      if (err) {
        res.render('error', {
          message: "Docker is running ?"
        });
      } else {
        res.render('overview', {
          info: info
        });
      }
    });
  });
  return router;
}

module.exports = returnOverviewRouter;
