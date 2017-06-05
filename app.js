'use strict';

var http = require('http'),
    fs = require('fs'),
    accessLog = require('access-log'),
    dirs = require('./package.json').dirs,
    port = process.env.APP_PORT || 8080;

function logInfo (info) {
    console.log('\x1b[36m' + info + '\x1b[0m');
}

function logError (err) {
    console.error('\x1b[31m' + err + '\x1b[0m');
}

http.createServer(function (request, response) {
    accessLog(request, response);
    request.on('error', function(err) {
        logError(err);
        response.statusCode = 400;
        response.end();
    });
    response.on('error', function(err) {
        logError(err);
    });
    var mimeMap = {
        '.html' : 'text/html',
        '.json' : 'application/json',
        '.js'   : 'application/js',
        '.jpg'  : 'image/jpeg',
        '.png'  : 'image/png',
        '.css'  : 'text/css',
        '.ico'  : 'image/x-icon'
    };

    if (request.method === 'GET') {
        var filename = request.url.substring(request.url.lastIndexOf('/') + 1),
            extension = filename.indexOf('.') > -1 ? filename.substring(filename.indexOf('.')) : '',
            readStream,
            path;
        if (!extension) { // view
            if (request.url === '/') {
                path = __dirname + dirs.views + '/index.html';
            } else {
                path = __dirname + dirs.views + request.url + '.html';
            }
            readStream = fs.createReadStream(path);
            readStream
                .on('open', function () {
                    response.writeHead(200, {'Content-Type': mimeMap['.html']});
                    readStream.pipe(response);
                })
                .on('error', function (e) {
                    logError(e);
                    response.writeHead(301, {Location: '/'});
                    response.end();
                });
        } else if (extension.match(new RegExp(Object.keys(mimeMap).join('|')))) { // other asset based on permitted mime types
            readStream = fs.createReadStream(__dirname + request.url);
            readStream
                .on('open', function () {
                    response.writeHead(200, {'Content-Type': mimeMap[extension]});
                    readStream.pipe(response);
                })
                .on('error', function (e) {
                    logError(e);
                    response.writeHead(301, {Location: '/'});
                    response.end();
                });
        } else {
            response.statusCode = 403;
            response.end('Forbidden');
        }
    } else {
        response.statusCode = 403;
        response.end('Forbidden');
    }
    logInfo(request.method + ' : ' + request.url + ' -- ' + response.statusCode);

}).listen(port);

logInfo('Server listening on ' + port + '...');
