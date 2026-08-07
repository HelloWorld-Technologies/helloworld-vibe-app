const {
  withDangerousMod,
  withMainActivity,
  createRunOncePlugin,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Android 12+ SplashScreen API only allows a solid color + centered icon.
 * We:
 * 1. Ship splash-gradient.png as drawable-nodpi/splashscreen_full.png
 * 2. Set windowBackground to that gradient
 * 3. Patch MainActivity to overlay the gradient and dismiss the system
 *    (solid blue) splash ASAP so the gradient is what users actually see
 */
function withSplashDrawables(config) {
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

      // Transparent system splash icon — a real image here shows as a
      // centered box/circle on Android 12+. Gradient comes from our overlay.
      fs.writeFileSync(
        path.join(drawableDir, 'splashscreen_logo.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <size android:width="1dp" android:height="1dp" />
    <solid android:color="#00000000" />
</shape>
`,
      );

      for (const dir of fs.readdirSync(resDir)) {
        if (!dir.startsWith('drawable-') || dir === 'drawable-nodpi') continue;
        const logoPng = path.join(resDir, dir, 'splashscreen_logo.png');
        if (fs.existsSync(logoPng)) fs.unlinkSync(logoPng);
      }

      const stylesPath = path.join(valuesDir, 'styles.xml');
      if (fs.existsSync(stylesPath)) {
        let styles = fs.readFileSync(stylesPath, 'utf8');

        if (!styles.includes('android:windowBackground')) {
          styles = styles.replace(
            /(<style name="Theme\.App\.SplashScreen"[\s\S]*?)(<\/style>)/,
            `$1    <item name="android:windowBackground">@drawable/splashscreen_gradient</item>\n  $2`,
          );
        } else if (styles.includes('Theme.App.SplashScreen')) {
          styles = styles.replace(
            /(<style name="Theme\.App\.SplashScreen"[\s\S]*?<\/style>)/,
            (block) =>
              block.replace(
                /<item name="android:windowBackground">[^<]*<\/item>/,
                '<item name="android:windowBackground">@drawable/splashscreen_gradient</item>',
              ),
          );
        }

        if (styles.includes('windowSplashScreenAnimatedIcon')) {
          styles = styles.replace(
            /<item name="windowSplashScreenAnimatedIcon">[^<]*<\/item>/,
            '<item name="windowSplashScreenAnimatedIcon">@drawable/splashscreen_logo</item>',
          );
        }

        // Prefer no forced icon — avoids empty/placeholder box on some OEMs.
        styles = styles.replace(
          /\s*<item name="android:windowSplashScreenBehavior">[^<]*<\/item>/,
          '',
        );

        fs.writeFileSync(stylesPath, styles);
      }

      return cfg;
    },
  ]);
}

const OVERLAY_MARKER_START = '// @generated begin hw-splash-gradient';
const OVERLAY_MARKER_END = '// @generated end hw-splash-gradient';

const OVERLAY_SNIPPET = `${OVERLAY_MARKER_START}
    // Android 12+ system splash is solid-color only. Overlay the real gradient
    // and drop the system splash ASAP so launch looks full-bleed.
    val decor = window.decorView as android.view.ViewGroup
    val gradientOverlay = android.widget.ImageView(this).apply {
      setImageResource(R.drawable.splashscreen_full)
      scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
      layoutParams = android.widget.FrameLayout.LayoutParams(
        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
      )
      // Above RN content, below dialogs
      elevation = 100f
    }
    decor.addView(gradientOverlay)

    // Dismiss solid-color system splash; keep our overlay until first React frame.
    SplashScreenManager.hide()

    com.facebook.react.bridge.ReactMarker.addListener(
      com.facebook.react.bridge.ReactMarker.MarkerListener { name, _, _ ->
        if (name == com.facebook.react.bridge.ReactMarkerConstants.CONTENT_APPEARED) {
          gradientOverlay.post {
            gradientOverlay
              .animate()
              .alpha(0f)
              .setDuration(200)
              .withEndAction {
                (gradientOverlay.parent as? android.view.ViewGroup)?.removeView(gradientOverlay)
              }
              .start()
          }
        }
      },
    )
    ${OVERLAY_MARKER_END}`;

function withSplashMainActivity(config) {
  return withMainActivity(config, (cfg) => {
    let contents = cfg.modResults.contents;

    // Strip previous injection if re-running
    if (contents.includes(OVERLAY_MARKER_START)) {
      const start = contents.indexOf(OVERLAY_MARKER_START);
      const end = contents.indexOf(OVERLAY_MARKER_END);
      if (start !== -1 && end !== -1) {
        contents =
          contents.slice(0, start) +
          contents.slice(end + OVERLAY_MARKER_END.length);
      }
    }

    if (!contents.includes('SplashScreenManager.registerOnActivity')) {
      cfg.modResults.contents = contents;
      return cfg;
    }

    // Insert after SplashScreenManager.registerOnActivity(this)
    contents = contents.replace(
      /SplashScreenManager\.registerOnActivity\(this\)\s*\n/,
      `SplashScreenManager.registerOnActivity(this)\n    ${OVERLAY_SNIPPET}\n`,
    );

    cfg.modResults.contents = contents;
    return cfg;
  });
}

function withAndroidSplashGradient(config) {
  config = withSplashDrawables(config);
  config = withSplashMainActivity(config);
  return config;
}

module.exports = createRunOncePlugin(
  withAndroidSplashGradient,
  'with-android-splash-gradient',
  '1.2.0',
);
