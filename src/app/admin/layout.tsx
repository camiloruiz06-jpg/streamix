import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Panel administrativo', template: '%s · Panel' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
