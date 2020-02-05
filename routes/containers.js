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
    container.remove({ force: true }, function (err, data) {
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
      HostConfig: {
        PortBindings: {}
      }
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
      options['ExposedPorts'] = JSON.parse('{"' + src + '": {}}');
      var tmp = '{ "' + src + '": [{ "HostPort":"' + dis + '" }]}';
      options.HostConfig.PortBindings = JSON.parse(tmp);
    }

    if (req.body.containerCmd != "") {
      options.Cmd = ['/bin/bash', '-c', req.body.containerCmd];
      // console.log(options)
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
        //Cmd: ['/bin/bash'],
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

    // var exp = {
    //   "read": "0001-01-01T00:00:00Z",
    //   "preread": "0001-01-01T00:00:00Z",
    //   "pids_stats": {},
    //   "blkio_stats": {
    //     "io_service_bytes_recursive": null,
    //     "io_serviced_recursive": null,
    //     "io_queue_recursive": null,
    //     "io_service_time_recursive": null,
    //     "io_wait_time_recursive": null,
    //     "io_merged_recursive": null,
    //     "io_time_recursive": null,
    //     "sectors_recursive": null
    //   },
    //   "num_procs": 0,
    //   "storage_stats": {},
    //   "cpu_stats": {
    //     "cpu_usage": {
    //       "total_usage": 0,
    //       "usage_in_kernelmode": 0,
    //       "usage_in_usermode": 0
    //     },
    //     "throttling_data": {
    //       "periods": 0,
    //       "throttled_periods": 0,
    //       "throttled_time": 0
    //     }
    //   },
    //   "precpu_stats": {
    //     "cpu_usage": {
    //       "total_usage": 0,
    //       "usage_in_kernelmode": 0,
    //       "usage_in_usermode": 0
    //     }, "throttling_data": { "periods": 0, "throttled_periods": 0, "throttled_time": 0 }
    //   }, "memory_stats": {}, "name": "/nervous_jang", "id": "ab61765a4d91bc6c68779508dfe75774da3717c539f9d9b5002379c83939c7e7"
    // }

    socket.on('getSysInfo', function (id) {
      var container = docker.getContainer(id);
      container.stats(function (err, stream) {
        if (!err && stream != null) {
          stream.on('data', function (data) {
            socket.emit(id, data.toString('utf8'));
          });
          stream.on('end', function () {
            socket.emit('end', 'ended');
            stream.destroy();
          });
        }
      });
    });

    socket.on('end', function () {
      array = [];
      streams.map((stream) => {
        stream.destroy();
      });
      console.log('--------end---------');

    });

    var array = [];
    var streams = [];

    socket.on('getContainersInfo', function (id) {
      if (array.indexOf(id) === -1) {
        array.push(id);
        console.log("socket.io => getContainersInfo " + id);
        var container = docker.getContainer(id);
        container.stats(function (err, stream) {
          streams.push(stream);
          if (!err && stream != null) {
            stream.on('data', function (data) {
              const toSend = JSON.parse(data.toString('utf8'));
              socket.emit("containerInfo", toSend);
            });
            stream.on('end', function () {
              socket.emit('end', 'ended');
              stream.destroy();
            });
          }
        });
      }

    });

  });


  return router;
}

module.exports = returnContainersRouter;
