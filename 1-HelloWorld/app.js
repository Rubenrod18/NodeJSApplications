/*
 * First, we'll need create a HTTP server.
 */
var http = require('http'); // HTTP Module.

/*
 * We'll create the server and also, a function callback
 * that it will have a request(req) and a response (res).
 */
http.createServer(function (req, res) {
  // We are that especific the content type.
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World\n'); // We write the response.
  res.end(); // The method, res.end(), MUST be called on each response.
}).listen(3000); // Listen the server on the port 3000

// Log message that it will show in the console
console.log('Server running at http://localhost:3000/');
