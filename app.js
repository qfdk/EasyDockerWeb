const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');

const {checkUser} = require('./middlewares/security');

const io = require('socket.io')();
const favicon = require('serve-favicon');
app.io = io;

const index = require('./routes/index');
const api = require('./routes/api');
const overview = require('./routes/overview')(io);
const containers = require('./routes/containers')(io);
const images = require('./routes/images')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(session({
    saveUninitialized: true,
    resave: false,
    secret: 'easy-docker-web',
    cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        expires: false
    }
}));

// public files
app.use('/static', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200); /* speedup options */
    } else {
        next();
    }
});

app.use(checkUser);
app.use(function (req, res, next) {
    res.locals.isLogin = req.session.isLogin || false;
    next();
});
app.use('/', index);
app.use('/api', api);
app.use('/overview', overview);
app.use('/containers', containers);
app.use('/images', images);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
