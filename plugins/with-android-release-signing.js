const {
  withAppBuildGradle,
  withGradleProperties,
  withDangerousMod,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const STORE_FILE = 'hello-world-key.keystore';

function readKeystoreProperties(projectRoot) {
  const filePath = path.join(projectRoot, 'credentials', 'keystore.properties');
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const props = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    props[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return props;
}

function ensureKeystoreCopied(projectRoot) {
  const destDir = path.join(projectRoot, 'android', 'app');
  const dest = path.join(destDir, STORE_FILE);
  if (fs.existsSync(dest)) return;

  const candidates = [
    path.join(projectRoot, 'credentials', STORE_FILE),
    path.join(projectRoot, '..', 'helloworld', 'android', 'app', STORE_FILE),
  ];
  const source = candidates.find((candidate) => fs.existsSync(candidate));
  if (!source) {
    console.warn(
      `[with-android-release-signing] Missing ${STORE_FILE}. Put it in credentials/ for release signing.`,
    );
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(source, dest);
}

function withAndroidReleaseSigning(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      ensureKeystoreCopied(config.modRequest.projectRoot);
      return config;
    },
  ]);

  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('MYAPP_UPLOAD_STORE_FILE')) {
      contents = contents.replace(
        /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*\}/,
        `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(MYAPP_UPLOAD_STORE_FILE)
            storePassword PASSWORD
            keyAlias MYAPP_UPLOAD_KEY_ALIAS
            keyPassword PASSWORD
        }
    }`,
      );
    }

    contents = contents.replace(
      /release\s*\{([\s\S]*?)signingConfig\s+signingConfigs\.debug/,
      'release {$1signingConfig signingConfigs.release',
    );

    config.modResults.contents = contents;
    return config;
  });

  config = withGradleProperties(config, (config) => {
    const props = readKeystoreProperties(config.modRequest.projectRoot);
    if (!props) {
      console.warn(
        '[with-android-release-signing] credentials/keystore.properties not found — release builds will fail signing.',
      );
      return config;
    }

    const entries = [
      { key: 'MYAPP_UPLOAD_STORE_FILE', value: props.storeFile || STORE_FILE },
      { key: 'MYAPP_UPLOAD_KEY_ALIAS', value: props.keyAlias },
      { key: 'PASSWORD', value: props.storePassword || props.password },
    ];

    for (const entry of entries) {
      if (!entry.value) continue;
      const existing = config.modResults.find(
        (item) => item.type === 'property' && item.key === entry.key,
      );
      if (existing) {
        existing.value = entry.value;
      } else {
        config.modResults.push({ type: 'property', key: entry.key, value: entry.value });
      }
    }

    return config;
  });

  return config;
}

module.exports = createRunOncePlugin(
  withAndroidReleaseSigning,
  'with-android-release-signing',
  '1.0.0',
);
