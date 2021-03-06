var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/');
var grid = require('./routes/grid');
var updates = require('./routes/updates');
var pipeline = require('./routes/pipeline');
//var pipelineblog = require('./routes/pipelineblog');
var users = require('./routes/users');
var ejstest = require('./routes/ejstest');
//var c1alpha = require('./routes/c1alpha');
var c1alpha2 = require('./routes/c1alpha2');
var mlbSchedule = require('./routes/mlbSchedule');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/grid', grid);
app.use('/users', users);
app.use('/ejstest', ejstest);
app.use('/updates', updates);
app.use('/pipeline', pipeline);
//app.use('/c1alpha', c1alpha);
app.use('/c1alpha2', c1alpha2);
//app.use('/pipeline-blog', pipelineblog);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
