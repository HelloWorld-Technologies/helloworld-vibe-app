#!/usr/bin/env node
/**
 * Aggressive compression for large bundled illustrations.
 * - PNG >= MIN_BYTES: convert to WebP (sharp truecolor PNG re-encode often grows files)
 * - JPEG: mozjpeg quality + optional resize
 */
const fs = require('fs');
const path = require('path');

const WEBP_QUALITY = 85;
const JPEG_QUALITY = 80;
const MAX_DIMENSION = 1600;
const MIN_BYTES = 100 * 1024;

const projectRoot = path.join(__dirname, '..');
const bundledRoot = path.join(projectRoot, 'assets', 'bundled');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function formatBytes(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / (1024 * 1024)).toFixed(2)}MB`;
}

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('[compress-illustrations] sharp is required. Install with: npm i -D sharp');
    process.exit(1);
  }

  const results = [];

  for (const filePath of walk(bundledRoot)) {
    const ext = path.extname(filePath).toLowerCase();
    const before = fs.statSync(filePath).size;
    const rel = path.relative(projectRoot, filePath);

    try {
      if (ext === '.png' && before >= MIN_BYTES) {
        const webpPath = filePath.replace(/\.png$/i, '.webp');
        const tmpPath = `${webpPath}.tmp`;
        await sharp(filePath, { failOn: 'none' })
          .webp({ quality: WEBP_QUALITY })
          .toFile(tmpPath);
        const after = fs.statSync(tmpPath).size;
        if (after < before) {
          fs.renameSync(tmpPath, webpPath);
          fs.unlinkSync(filePath);
          results.push({ rel, before, after, action: 'png→webp' });
        } else {
          fs.unlinkSync(tmpPath);
        }
      } else if (ext === '.jpg' || ext === '.jpeg') {
        const meta = await sharp(filePath).metadata();
        let pipeline = sharp(filePath, { failOn: 'none' });
        const needsResize =
          (meta.width && meta.width > MAX_DIMENSION) ||
          (meta.height && meta.height > MAX_DIMENSION);
        if (needsResize) {
          pipeline = pipeline.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
        const tmpPath = `${filePath}.compress-tmp`;
        await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tmpPath);
        const after = fs.statSync(tmpPath).size;
        if (after < before) {
          fs.renameSync(tmpPath, filePath);
          const note = needsResize ? 'jpeg (resized)' : 'jpeg';
          results.push({ rel, before, after, action: note });
        } else if (fs.existsSync(tmpPath)) {
          fs.unlinkSync(tmpPath);
        }
      }
    } catch (err) {
      console.warn(`  ✗ ${rel}: ${err.message}`);
    }
  }

  let totalBefore = 0;
  let totalAfter = 0;
  for (const r of results) {
    totalBefore += r.before;
    totalAfter += r.after;
    const saved = r.before - r.after;
    console.log(
      `  ✓ ${r.rel}: ${formatBytes(r.before)} → ${formatBytes(r.after)} (−${formatBytes(saved)}) [${r.action}]`,
    );
  }

  console.log(
    `[compress-illustrations] ${results.length} files changed. ` +
      `${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (saved ${formatBytes(totalBefore - totalAfter)})`,
  );
}

main();
