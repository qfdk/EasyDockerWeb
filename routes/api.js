var express = require('express');
var router = express.Router();
var Docker = require('dockerode');
var docker = new Docker();

/* GET  overview. */
router.get('/overview', function (req, res, next) {
  docker.info(function (err, info) {
    if (err) {
      res.json({
        msg: "error",
        message: "Docker is running ?"
      });
    } else {
      res.json(info);
    }
  });
});

/**
 * containers list
 */
router.get('/containers', function (req, res, next) {
  docker.listContainers({ all: true }, function (err, containers) {
    res.json(containers);
  });
});

router.get('/containers/start/:id', function (req, res, next) {
  var container = docker.getContainer(req.params.id);
  container.start(function (err, data) {
   if(!err){
     res.json({
       code:200,
       msg:'OK'
     })
   }else{
     res.json({
       code:400,
       msg:err.toString()
     })
   }
  });
});

router.get('/containers/stop/:id', function (req, res, next) {
  var container = docker.getContainer(req.params.id);
  container.stop(function (err, data) {
   if(!err){
     res.json({
       code:200,
       msg:'OK'
     })
   }else{
     res.json({
       code:400,
       msg:err.toString()
     })
   }
  });
});

router.get('/containers/remove/:id', function (req, res, next) {
  var container = docker.getContainer(req.params.id);
  container.remove({ force: true }, function (err, data) {
   if(!err){
     res.json({
       code:200,
       msg:'OK'
     })
   }else{
     res.json({
       code:400,
       msg:err.toString()
     })
   }
  });
});



router.get('/images', function (req, res, next) {
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
    res.json(listImages);
  });
});

module.exports = router;
