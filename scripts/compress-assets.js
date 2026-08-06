#!/usr/bin/env node
/**
 * Compresses raster images under assets/bundled (and optionally assets/images).
 * - Resizes if either side exceeds MAX_DIMENSION
 * - JPEG: mozjpeg quality
 * - PNG: palette + high compression (keeps alpha)
 * Only replaces a file when the output is smaller.
 *
 * Usage:
 *   node ./scripts/compress-assets.js
 *   node ./scripts/compress-assets.js --include-images
 */
const fs = require('fs');
const path = require('path');

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;

const projectRoot = path.join(__dirname, '..');
const includeImages = process.argv.includes('--include-images');

const roots = [path.join(projectRoot, 'assets', 'bundled')];
if (includeImages) {
  roots.push(path.join(projectRoot, 'assets', 'images'));
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

function formatBytes(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / (1024 * 1024)).toFixed(2)}MB`;
}

async function compressFile(sharp, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const before = fs.statSync(filePath).size;
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

  try {
    if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tmpPath);
    } else if (ext === '.png') {
      await pipeline
        .png({
          compressionLevel: 9,
          palette: true,
          quality: PNG_QUALITY,
          effort: 10,
        })
        .toFile(tmpPath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality: JPEG_QUALITY }).toFile(tmpPath);
    } else {
      return null;
    }

    const after = fs.statSync(tmpPath).size;
    if (after < before) {
      fs.renameSync(tmpPath, filePath);
      return { before, after, resized: needsResize };
    }

    fs.unlinkSync(tmpPath);
    return { before, after: before, skipped: true, resized: needsResize };
  } catch (err) {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    throw err;
  }
}

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error(
      '[compress-assets] sharp is required. Install with: npm i -D sharp',
    );
    process.exit(1);
  }

  const files = roots.flatMap((root) => walk(root));
  if (files.length === 0) {
    console.log('[compress-assets] No raster images found.');
    return;
  }

  let saved = 0;
  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;

  for (const file of files) {
    const rel = path.relative(projectRoot, file);
    try {
      const result = await compressFile(sharp, file);
      if (!result) continue;
      totalBefore += result.before;
      totalAfter += result.after;
      const delta = result.before - result.after;
      saved += delta;
      if (!result.skipped) {
        changed += 1;
        const note = result.resized ? ' (resized)' : '';
        console.log(
          `  ✓ ${rel}: ${formatBytes(result.before)} → ${formatBytes(result.after)} (−${formatBytes(delta)})${note}`,
        );
      }
    } catch (err) {
      console.warn(`  ✗ ${rel}: ${err.message}`);
    }
  }

  console.log(
    `[compress-assets] Done. ${changed}/${files.length} files shrunk. ` +
      `${formatBytes(totalBefore)} → ${formatBytes(totalAfter)} (saved ${formatBytes(saved)})`,
  );
}

main();
