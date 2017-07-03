'use strict';

const fs = require('fs'),
    html5lint = require('html5-lint'),
    views = require('./package.json').dirs.views;

let viewFiles = fs.readdirSync(__dirname + views)
    .filter(filename => filename.indexOf('.html') > -1);

viewFiles.forEach(filename => {
    getFile(__dirname + views + filename)
    .then(lint)
    .then(logResults)
    .catch(console.error.bind(console));
});

function getFile (path) {
    return new Promise ((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve({html: html, path: path});
            }
        });
    });
}

function lint (fileData) {
    return new Promise((resolve, reject) => {
        html5lint(fileData.html, {service: 'https://validator.w3.org/nu/'}, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve({result: result, path: fileData.path});
            }
        });
    });
}

function logResults (data) {
    let error = false;
    data.result.messages.forEach(msg => {
        if (msg.type === 'error') {
            error = true;
        }
        console.log('\x1b[36mHTML5 Lint [' + msg.type + ']:' + msg.message + ' at ' +
            data.path + '.' + msg.lastLine);
    });

    if (error) {
        console.error('HTML5 Lint failed!\x1b[0m');
        process.exit(1);
    } else {
        console.log('HTML5 Lint passed!\x1b[0m');
        process.exit(0);
    }
}
