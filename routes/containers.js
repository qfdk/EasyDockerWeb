var express = require('express');
var router = express.Router();
var Docker = require('dockerode');

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

  // todo
  router.post('/create', function (req, res, next) {
    var options = {
      Image: req.body.containerImage,
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ['bash'],
      OpenStdin: false,
      StdinOnce: false
    }

    // docker.run(options.Image,options.Cmd, [process.stdout, process.stderr], {Tty:true}, function (err, data, container) {
    //   console.log(data.StatusCode);
    //   res.redirect("/containers/run/" + container.id);
    // });

    // // docker.run(options, function (err, container) {
    // //   res.redirect("/containers/run/" + container.id);
    // // });

  });

  router.get('/console/:id', function (req, res, next) {
    res.render('terminal');
  });

  router.get('/run/:id', function (req, res, next) {
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

    // todo
    socket.on('attach', function (id, w, h) {
      var container = docker.getContainer(id);
      container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
        var dimensions = { h, w };

        if (dimensions.h != 0 && dimensions.w != 0) {
          container.resize(dimensions, () => { });
        }

        stream.on('readable', (data) => {
          // there is some data to read now
          console.log(data)
        });
        stream.on('data', (chunk) => {
          console.log(chunk.toString())
          socket.emit('show', chunk.toString());
        });

        socket.on('cmd', (data) => {
          console.log(data)
          stream.write(data);
        });
      });


    });
  });
  return router;
}

module.exports = returnContainersRouter;
