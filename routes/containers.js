var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var fs = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}
var docker = new Docker({ socketPath: socket });

/* GET users listing. */
router.get('/', function (req, res, next) {
  docker.listContainers({ all: true }, function (err, containers) {
    res.locals.formatName = function (str) {
      return str[0].split('/')[1];
    }
    res.render('containers',
      {
        containers: containers
      });
  });
});

router.get('/start/:id', function (req, res, next) {
  var container = docker.getContainer(req.params.id);
  container.start(function (err, data) {
    res.redirect('/containers');
  });
});

router.get('/stop/:id', function (req, res, next) {
  var container = docker.getContainer(req.params.id);
  container.stop(function (err, data) {
    res.redirect('/containers');
  });
});

router.get('/remove/:id', function (req, res, next) {
  var container = docker.getContainer(req.params.id);
  container.remove(function (err, data) {
    res.redirect('/containers');
  });
});

router.get('/attach/:id', function (req, res, next) {
  res.render('terminal');
});
module.exports = router;
