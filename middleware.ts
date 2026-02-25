import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session se estiver expirada
  const { data: { session } } = await supabase.auth.getSession()

  // Lista de rotas protegidas
  const protectedRoutes = ['/painel', '/disciplinas', '/provas']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redireciona não-autenticados de rotas protegidas para login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    // Adiciona a rota original como parâmetro para redirecionar depois do login
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redireciona usuários autenticados da página de login para o painel
  if (session && request.nextUrl.pathname === '/login') {
    // Verifica se tem um redirect parameter
    const redirect = request.nextUrl.searchParams.get('redirect')
    const redirectUrl = redirect || '/painel'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
