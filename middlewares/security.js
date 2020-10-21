const checkUser = (req, res, next) => {
    res.locals.isLogin = false;
    if (req.session.isLogin) {
        res.locals.isLogin = true;
        next();
    } else {
        var admin = "admin", password = "admin";
        if (req.body.username === admin && req.body.password === password) {
            req.session.isLogin = true;
            res.redirect('/');
        } else {
            res.render('login');
        }
    }
};

module.exports = {
    checkUser
}