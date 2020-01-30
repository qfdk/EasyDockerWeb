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
    if(err){
      res.json(err);
    }else{
      res.json(listImages);
    }
  });
});

router.get('/images/remove/:id', function (req, res, next) {
  var imageId = req.params.id;
  if (imageId.indexOf(":") > 0) {
    imageId = imageId.split(":")[1];
  }
  var image = docker.getImage(imageId);
  image.remove({ force: true }, function (err, data) {
    if(err){
      res.json(err);
    }else{
      res.json(data);
    }
  });
});

module.exports = router;
