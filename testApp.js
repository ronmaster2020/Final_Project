const http = require('http');

const hostname = 'localhost';
const port = 8080; // Change this to your server's port

const http = require('http');
const data = JSON.stringify({
  // Your data here
  productId: "66719f69517941b7eacee2c3"
});

const options = {
  // Your options here, including method, hostname, etc.
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
  res.on('error', (e) => {
    console.error(`Response error: ${e.message}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();