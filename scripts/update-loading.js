import fs from 'fs';

const files = [
  'src/components/home/IntegratedSolutionsSection.astro',
  'src/components/home/TrustRecognition.astro',
  'src/pages/request-demo.astro',
  'src/pages/articles/index.astro',
  'src/pages/articles/category/[slug].astro'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    const matches = content.match(/loading=["']lazy["']/g);
    if (matches && matches.length > 0) {
      // Avoid duplicate decoding="async" if already present
      content = content.replace(/loading=["']lazy["'](\s+decoding=["']async["'])?/g, 'loading="eager" decoding="async"');
      fs.writeFileSync(f, content, 'utf8');
      console.log(`Updated ${f}: replaced ${matches.length} occurrences`);
    }
  }
}
