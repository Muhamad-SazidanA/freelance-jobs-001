import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.resolve('public/images');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (/\.(jpe?g|png|webp)$/i.test(file)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function optimizeImages() {
  const files = getAllFiles(IMAGES_DIR);
  console.log(`Menemukan ${files.length} gambar untuk diperiksa...`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let optimizedCount = 0;

  for (const filePath of files) {
    const stat = fs.statSync(filePath);
    const originalSize = stat.size;
    totalOriginal += originalSize;

    // Lewati file yang sudah sangat kecil (< 30KB)
    if (originalSize < 30 * 1024) {
      totalOptimized += originalSize;
      continue;
    }

    try {
      const inputBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const meta = await sharp(inputBuffer).metadata();
      const currentWidth = meta.width || 1200;

      // Tentukan target lebar maksimum berdasarkan tipe gambar
      let maxWidth = 1600;
      if (filePath.includes('Five_Ways_Of_Working') || filePath.includes('feature-shot') || filePath.includes('cegar-overstanding')) {
        maxWidth = 900;
      } else if (filePath.includes('article-thumb-') || filePath.includes('logo')) {
        maxWidth = 800;
      }

      let pipeline = sharp(inputBuffer);
      if (currentWidth > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
      }

      let outBuffer;
      if (ext === '.webp') {
        outBuffer = await pipeline.webp({ quality: 82, effort: 5 }).toBuffer();
      } else if (ext === '.jpg' || ext === '.jpeg') {
        outBuffer = await pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
      } else if (ext === '.png') {
        outBuffer = await pipeline.png({ quality: 85, compressionLevel: 8 }).toBuffer();
      }

      if (outBuffer && outBuffer.length < originalSize) {
        fs.writeFileSync(filePath, outBuffer);
        const saved = originalSize - outBuffer.length;
        const pct = ((saved / originalSize) * 100).toFixed(1);
        console.log(`[OK] ${path.relative('public', filePath)}: ${(originalSize / 1024).toFixed(0)}KB -> ${(outBuffer.length / 1024).toFixed(0)}KB (-${pct}%)`);
        totalOptimized += outBuffer.length;
        optimizedCount++;
      } else {
        totalOptimized += originalSize;
      }
    } catch (err) {
      console.error(`[ERR] Gagal optimasi ${filePath}:`, err.message);
      totalOptimized += originalSize;
    }
  }

  const savedMb = ((totalOriginal - totalOptimized) / (1024 * 1024)).toFixed(2);
  const totalPct = (((totalOriginal - totalOptimized) / totalOriginal) * 100).toFixed(1);
  console.log(`\n========================================`);
  console.log(`Selesai! ${optimizedCount} gambar berhasil dioptimasi.`);
  console.log(`Total ukuran awal: ${(totalOriginal / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total ukuran baru: ${(totalOptimized / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total penghematan: ${savedMb} MB (-${totalPct}%)`);
  console.log(`========================================\n`);
}

optimizeImages();
