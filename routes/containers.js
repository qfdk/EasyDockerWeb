var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var stream = require('stream');

var docker = new Docker();
var returnContainersRouter = function (io) {
  /* GET containers. */
  router.get('/', function (req, res, next) {
    docker.listContainers({ all: true }, function (err, containers) {
      res.locals.formatName = function (str) {
        return str[0].split('/')[1];
      }
      docker.listImages(function (err, listImages) {
        res.render('containers',
          {
            containers: containers,
            images: listImages
          });
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

  router.post('/create', function (req, res, next) {

    var options = {
      Image: req.body.containerImage,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
    }

    if (req.body.containerVolumeSource !== "" && req.body.containerVolumeDistination !== "") {
      var src = req.body.containerVolumeSource;
      var dis = req.body.containerVolumeDistination;
      options.Volumes = {
        dis: {}
      };
      options.HostConfig = {
        'Binds': [src + ':' + dis]
      }
    }

    if (req.body.containerCmd) {
      options.Cmd = ['/bin/bash', '-c', req.body.containerCmd];
      docker.createContainer(options, function (err, container) {
        container.start(function (err, data) {
          res.redirect('/containers/logs/' + container.id);
        });
      });
    } else {
      var runOpt = {
        Image: req.body.containerImage,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash'],
        OpenStdin: false,
        StdinOnce: false
      };
      runOpt['Volumes'] = options.Volumes;
      runOpt['HostConfig'] = options.HostConfig;
      docker.createContainer(runOpt).then(function (container) {
        return container.start();
      }).then(function (container) {
        res.redirect('/containers');
      })
    }

  });

  router.get('/console/:id', function (req, res, next) {
    res.render('terminal');
  });

  router.get('/logs/:id', function (req, res, next) {
    res.render('logs');
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
          socket.emit('end', 'ended');
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

    socket.on('attach', function (id, w, h) {
      var container = docker.getContainer(id);
      var logs_opts = {
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true
      };
      // var attach_opts = {
      //   stream: true,
      //   stdin: true,
      //   stdout: true,
      //   stderr: true
      // };
      function handler(err, stream) {
        stream.on('data', function (chunk) {
          socket.emit('show', chunk.toString('utf8'));
        });
        stream.on('end', function () {
          socket.emit('end', 'ended');
        });
      }
      container.logs(logs_opts, handler);
      //container.attach(attach_opts, handler);
    });
  });

  return router;
}

module.exports = returnContainersRouter;
