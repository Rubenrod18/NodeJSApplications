// Built-in http module provides HTTP server and client functionality
var http = require('http');

// Built-in fs module provides filesystem related functionality
var fs = require('fs');

// Built-in path module provides filesystem path related functionality
var path = require('path');

// Add-on mime module provides ability to derive a MIME type based on a filename extension
var mime = require('mime');

// cache object is where the contents of cached files are stored
var cache = {};

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {'Content-Type': mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
  if (cache[absPath]) { // Check if file is cached in memory
    sendFile(response, absPath, cache[absPath]); // Server file from memory
  } else {
    fs.exists(absPath, function (exists) { // Check if file exists
      if (exists) {
        fs.readFile(absPath, function (err, data) { // Read file from disk
          if (err) {
            send404(response);
          } else {
            cache[absPath] = data;
            sendFile(response, absPath, data); // Server file read from disk
          }
        });
      } else {
        send404(response); // Send HTTP 404 response
      } // else
    }); // fs.exist
  } // else
} // serverStatic

var server = http.createServer(function (request, response) {
    var filePath = false;

    if (request.url === '/') {
      filePath = 'public/index.html';
    } else {
      filePath = 'public' + request.url;
    }

    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
  }); // createServer

server.listen(3000, function () {
  console.log('Server listening on port 3000.');
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
