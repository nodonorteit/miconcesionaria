import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rutas que requieren autenticación
const protectedRoutes = [
  '/vehicles',
  '/customers',
  '/sales',
  '/sellers',
  '/expenses',
  '/cashflow',
  '/reports',
  '/admin'
]

// Rutas que solo pueden acceder administradores (ADMIN únicamente)
const adminOnlyRoutes = [
  '/admin'
]

// Rutas que pueden acceder administradores y managers
const managerAndAdminRoutes = [
  '/reports',
  '/sales',
  '/sellers',
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

  // Rutas solo para administradores (ADMIN únicamente)
  if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN') {
      // Solo administradores pueden acceder a estas rutas
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Rutas que pueden acceder administradores y managers
  if (managerAndAdminRoutes.some(route => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      // Solo administradores y managers pueden acceder a estas rutas
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Rutas permitidas para usuarios comunes
  if (userAllowedRoutes.some(route => pathname.startsWith(route))) {
    // Permitir acceso a usuarios comunes para estas rutas
    return NextResponse.next()
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