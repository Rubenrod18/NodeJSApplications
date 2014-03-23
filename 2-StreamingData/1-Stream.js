var fs = require('fs'); // File System Module
// We create a stream of read for the file helloworld.txt
var stream = fs.createReadStream('helloworld.txt');

// Function that shows the bytes of the helloworld.txt
stream.on('data', function (chunk) {
  console.log(chunk);
});

// Function that shows the message: finished.
stream.on('end', function () {
  console.log('finished');
});
