var express = require('express');
var router = express.Router();
var Docker = require('dockerode');

var docker = new Docker();
var returnContainersRouter = function (io) {
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

  io.on('connection', function (socket) {
    socket.on('exec', function (id, w, h) {
      var container = docker.getContainer(id);
      var cmd = {
        "AttachStdout": true,
        "AttachStderr": true,
        "AttachStdin": true,
        "Tty": true,
        Cmd: ['/bin/bash']
      }
      container.exec(cmd, (err, exec) => {
        var options = {
          'Tty': true,
          stream: true,
          stdin: true,
          stdout: true,
          stderr: true,
          // fix vim
          hijack: true
        };

        container.wait((err, data) => {
          socket.emit('exec', 'ended');
        });

        if (err) {
          return;
        }

        exec.start(options, (err, stream) => {
          var dimensions = { h, w };
          if (dimensions.h != 0 && dimensions.w != 0) {
            exec.resize(dimensions, () => { });
          }

          stream.on('data', (chunk) => {
            socket.emit('show', chunk.toString());
          });

          socket.on('cmd', (data) => {
            stream.write(data);
          });

        });
      });
    });
  });
  return router;
}

module.exports = returnContainersRouter;
