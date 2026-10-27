import fs from 'fs';
import path from 'path';

function checkDir(dir) {
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (full.endsWith('.astro') || full.endsWith('.tsx') || full.endsWith('.jsx')) {
      const text = fs.readFileSync(full, 'utf8');
      if (text.includes('loading="lazy"') || text.includes("loading='lazy'")) {
        console.log('Found lazy loading in:', full);
      }
    }
  }
}
checkDir('src');
console.log('Scan complete.');
