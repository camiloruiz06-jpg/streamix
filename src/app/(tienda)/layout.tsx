import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFab } from '@/components/site/WhatsAppFab';
import { BackgroundFx } from '@/components/site/BackgroundFx';
import { DemoBanner } from '@/components/site/DemoBanner';
import { isDemo } from '@/lib/queries';

export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackgroundFx />
      <Navbar />
      {isDemo() && <DemoBanner />}
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
