var http = require('http'),
    fs = require('fs'),
    accessLog = require('access-log'),
    port = process.env.APP_PORT || 8080;

http.createServer(function (request, response) {
    accessLog(request, response);
    request.on('error', function(err) {
        console.error(err);
        response.statusCode = 400;
        response.end();
    });
    response.on('error', function(err) {
        console.error(err);
    });
    console.log(request.method, request.url);
    var mimeMap = {
        '.html' : 'text/html',
        '.json' : 'application/json',
        '.js'   : 'application/js',
        '.jpg'  : 'image/jpeg',
        '.png'  : 'image/png',
        '.css'  : 'text/css'
    };

    if (request.method === 'GET') {
        if (request.url === '/') {
            fs.readFile(__dirname + '/src/views/index.html', function (err, index) {
                if (err) {
                    console.log('Error retrieving asset:', err);
                    response.statusCode = 404;
                    response.end('Not found');
                } else {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(index);
                    response.end();
                }
            });
        } else if (request.url === '/proto') {
            //TODO This is temporary
            fs.readFile(__dirname + '/src/views/proto.html', function (err, index) {
                if (err) {
                    console.log('Error retrieving asset: ', err);
                    response.statusCode = 404;
                    response.end('Not found');
                } else {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(index);
                    response.end();
                }
            });
        } else if (request.url === '/grid') {
            console.log('request for GRID');
            //TODO This is temporary
            fs.readFile(__dirname + '/src/views/grid.html', function (err, index) {
                if (err) {
                    console.log('Error retrieving asset: ', err);
                    response.statusCode = 404;
                    response.end('Not found');
                } else {
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(index);
                    response.end();
                }
            });
        } else {
            var filename = request.url.substring(request.url.lastIndexOf('/') + 1),
                extension = filename.substring(filename.indexOf('.'));
            fs.readFile(__dirname + request.url, function (err, asset) {
                if (err) {
                    console.log('Error retrieving asset: ', err);
                    response.statusCode = 404;
                    response.end('Not found');
                } else {
                    response.writeHead(200, {'Content-Type': mimeMap[extension]});
                    response.write(asset);
                    response.end();
                }
            });
        }
    } else {
        response.statusCode = 403;
        response.end('Forbidden');
    }

}).listen(port);

console.log('Server listening on ', port, '...');
