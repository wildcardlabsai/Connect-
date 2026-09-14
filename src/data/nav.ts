export type NavItem = { label: string; to: string };

/** Primary navigation. Drives both the desktop header and the mobile menu. */
export const primaryNav: NavItem[] = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'For Businesses', to: '/for-businesses' },
  { label: 'Materials', to: '/materials' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

/** Footer navigation adds the founding network page to the primary set. */
export const footerNav: NavItem[] = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'For Businesses', to: '/for-businesses' },
  { label: 'Materials', to: '/materials' },
  { label: 'About', to: '/about' },
  { label: 'Founding Network', to: '/founding-network' },
  { label: 'Contact', to: '/contact' },
];

export const JOIN_PATH = '/founding-network';
export const JOIN_LABEL = 'Join the Founding Network';
