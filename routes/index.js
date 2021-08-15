const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.redirect('/overview');
});

router.get('/logout', (req, res, next) => {
    req.session.isLogin = false;
    res.locals.isLogin = false;
    res.redirect('/');
});

module.exports = router;
