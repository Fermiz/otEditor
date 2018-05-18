var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('otEditor');
var socketIO = require('socket.io');
var Changeset = require('changesets').Changeset;
var dmpmod = require('diff-match-patch');
var dmp = new dmpmod.diff_match_patch();

var config = require('./config');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.post('/upload', function(req, res) {
    var tmp_path = req.files.upload_file.path;
    var target_path = path.resolve('./public/images', req.files.upload_file.name);
    fs.rename(tmp_path, target_path, function(err) {
        if (err) throw err;
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send({
                success: true,
                file_path: './public/images/' + req.files.upload_file.name
            });
        });
    });
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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

var appServer = http.createServer(app);
var io = socketIO.listen(appServer);

var content = "This is a content!";

function computeChanges(revA, revB){
    var diff = dmp.diff_main(revA, revB);
    return Changeset.fromDiff(diff);
}

function OperationalTransformation(originalText, newText){
    var changes = computeChanges(originalText, newText)
    content = changes.apply(originalText);
    console.log(content);
    return content;
}

io.sockets.on('connection', function (socket) {
    console.log("connected");

    socket.on('init', function () {
        socket.emit('updateContent', content);
    });

    socket.on('contentChanged', function (data) {
        socket.broadcast.emit('updateContent', OperationalTransformation(content, data));
    });
});

appServer.listen(config.port, function() {
  console.log('otEditor server listening on port ', config.port);
  debug('otEditor server listening on port ' + config.port);
});

module.exports = appServer;
