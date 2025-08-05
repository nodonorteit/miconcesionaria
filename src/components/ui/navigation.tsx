'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home } from 'lucide-react'

interface NavigationProps {
  title: string
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

export function Navigation({ title, breadcrumbs = [] }: NavigationProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
        <Link href="/" className="flex items-center hover:text-gray-700">
          <Home className="h-4 w-4 mr-1" />
          Inicio
        </Link>
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={index} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            {breadcrumb.href ? (
              <Link href={breadcrumb.href} className="hover:text-gray-700">
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-gray-900">{breadcrumb.label}</span>
            )}
          </div>
        ))}
      </nav>
      
      {/* Title and Back Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
} 