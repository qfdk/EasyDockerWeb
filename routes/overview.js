var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();
/* GET home page. */
var returnOverviewRouter = function (io) {

  router.get('/', function (req, res, next) {
    docker.info(async function (err, info) {
      if (err) {
        res.render('error', {
          message: "Docker is running ?"
        });
      } else {

        // docker.listContainers({ all: true }, function (err, containers) {

        //   for (var i = 0; i < containers.length; i++) {
        //     docker.getContainer(containers[i].Id)
        //       .stats(function (err, stream) {
        //         stream.on('data', function (data) {
        //           console.log(data.toString('utf8'));
        //         });
        //       });
        //   }


        // });

        res.render('overview', {
          info: info
        });
      }
    });
  });

  io.on('connection', function (socket) {

    socket.on('getCPU', function (id) {
      var container = docker.getContainer(id);
      container.stats(function (err, stream) {

        stream.on('data', function (data) {
          socket.emit('cpu', data.toString('utf8'));
        });

        stream.on('end', function () {
          socket.emit('end', 'ended');
          stream.destroy();
        });
      });
    });
  });
  return router;
}

module.exports = returnOverviewRouter;
