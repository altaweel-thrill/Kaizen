const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 8765);
const host = process.env.HOST || '127.0.0.1';
const publicFolders = new Set([
  'admin',
  'fit-and-you.webflow.io', 'assets-global.website-files.com',
  'cdn.prod.website-files.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com',
  'd3e54v103j8qbb.cloudfront.net', 'ajax.googleapis.com',
  'fonts.gstatic.com', 'fonts.googleapis.com', 'unpkg.com',
]);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const server = http.createServer((req, res) => {
  const reject = (code) => { res.writeHead(code); res.end(http.STATUS_CODES[code]); };
  if (!['GET', 'HEAD'].includes(req.method)) return reject(405);
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return reject(400); }
  const segments = pathname.split('/').filter(Boolean);
  if (segments.some(segment => segment.startsWith('.') || segment.includes('\\') || segment.includes('\0'))) return reject(403);
  if (!segments.length) segments.push('index.html');
  if (segments[0] !== 'index.html' && !publicFolders.has(segments[0])) return reject(404);
  if ((pathname.endsWith('/') || (segments.length === 1 && segments[0] === 'admin')) && segments[0] !== 'index.html') segments.push('index.html');
  const file = path.resolve(root, ...segments);
  if (!file.startsWith(root + path.sep)) return reject(403);
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) return reject(404);
    const headers = {
      'Content-Type': mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes',
    };
    let start = 0, end = stat.size - 1;
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) return reject(416);
      if (!match[1]) start = Math.max(0, stat.size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
      if (start > end || start >= stat.size) {
        res.setHeader('Content-Range', `bytes */${stat.size}`);
        return reject(416);
      }
      headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length'] = stat.size ? end - start + 1 : 0;
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === 'HEAD' || !stat.size) return res.end();
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Stop the previous local server and run npm run dev again.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Kaizen Fitness listening on ${host}:${port}\nLocal preview: http://localhost:${port}`));
