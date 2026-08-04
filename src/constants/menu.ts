import type { ProfileIconName } from '@/constants/profile-icons';

export type MenuItem = {
  id: string;
  label: string;
  icon: ProfileIconName;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: 'activity',
    title: 'My Activity & Support',
    items: [
      { id: 'contact-us', label: 'Contact Us', icon: 'support' },
      { id: 'my-visits', label: 'My Visits', icon: 'myVisits' },
      { id: 'my-wishlist', label: 'My Wishlist', icon: 'wishlist' },
      { id: 'community-events', label: 'Community Events', icon: 'communityEvents' },
    ],
  },
  {
    id: 'about',
    title: 'About & Policies',
    items: [
      { id: 'for-homeowners', label: 'For Homeowners', icon: 'forHomeowners' },
      { id: 'helloworld-living', label: 'Helloworld Living', icon: 'helloworldLiving' },
      { id: 'about', label: 'About', icon: 'about' },
      { id: 'privacy-policy', label: 'Privacy Policy', icon: 'privacyPolicy' },
      { id: 'tenancy-policy', label: 'Tenancy Policy', icon: 'tenancyPolicy' },
      { id: 'logout', label: 'Logout', icon: 'logout' },
    ],
  },
];

export const TENANT_ACCOUNT_ITEMS: MenuItem[] = [
  { id: 'personal-details', label: 'Personal Details', icon: 'personalDetails' },
  {
    id: 'booking-details',
    label: 'Booking Details & Rental Agreements',
    icon: 'bookingDetails',
  },
  { id: 'your-vibes', label: 'Your Vibes', icon: 'yourVibes' },
  {
    id: 'education-professional',
    label: 'Education & Professional Details',
    icon: 'educationProfessional',
  },
  { id: 'bank-details', label: 'Bank Details', icon: 'bankDetails' },
  { id: 'emergency-contact', label: 'Emergency Contact Details', icon: 'emergencyContact' },
];

const TENANT_MOVE_IN_STEPS_ITEM: MenuItem = {
  id: 'move-in-steps',
  label: 'Your Move-in Steps',
  icon: 'bookingDetails',
};

export const TENANT_ACTIVITY_ITEMS: MenuItem[] = [
  { id: 'my-payments', label: 'My Payments', icon: 'myPayments' },
  { id: 'support', label: 'Support', icon: 'tenantSupport' },
  { id: 'my-visits', label: 'My Visits', icon: 'tenantMyVisits' },
  { id: 'my-wishlist', label: 'My Wishlist', icon: 'tenantWishlist' },
  { id: 'referral', label: 'Referral', icon: 'referral' },
  { id: 'community-events', label: 'Community Events', icon: 'tenantCommunityEvents' },
  { id: 'move-out', label: 'Move Out', icon: 'moveOut' },
];

export const TENANT_MORE_ITEMS: MenuItem[] = [
  { id: 'about', label: 'About', icon: 'tenantAbout' },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: 'tenantPrivacyPolicy' },
  { id: 'tenancy-policy', label: 'Tenancy Policy', icon: 'tenantTenancyPolicy' },
  { id: 'logout', label: 'Logout', icon: 'tenantLogout' },
];

export function buildTenantMenuSections(includeMoveInSteps = false): MenuSection[] {
  return [
    {
      id: 'account',
      title: 'Account',
      items: includeMoveInSteps
        ? [TENANT_MOVE_IN_STEPS_ITEM, ...TENANT_ACCOUNT_ITEMS]
        : TENANT_ACCOUNT_ITEMS,
    },
    {
      id: 'activity',
      title: 'Activity',
      items: TENANT_ACTIVITY_ITEMS,
    },
    {
      id: 'more',
      title: 'More',
      items: TENANT_MORE_ITEMS,
    },
  ];
}

export const TENANT_MENU_SECTIONS: MenuSection[] = buildTenantMenuSections();
