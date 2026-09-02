import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refresca la sesión en cada petición y protege las rutas /admin.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const path0 = request.nextUrl.pathname;

  // Sin credenciales de Supabase configuradas:
  //  · en desarrollo dejamos entrar al panel con datos de demostración,
  //  · en producción lo cerramos, para que un despliegue público nunca deje
  //    el panel administrativo abierto a cualquiera.
  if (!url || !key) {
    if (process.env.NODE_ENV === 'production' && path0.startsWith('/admin') && !path0.startsWith('/admin/login')) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = '/admin/login';
      redirect.search = '';
      return NextResponse.redirect(redirect);
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const esAdmin = path.startsWith('/admin');
  const esLogin = path.startsWith('/admin/login');

  if (esAdmin && !esLogin && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/admin/login';
    redirect.searchParams.set('next', path);
    return NextResponse.redirect(redirect);
  }

  if (esLogin && user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = '/admin';
    redirect.search = '';
    return NextResponse.redirect(redirect);
  }

  return response;
}
