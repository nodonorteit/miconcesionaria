import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/auth-provider'
import { Header } from '@/components/ui/header'
import { MainNavigation } from '@/components/ui/main-navigation'
import { Toaster } from 'react-hot-toast'
import { ConditionalLayout } from '@/components/ui/conditional-layout'
import { SetupChecker } from '@/components/ui/setup-checker'

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
    <html lang="es-AR">
      <body className={inter.className}>
        <SetupChecker>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <Toaster position="top-right" />
          </AuthProvider>
        </SetupChecker>
      </body>
    </html>
  )
} 