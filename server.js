// App Platform supplies PORT. Development remains on localhost:8765 via npm run dev.
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.PORT = process.env.PORT || '8080';
require('./scripts/dev-server.cjs');
