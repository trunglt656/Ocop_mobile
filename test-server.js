const fs = require('fs');

// Test if we can write to a log file
fs.writeFileSync('api-test.log', 'API server starting...\n');

// Simple test to verify server is working
const http = require('http');

const server = http.createServer((req, res) => {
  fs.appendFileSync('api-test.log', `Request: ${req.method} ${req.url}\n`);

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Test API is running',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }

  fs.appendFileSync('api-test.log', `Response: ${res.statusCode}\n`);
});

server.listen(5000, () => {
  fs.appendFileSync('api-test.log', 'Server listening on port 5000\n');
  console.log('Test server running on port 5000');
});
