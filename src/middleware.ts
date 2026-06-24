import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const { pathname } = request.nextUrl;

    // --- 1. LÓGICA DE ACCESO PÚBLICO ---
    // Si no está logueado y no está en login, enviar a login
    if (!user && !pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // --- 2. LÓGICA DE ACCESO PRIVADO ---
    if (user) {
        // Si intenta entrar a login ya estando logueado, lo mandamos a su dashboard
        if (pathname.startsWith('/login')) {
            const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single();
            const url = perfil?.rol === 'administrador' ? '/admin/dashboard' : '/docente/dashboard';
            return NextResponse.redirect(new URL(url, request.url));
        }

        // Consultar el rol (SOLO si estamos en rutas protegidas)
        if (pathname.startsWith('/admin') || pathname.startsWith('/docente')) {
            const { data: perfil } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', user.id)
                .single();

            const rol = perfil?.rol;

            // Bloqueo de rutas Admin
            if (pathname.startsWith('/admin') && rol !== 'administrador') {
                return NextResponse.redirect(new URL('/docente/dashboard', request.url));
            }

            // Bloqueo de rutas Docente
            if (pathname.startsWith('/docente') && rol !== 'docente') {
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};