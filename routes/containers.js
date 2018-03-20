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
        console.log(containers[0])
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

  // router.post('/create', function (req, res, next) {

  //   var image = req.body.containerImage;
  //   var containerVolumeSource = req.body.containerVolumeSource;
  //   var containerVolumeDistination = req.body.containerVolumeDistination;
  //   var containerPortSource = req.body.containerPortSource + '/tcp';
  //   var containerPortDistination = req.body.containerPortDistination;
  //   var cmd = req.body.containerCmd;

  //   var options = {};
  //   options['Volumes'] = JSON.parse('{"' + containerVolumeDistination + '": {}}');
  //   options.HostConfig = {
  //     'Binds': [containerVolumeSource + ':' + containerVolumeDistination]
  //   }
  //   var tmp = options;
  // });

  router.post('/create', function (req, res, next) {

    var options = {
      Image: req.body.containerImage,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
    }

    // volume
    if (req.body.containerVolumeSource !== "" && req.body.containerVolumeDistination !== "") {
      var src = req.body.containerVolumeSource;
      var dis = req.body.containerVolumeDistination;
      options['Volumes'] = JSON.parse('{"' + dis + '": {}}');
      options.HostConfig = {
        'Binds': [src + ':' + dis]
      }
    }

    // port
    if (req.body.containerPortSource !== "" && req.body.containerPortDistination !== "") {
      var src = req.body.containerPortSource + '/tcp';
      var dis = req.body.containerPortDistination;
      var tmp = '{ "' + src + '": [{ "HostPort": "' + dis + '" }]}';
      options.HostConfig['PortBindings'] = JSON.parse(tmp);
      options['ExposedPorts'] = JSON.parse('{"' + src + '": {}}');
    }

    if (req.body.containerCmd) {
      options.Cmd = ['/bin/bash', '-c', req.body.containerCmd];
      console.log(options)
      docker.createContainer(options, function (err, container) {
        if (err) throw err
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

      var logStream = new stream.PassThrough();
      logStream.on('data', function (chunk) {
        socket.emit('show', chunk.toString('utf8'));
      });

      var logs_opts = {
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: false
      };
      function handler(err, stream) {
        container.modem.demuxStream(stream, logStream, logStream);
        if (!err && stream) {
          stream.on('end', function () {
            logStream.end('===Logs stream finished===');
            socket.emit('end', 'ended');
            stream.destroy();
          });
        }
      }
      container.logs(logs_opts, handler);
    });
  });

  return router;
}

module.exports = returnContainersRouter;
