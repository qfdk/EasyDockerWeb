const router = require('express').Router();
const io = require('socket.io')();

const api = require('./api');
const overview = require('./overview');
const containers = require('./containers')(io);
const images = require('./images')(io);


router.use('/overview', overview);
router.use('/api', api);
router.use('/images', images);
router.use('/containers', containers);

module.exports = router;
