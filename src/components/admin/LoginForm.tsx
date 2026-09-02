'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LoginForm({
  configurado,
  permitirDemo = true,
}: {
  configurado: boolean;
  permitirDemo?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(
          error.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos.'
            : error.message,
        );
        return;
      }
      router.replace(destino);
      router.refresh();
    } catch {
      setError('No pudimos conectar con el servidor. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  }

  if (!configurado) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="mb-2 flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" /> Supabase todavía no está configurado
          </p>
          <p className="text-amber-100/75">
            El panel está funcionando con datos de demostración. Para activar el acceso real,
            crea tu proyecto en Supabase y añade las claves en{' '}
            <code className="rounded bg-black/25 px-1">.env.local</code>. Encontrarás los pasos en
            el archivo <code className="rounded bg-black/25 px-1">README.md</code>.
          </p>
        </div>
        {permitirDemo && (
          <button type="button" onClick={() => router.push('/admin')} className="btn-primary w-full">
            Entrar en modo demostración <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">Correo</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tucorreo.com"
            className="field pl-9"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="label">Contraseña</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="field pl-9"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <button type="submit" disabled={cargando} className="btn-primary w-full">
        {cargando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
          </>
        ) : (
          <>
            Entrar al panel <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
