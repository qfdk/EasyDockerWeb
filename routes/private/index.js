const router = require('express').Router();
const io = require('socket.io')();

const api = require('./api');
const dashboard = require('./dashboard');
const containers = require('./containers')(io);
const images = require('./images')(io);


router.use('/dashboard', dashboard);
router.use('/api', api);
router.use('/images', images);
router.use('/containers', containers);

module.exports = router;
