'use client'

import { useEffect, useState } from 'react'

export function useDeviceType() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const detect = () => {
      const width = window.innerWidth
      if (width <= 767) return 'mobile'
      if (width <= 1024) return 'tablet'
      return 'desktop'
    }
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
    const isTabletUA = /ipad|tablet|android(?!.*mobile)/i.test(ua)
    const isMobileUA = /iphone|ipod|android.*mobile|mobile/i.test(ua)

    const decide = () => {
      if (isMobileUA) return 'mobile'
      if (isTabletUA) return 'tablet'
      return detect()
    }

    setDevice(decide())
    const onResize = () => setDevice(decide())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop'
  }
}

