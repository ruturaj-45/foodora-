const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname);
const targetDir = path.resolve(__dirname, '../../foodora-website');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'package-website.cjs') {
      continue;
    }
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying website files to clean folder...');
copyRecursive(srcDir, targetDir);
console.log('Done! Clean website ready at:', targetDir);
