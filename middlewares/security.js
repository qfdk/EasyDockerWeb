const checkUser = (req, res, next) => {
    res.locals.isLogin = false;
    if (req.session.isLogin) {
        res.locals.isLogin = true;
        next();
    } else {
        const username = process.env.EDW_USERNAME,
            password = process.env.EDW_PASSWORD;
        if (req.body.username === username && req.body.password === password) {
            req.session.isLogin = true;
            res.redirect('/');
        } else {
            res.render('login');
        }
    }
};

module.exports = {
    checkUser
};
