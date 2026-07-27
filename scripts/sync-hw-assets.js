#!/usr/bin/env node
/**
 * Syncs login-flow assets from ~/Desktop/HW vibe assets into assets/bundled/login.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const sourceRoot = path.join(os.homedir(), 'Desktop', 'HW vibe assets', 'Login Flow- App');
const targetRoot = path.join(__dirname, '..', 'assets', 'bundled', 'login');
const citiesSource = path.join(sourceRoot, 'City Selection page');
const citiesTarget = path.join(targetRoot, 'cities');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyWhiteLogoLottie(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const raw = fs.readFileSync(src, 'utf8');
  const data = JSON.parse(raw);

  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const color = node.c;
    if (
      color &&
      typeof color === 'object' &&
      color.a === 0 &&
      Array.isArray(color.k) &&
      color.k.length === 4 &&
      color.k[0] === 0 &&
      color.k[1] === 0 &&
      color.k[2] === 0
    ) {
      color.k = [1, 1, 1, 1];
    }

    Object.values(node).forEach(walk);
  }

  walk(data);
  fs.writeFileSync(dest, JSON.stringify(data));
}

function copyTabBarSvg(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const svg = fs
    .readFileSync(src, 'utf8')
    .replace(/fill="black"/gi, 'fill="currentColor"')
    .replace(/stroke="black"/gi, 'stroke="currentColor"');
  fs.writeFileSync(dest, svg);
}

function main() {
  if (!fs.existsSync(sourceRoot)) {
    console.warn(`[sync-hw-assets] Source not found: ${sourceRoot}`);
    process.exit(0);
  }

  for (const file of fs.readdirSync(sourceRoot)) {
    const src = path.join(sourceRoot, file);
    if (!fs.statSync(src).isFile()) continue;
    if (/\.(svg|json|png)$/i.test(file)) {
      if (file === 'Logo Animation_White.json') {
        copyWhiteLogoLottie(src, path.join(targetRoot, file));
      } else {
        copyFile(src, path.join(targetRoot, file));
      }
    }
  }

  if (fs.existsSync(citiesSource)) {
    fs.mkdirSync(citiesTarget, { recursive: true });
    for (const file of fs.readdirSync(citiesSource)) {
      if (file.endsWith('.svg')) {
        copyFile(path.join(citiesSource, file), path.join(citiesTarget, file));
      }
    }
  }

  console.log(`[sync-hw-assets] Synced login assets to ${targetRoot}`);

  const profileSource = path.join(os.homedir(), 'Desktop', 'HW vibe assets');
  const profileTarget = path.join(__dirname, '..', 'assets', 'bundled', 'profile');
  const profileCopies = [
    ['Homepage- App/Support.svg', 'support.svg'],
    ['Homepage- App/My visits.svg', 'my-visits.svg'],
    ['Homepage- App/Wishlist.svg', 'wishlist.svg'],
    ['Profile-App- before Onboarding/Community Events.svg', 'community-events.svg'],
    ['Profile-App- before Onboarding/For Homeowners.svg', 'for-homeowners.svg'],
    ['Profile-App- before Onboarding/Helloworld Living.svg', 'helloworld-living.svg'],
    ['Profile-App- before Onboarding/About.svg', 'about.svg'],
    ['Profile-App- before Onboarding/Privacy Policy.svg', 'privacy-policy.svg'],
    ['Profile-App- before Onboarding/Tenancy Poilicy.svg', 'tenancy-policy.svg'],
    ['Profile-App- before Onboarding/Logout.svg', 'logout.svg'],
    ['Homepage- App/Profile.svg', 'profile.svg'],
  ];

  for (const [relativeSource, destName] of profileCopies) {
    const src = path.join(profileSource, relativeSource);
    if (fs.existsSync(src)) {
      copyFile(src, path.join(profileTarget, destName));
    }
  }

  const tenantProfileCopies = [
    ['Profile-App- After Onboarding /Personal Details.svg', 'personal-details.svg'],
    ['Profile-App- After Onboarding /Booking Details.svg', 'booking-details.svg'],
    ['Profile-App- After Onboarding /Bank Details.svg', 'bank-details.svg'],
    ['Profile-App- After Onboarding /Emergency Contact Details.svg', 'emergency-contact.svg'],
    ['Profile-App- After Onboarding /My Payments.svg', 'my-payments.svg'],
    ['Profile-App- After Onboarding /Support.svg', 'tenant-support.svg'],
    ['Profile-App- After Onboarding /My Visits.svg', 'tenant-my-visits.svg'],
    ['Profile-App- After Onboarding /My Wishlist.svg', 'tenant-wishlist.svg'],
    ['Profile-App- After Onboarding /Referral.svg', 'referral.svg'],
    ['Profile-App- After Onboarding /Community Events.svg', 'tenant-community-events.svg'],
    ['Profile-App- After Onboarding /Move Out.svg', 'move-out.svg'],
    ['Profile-App- After Onboarding /About.svg', 'tenant-about.svg'],
    ['Profile-App- After Onboarding /Privacy Policy.svg', 'tenant-privacy-policy.svg'],
    ['Profile-App- After Onboarding /Tenancy Policy.svg', 'tenant-tenancy-policy.svg'],
    ['Profile-App- After Onboarding /Logout.svg', 'tenant-logout.svg'],
  ];
  for (const [relativeSource, destName] of tenantProfileCopies) {
    const src = path.join(profileSource, relativeSource);
    if (fs.existsSync(src)) {
      copyTabBarSvg(src, path.join(profileTarget, destName));
    }
  }

  console.log(`[sync-hw-assets] Synced profile menu assets to ${profileTarget}`);

  const contactTarget = path.join(__dirname, '..', 'assets', 'bundled', 'contact');
  const contactSrc = path.join(
    profileSource,
    'Locality, City, Landmark',
    'Contact us form- 3d illustration.png',
  );
  if (fs.existsSync(contactSrc)) {
    copyFile(contactSrc, path.join(contactTarget, 'illustration.png'));
    console.log(`[sync-hw-assets] Synced contact assets to ${contactTarget}`);
  }

  const tabBarTarget = path.join(__dirname, '..', 'assets', 'bundled', 'tab-bar');
  const tabBarCopies = [
    ['Homepage- App/Home.svg', 'home.svg'],
    ['Homepage- App/My visits.svg', 'my-visits.svg'],
    ['Homepage- App/Wishlist.svg', 'wishlist.svg'],
    ['Homepage- App/Support.svg', 'contact.svg'],
  ];
  for (const [relativeSource, destName] of tabBarCopies) {
    const src = path.join(profileSource, relativeSource);
    if (fs.existsSync(src)) {
      copyTabBarSvg(src, path.join(tabBarTarget, destName));
    }
  }
  console.log(`[sync-hw-assets] Synced tab bar assets to ${tabBarTarget}`);

  const tenantTabBarCopies = [
    ['Dashboard- App/Bottom Nav/Dashboard.svg', 'dashboard.svg'],
    ['Dashboard- App/Bottom Nav/Explore.svg', 'explore.svg'],
    ['Dashboard- App/Bottom Nav/Payments.svg', 'payments.svg'],
    ['Dashboard- App/Bottom Nav/Support.svg', 'support.svg'],
  ];
  for (const [relativeSource, destName] of tenantTabBarCopies) {
    const src = path.join(profileSource, relativeSource);
    if (fs.existsSync(src)) {
      copyTabBarSvg(src, path.join(tabBarTarget, destName));
    }
  }

  const dashboardTarget = path.join(__dirname, '..', 'assets', 'bundled', 'dashboard');
  const dashboardCopies = [
    ['Dashboard- App/SOS.svg', 'sos.svg'],
    ['Dashboard- App/Visitor.svg', 'visitor.svg'],
    ['Dashboard- App/Roomate.svg', 'roommate.svg'],
    ['Dashboard- App/Refer.svg', 'refer.svg'],
    ['Dashboard- App/Call.svg', 'call.svg'],
    ['Dashboard- App/Profile.svg', 'profile.svg'],
    ['Dashboard- App/Notification.svg', 'notification.svg'],
  ];
  for (const [relativeSource, destName] of dashboardCopies) {
    const src = path.join(profileSource, relativeSource);
    if (fs.existsSync(src)) {
      copyTabBarSvg(src, path.join(dashboardTarget, destName));
    }
  }
  console.log(`[sync-hw-assets] Synced dashboard assets to ${dashboardTarget}`);

  const paymentsTarget = path.join(__dirname, '..', 'assets', 'bundled', 'payments');
  const paymentLottieSrc = path.join(
    profileSource,
    'Payments- App',
    'Lottie Animations',
    'Payment Pending_Animation.json',
  );
  if (fs.existsSync(paymentLottieSrc)) {
    copyFile(paymentLottieSrc, path.join(paymentsTarget, 'payment-pending.json'));
    console.log(`[sync-hw-assets] Synced payment assets to ${paymentsTarget}`);
  }

  const visitorsTarget = path.join(__dirname, '..', 'assets', 'bundled', 'visitors');
  const visitorsIllustrationSrc = path.join(
    profileSource,
    'Visitors- App',
    'No visitors Pagloo.png',
  );
  if (fs.existsSync(visitorsIllustrationSrc)) {
    copyFile(visitorsIllustrationSrc, path.join(visitorsTarget, 'no-visitors-pagloo.png'));
    console.log(`[sync-hw-assets] Synced visitor assets to ${visitorsTarget}`);
  }

  const emptyStateTarget = path.join(__dirname, '..', 'assets', 'bundled', 'empty-state');
  const emptyStateSrc = path.join(profileSource, 'Error States_ Pagloo', 'Empty State 1.png');
  if (fs.existsSync(emptyStateSrc)) {
    copyFile(emptyStateSrc, path.join(emptyStateTarget, 'empty-state.png'));
    console.log(`[sync-hw-assets] Synced empty state assets to ${emptyStateTarget}`);
  }

  const errorStatesTarget = path.join(__dirname, '..', 'assets', 'bundled', 'error-states');
  const error500Src = path.join(profileSource, 'Error States_ Pagloo', 'Error 500_server error.png');
  if (fs.existsSync(error500Src)) {
    copyFile(error500Src, path.join(errorStatesTarget, 'error-500.png'));
    console.log(`[sync-hw-assets] Synced error state assets to ${errorStatesTarget}`);
  }

  const communityTarget = path.join(__dirname, '..', 'assets', 'bundled', 'community');
  const registrationConfirmedSrc = path.join(
    profileSource,
    'Community Events Flow- App',
    'Pagloo_confirmed_bouncer.png',
  );
  if (fs.existsSync(registrationConfirmedSrc)) {
    copyFile(registrationConfirmedSrc, path.join(communityTarget, 'pagloo-confirmed-bouncer.png'));
    console.log(`[sync-hw-assets] Synced community assets to ${communityTarget}`);
  }

  const logosTarget = path.join(__dirname, '..', 'assets', 'bundled', 'logos');
  const logoSrc = path.join(profileSource, 'Logos', 'Gardient+ black.svg');
  if (fs.existsSync(logoSrc)) {
    copyFile(logoSrc, path.join(logosTarget, 'hello-world-logo.svg'));
    console.log(`[sync-hw-assets] Synced logo assets to ${logosTarget}`);
  }

  const moveOutTarget = path.join(__dirname, '..', 'assets', 'bundled', 'move-out');
  const moveOutIllustrationSrc = path.join(profileSource, 'Moveout Flow- App', 'Help me stay.png');
  if (fs.existsSync(moveOutIllustrationSrc)) {
    copyFile(moveOutIllustrationSrc, path.join(moveOutTarget, 'help-me-stay.png'));
    console.log(`[sync-hw-assets] Synced move-out assets to ${moveOutTarget}`);
  }
}

main();
