import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';
import { LoginForm } from '@/components/admin/LoginForm';
import { site } from '@/config/site';
import { supabaseConfigured } from '@/lib/supabase/server';

export const metadata = { title: 'Acceso administrativo' };

export default function LoginPage() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      {/* fondo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-faint opacity-40" style={{ backgroundSize: '56px 56px' }} />
        <div className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-[130px]" />
        <div className="absolute bottom-0 right-1/4 h-[24rem] w-[24rem] rounded-full bg-fuchsia-600/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la tienda
        </Link>

        <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-8 shadow-glow-lg backdrop-blur-xl">
          <div className="mb-8 text-center">
            <BrandMark size={52} className="mx-auto" />
            <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-white">
              Panel de {site.name}
            </h1>
            <p className="mt-1.5 text-sm text-white/45">
              Acceso restringido al administrador del negocio.
            </p>
          </div>

          <Suspense fallback={<div className="skeleton h-40 w-full" />}>
            <LoginForm
              configurado={supabaseConfigured()}
              permitirDemo={process.env.NODE_ENV !== 'production'}
            />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          ¿Problemas para entrar? Revisa las variables de entorno en{' '}
          <code className="rounded bg-white/5 px-1">.env.local</code>
        </p>
      </div>
    </div>
  );
}
