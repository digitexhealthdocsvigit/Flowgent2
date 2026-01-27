// Health check for Agent Zero service
import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3001,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Agent Zero health check passed');
    process.exit(0);
  } else {
    console.log(`Agent Zero health check failed with status code: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log(`Agent Zero health check failed: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Agent Zero health check timed out');
  process.exit(1);
});

req.end();