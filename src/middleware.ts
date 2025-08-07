import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/vehicles',
  '/customers',
  '/sales',
  '/sellers',
  '/providers',
  '/workshops',
  '/expenses',
  '/cashflow',
  '/reports',
  '/admin'
]

// Rutas que solo pueden acceder administradores y managers
const adminOnlyRoutes = [
  '/admin',
  '/reports',
  '/sales',
  '/sellers',
  '/providers',
  '/workshops',
  '/expenses',
  '/cashflow'
]

// Rutas que pueden acceder usuarios comunes (USER)
const userAllowedRoutes = [
  '/vehicles',
  '/customers'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Obtener el token de autenticación
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Si no hay token, redirigir al login
  if (!token) {
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar permisos según el rol
  const userRole = token.role as string || 'USER'

  // Rutas solo para administradores y managers
  if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      // Usuario común intentando acceder a ruta de admin/manager
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Rutas permitidas para usuarios comunes
  if (userAllowedRoutes.some(route => pathname.startsWith(route))) {
    // Permitir acceso a usuarios comunes para estas rutas
    return NextResponse.next()
  }

  // Para otras rutas protegidas que no están en adminOnlyRoutes ni userAllowedRoutes
  // (esto no debería pasar con la configuración actual, pero por seguridad)
  if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
    // Usuario común intentando acceder a ruta restringida
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth (auth routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
} 