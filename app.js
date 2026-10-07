require('dotenv').config({quiet: true});

const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const {Server} = require('socket.io');

const crypto = require('crypto');
const {assertCredentialsConfigured, checkUser, checkSocket} = require('./middlewares/security');

assertCredentialsConfigured();

// Same-origin only: no cross-origin access to the Docker control socket.
const io = new Server();
const favicon = require('serve-favicon');
app.io = io;

const index = require('./routes/index');
const api = require('./routes/api');
const overview = require('./routes/overview');
const containers = require('./routes/containers')(io);
const images = require('./routes/images')(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

const sessionMiddleware = session({
    saveUninitialized: false,
    resave: false,
    // Never use a hard-coded secret: take it from the environment or generate one per start.
    secret: process.env.EDW_SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    cookie: {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.EDW_COOKIE_SECURE === 'true',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
});
app.use(sessionMiddleware);

// Share the Express session with Socket.IO and reject unauthenticated sockets
// (container exec / attach / image pull were previously reachable without login).
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
io.use(checkSocket);

// public files
app.use('/static', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(checkUser);
app.use((req, res, next) => {
    res.locals.isLogin = req.session.isLogin || false;
    next();
});
app.use('/', index);
app.use('/api', api);
app.use('/overview', overview);
app.use('/containers', containers);
app.use('/images', images);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
