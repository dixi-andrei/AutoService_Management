const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server works!');
});

server.listen(9999, () => {
    console.log('Test server running on port 9999');
});