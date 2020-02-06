const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var app = express();
var io = require('socket.io')();
var favicon = require('serve-favicon');
app.io = io;

var index = require('./routes/index');
var api = require('./routes/api');
var overview = require('./routes/overview')(io);
var containers = require('./routes/containers')(io);
var images = require('./routes/images')(io);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
// public files
app.use('/static', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.send(200); /* speedup options */
  }
  else {
    next();
  }
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
