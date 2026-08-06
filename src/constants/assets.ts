/**
 * Bundled HelloWorld assets (copied from ~/Desktop/HW vibe assets).
 * Run `npm run sync:assets` after updating the Desktop source folder
 * (sync also compresses raster images). Or run `npm run compress:assets`.
 */

export const LoginIcons = {
  call: require('../../assets/bundled/login/Vector.svg').default,
  edit: require('../../assets/bundled/login/Edit.svg').default,
  whatsapp: require('../../assets/bundled/login/Whatsapp.svg').default,
  bangalore: require('../../assets/bundled/login/cities/Bangalore.svg').default,
  chennai: require('../../assets/bundled/login/cities/Chennai.svg').default,
  delhi: require('../../assets/bundled/login/cities/Delhi.svg').default,
  hyderabad: require('../../assets/bundled/login/cities/Hyderabad.svg').default,
  mumbai: require('../../assets/bundled/login/cities/Mumbai.svg').default,
  pune: require('../../assets/bundled/login/cities/Pune.svg').default,
  noida: require('../../assets/bundled/login/cities/Noida.svg').default,
  jaipur: require('../../assets/bundled/login/cities/Jaipur.svg').default,
  kota: require('../../assets/bundled/login/cities/Kota.svg').default,
  goa: require('../../assets/bundled/login/cities/Goa.svg').default,
  gurugram: require('../../assets/bundled/login/cities/Gurugram.svg').default,
  kolkata: require('../../assets/bundled/login/cities/Kolkata.svg').default,
  ahmedabad: require('../../assets/bundled/login/cities/Ahemdabad.svg').default,
  coimbatore: require('../../assets/bundled/login/cities/Coimbatore.svg').default,
  indore: require('../../assets/bundled/login/cities/Indore.svg').default,
  visakhapatnam: require('../../assets/bundled/login/cities/Visakhapa-tnam.svg').default,
} as const;

export type LoginIconName = keyof typeof LoginIcons;

export const LottieAssets = {
  loginLogo: require('../../assets/bundled/login/Logo Animation_White.json'),
  loginLoading: require('../../assets/bundled/login/Loading state HW.json'),
} as const;

export const ImageAssets = {
  comingSoon: require('../../assets/bundled/coming-soon.jpg'),
  loginBento1: require('../../assets/bundled/login/login-bento-1.jpg'),
  loginBento2: require('../../assets/bundled/login/login-bento-2.jpg'),
  loginBento3: require('../../assets/bundled/login/login-bento-3.jpg'),
  loginBento4: require('../../assets/bundled/login/login-bento-4.jpg'),
  loginBentoBedroomSmall: require('../../assets/bundled/login/bento/bedroom-small.jpg'),
  loginLiveBetterText: require('../../assets/bundled/login/bento/live-better-text.png'),
  loginHelloWorldWordmark: require('../../assets/bundled/login/bento/hello-world-wordmark.png'),
  loginColivingBg: require('../../assets/bundled/login/bento/coliving-bg.jpg'),
  otpIllustration: require('../../assets/bundled/login/otp-illustration.png'),
  chooseCityIcon: require('../../assets/bundled/login/choose-city-icon.png'),
  contactIllustration: require('../../assets/bundled/contact/illustration.png'),
  appIcon: require('../../assets/images/icon.png'),
  paymentLogo: require('../../assets/images/icon.png'),
  splashIcon: require('../../assets/images/splash-icon.png'),
  hdpTrophy: require('../../assets/hw-vibe/HDP/Top choice trophy.png'),
  tourConfirmed: require('../../assets/hw-vibe/HDP/Tour Confirmed.png'),
} as const;

export const TabBarIcons = {
  home: require('../../assets/bundled/tab-bar/home.svg').default,
  myVisits: require('../../assets/bundled/tab-bar/my-visits.svg').default,
  wishlist: require('../../assets/bundled/tab-bar/wishlist.svg').default,
  contact: require('../../assets/bundled/tab-bar/contact.svg').default,
  dashboard: require('../../assets/bundled/tab-bar/dashboard.svg').default,
  explore: require('../../assets/bundled/tab-bar/explore.svg').default,
  payments: require('../../assets/bundled/tab-bar/payments.svg').default,
  support: require('../../assets/bundled/tab-bar/support.svg').default,
} as const;

export const DashboardImages = {
  rentCalendar: require('../../assets/bundled/dashboard/rent-calendar.png'),
  referralIllustration: require('../../assets/bundled/dashboard/referral-illustration.png'),
  moveInKeys: require('../../assets/bundled/dashboard/move-in-keys.png'),
} as const;

export const VisitorAssets = {
  noVisitors: require('../../assets/bundled/visitors/no-visitors-pagloo.png'),
} as const;

export const MoveOutAssets = {
  helpMeStay: require('../../assets/bundled/move-out/help-me-stay.png'),
} as const;

export const EmptyStateAssets = {
  default: require('../../assets/bundled/empty-state/empty-state.png'),
} as const;

export const ErrorStateAssets = {
  error500: require('../../assets/bundled/error-states/error-500.png'),
} as const;

export const CommunityAssets = {
  registrationConfirmed: require('../../assets/bundled/community/pagloo-confirmed-bouncer.png'),
  confirmedStamp: require('../../assets/bundled/community/confirmed-stamp.png'),
} as const;

export const LogoAssets = {
  helloWorld: require('../../assets/bundled/logos/hello-world-logo.svg').default,
} as const;

export const DashboardIcons = {
  sos: require('../../assets/bundled/dashboard/sos.svg').default,
  visitor: require('../../assets/bundled/dashboard/visitor.svg').default,
  roommate: require('../../assets/bundled/dashboard/roommate.svg').default,
  refer: require('../../assets/bundled/dashboard/refer.svg').default,
  call: require('../../assets/bundled/dashboard/call.svg').default,
  profile: require('../../assets/bundled/dashboard/profile.svg').default,
  notification: require('../../assets/bundled/dashboard/notification.svg').default,
} as const;

export const PaymentLottieAssets = {
  pending: require('../../assets/bundled/payments/payment-pending.json'),
} as const;

export const HomepageIcons = {
  profile: require('../../assets/bundled/profile/profile.svg').default,
} as const;

export const login = {
  ...LoginIcons,
  logoAnimation: LottieAssets.loginLogo,
  loadingState: LottieAssets.loginLoading,
  bento: [
    ImageAssets.loginBento1,
    ImageAssets.loginBento2,
    ImageAssets.loginBento3,
    ImageAssets.loginBento4,
  ],
  otpIllustration: ImageAssets.otpIllustration,
} as const;

export type HwIconName = LoginIconName | keyof typeof TabBarIcons | keyof typeof HomepageIcons;
