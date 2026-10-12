const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.firebase', 'admin-public');
const files = ['admin/index.html', 'admin/admin.css', 'admin/admin.js',
  'fit-and-you.webflow.io/images/kaizen-logo.png', 'fit-and-you.webflow.io/images/favicon.png'];
for (const file of files) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, file), target);
}
console.log('Prepared five public dashboard files. Server code and credentials are excluded.');
