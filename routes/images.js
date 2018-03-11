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
  docker.listImages({ all: true }, function (err, listImages) {
    console.log(listImages);
    res.locals.imageName = function (str) {
      if (str) {
        if (str.lenght != 0) {
          return str[0].split(':')[0];
        }
      }
      return str;
    }
    res.locals.imageTag = function (str) {
      if (str) {
        if (str.lenght != 0) {
          return str[0].split(':')[1];
        }
      }
      return str;
    }
    res.locals.imageSize = function (str) {
      var newSiez = parseInt(str, 10);
      var str = (newSiez / 1000 / 1000).toFixed(2).toString().substring(0, 4);
      if (str.indexOf('.') == 3) {
        return str.split('.')[0];
      }
      return str;
    }
    res.render('images', {
      images: listImages
    })
  });
});

router.get('/remove/:id', function (req, res, next) {
  var image = docker.getImage(req.params.id);
  image.remove(function (err, data) {
    if (!err) {
      res.redirect('/images');
    }
  });
});

module.exports = router;
