import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Header } from '@/components/ui/header'
import { MainNavigation } from '@/components/ui/main-navigation'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gestión',
  description: 'Sistema completo de gestión para concesionaria de vehículos',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
              {/* Sidebar */}
              <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen p-4">
                <MainNavigation />
              </div>
              
              {/* Main Content */}
              <div className="flex-1">
                {children}
              </div>
            </div>
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
} 