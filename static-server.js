// Tiny no-deps static file server for this project
// Usage:
//   1) Open a terminal in this folder (Soil-Search)
//   2) Run: node static-server.js
//   3) Browse: http://localhost:8080

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function safeJoin(root, target) {
    const p = path.join(root, target);
    const rel = path.relative(root, p);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null; // block path traversal
    return p;
}

const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

    const filePath = safeJoin(ROOT, reqPath);
    if (!filePath) {
        res.writeHead(400);
        res.end('Bad Request');
        return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        if (stat.isDirectory()) {
            // Try to serve index.html inside the directory
            const idx = path.join(filePath, 'index.html');
            fs.readFile(idx, (e, data) => {
                if (e) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
            });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const type = types[ext] || 'application/octet-stream';
        fs.readFile(filePath, (e, data) => {
            if (e) {
                res.writeHead(500);
                res.end('Internal Server Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': type });
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}`);
});
