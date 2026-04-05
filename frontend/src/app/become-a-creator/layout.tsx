import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Creator - ModNight | NightWood',
  description: 'Apply to become a creator on ModNight. Publish your plugins and mods to thousands of users, earn donations, and get a verified creator badge.',
};

export default function BecomeACreatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
