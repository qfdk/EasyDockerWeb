var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();

/* GET users listing. */
router.get('/', function (req, res, next) {
  docker.listImages(function (err, listImages) {
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
