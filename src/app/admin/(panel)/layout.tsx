import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/Sidebar';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';
import { getExpirations } from '@/lib/queries';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  let email: string | null = null;

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    // Sin sesión no se entra al panel. Esta comprobación es independiente del
    // middleware: aunque este fallara, el panel sigue cerrado.
    if (!data.user) redirect('/admin/login');
    email = data.user.email ?? null;
  } else if (process.env.NODE_ENV === 'production') {
    // Publicado en internet pero sin base de datos configurada: el panel no
    // debe quedar accesible con datos de demostración.
    redirect('/admin/login');
  }

  const vencimientos = await getExpirations();
  const alertas = vencimientos.filter((v) =>
    ['vencido', 'hoy', 'critico', 'proximo'].includes(v.semaforo),
  ).length;

  return (
    <div className="min-h-screen bg-ink-950">
      <Sidebar email={email} alertas={alertas} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-[100rem] px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
