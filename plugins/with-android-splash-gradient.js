const { withDangerousMod, createRunOncePlugin } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Android 12+ SplashScreen API only supports a solid background color + icon.
 * We still ship a full-screen gradient bitmap for:
 * - pre-Android 12 window background
 * - the brief windowBackground after the system splash dismisses
 * so the transition into the in-app LinearGradient splash stays seamless.
 */
function withAndroidSplashGradient(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const resDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      const nodpiDir = path.join(resDir, 'drawable-nodpi');
      const drawableDir = path.join(resDir, 'drawable');
      const valuesDir = path.join(resDir, 'values');

      fs.mkdirSync(nodpiDir, { recursive: true });
      fs.mkdirSync(drawableDir, { recursive: true });

      const source = path.join(projectRoot, 'assets', 'images', 'splash-gradient.png');
      const destFull = path.join(nodpiDir, 'splashscreen_full.png');
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, destFull);
      }

      fs.writeFileSync(
        path.join(drawableDir, 'splashscreen_gradient.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<bitmap xmlns:android="http://schemas.android.com/apk/res/android"
    android:src="@drawable/splashscreen_full"
    android:gravity="fill"
    android:filter="true" />
`,
      );

      const stylesPath = path.join(valuesDir, 'styles.xml');
      if (fs.existsSync(stylesPath)) {
        let styles = fs.readFileSync(stylesPath, 'utf8');
        if (!styles.includes('@drawable/splashscreen_gradient')) {
          styles = styles.replace(
            /(<style name="Theme\.App\.SplashScreen"[\s\S]*?)(<\/style>)/,
            `$1    <item name="android:windowBackground">@drawable/splashscreen_gradient</item>\n  $2`,
          );
        } else {
          styles = styles.replace(
            /<item name="android:windowBackground">[^<]*<\/item>/,
            '<item name="android:windowBackground">@drawable/splashscreen_gradient</item>',
          );
        }
        fs.writeFileSync(stylesPath, styles);
      }

      return cfg;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withAndroidSplashGradient,
  'with-android-splash-gradient',
  '1.0.0',
);
