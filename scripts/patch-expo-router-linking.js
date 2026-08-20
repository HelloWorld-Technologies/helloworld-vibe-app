/**
 * Defers expo-router's onUnhandledLinking setState so it does not run during the
 * first render while getInitialURL()'s promise resolves (common on Android).
 * Without this, React warns: "Can't perform a React state update on a component
 * that hasn't mounted yet."
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-router',
  'build',
  'fork',
  'useLinking.native.js',
);

if (!fs.existsSync(target)) {
  console.warn('[patch-expo-router-linking] skip — file not found');
  process.exit(0);
}

const MARKER = '/* hw-defer-unhandled-linking */';
let source = fs.readFileSync(target, 'utf8');

if (source.includes(MARKER)) {
  process.exit(0);
}

const needle =
  'onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));';

if (!source.includes(needle)) {
  console.warn('[patch-expo-router-linking] skip — unexpected expo-router source');
  process.exit(0);
}

const replacement = `${MARKER}
                        setTimeout(() => {
                            onUnhandledLinking((0, extractPathFromURL_1.extractExpoPathFromURL)(prefixes, url));
                        }, 0);`;

// Replace both async (.then) and sync call sites.
source = source.split(needle).join(replacement);
fs.writeFileSync(target, source);
console.log('[patch-expo-router-linking] applied');
