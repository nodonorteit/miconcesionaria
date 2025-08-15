import { useState, useEffect } from 'react'

interface CompanyConfig {
  name: string
  logoUrl: string
  description: string
  cuit?: string
  address?: string
  city?: string
  state?: string
}

export function useCompanyConfig() {
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>({
    name: '',
    logoUrl: '',
    description: '',
    cuit: '',
    address: '',
    city: '',
    state: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCompanyConfig = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/admin/company')
        if (response.ok) {
          const data = await response.json()
          setCompanyConfig(data)
        } else {
          setError('Error al cargar la configuración de la empresa')
        }
      } catch (error) {
        console.error('Error loading company config:', error)
        setError('Error al cargar la configuración de la empresa')
      } finally {
        setLoading(false)
      }
    }

    loadCompanyConfig()
  }, [])

  const updateCompanyConfig = async (newConfig: Partial<CompanyConfig>) => {
    try {
      setLoading(true)
      setError(null)
      
      const formData = new FormData()
      if (newConfig.name) formData.append('name', newConfig.name)
      if (newConfig.description) formData.append('description', newConfig.description)
      if (newConfig.logoUrl && newConfig.logoUrl.startsWith('blob:')) {
        // Handle file upload
        const response = await fetch(newConfig.logoUrl)
        const blob = await response.blob()
        const file = new File([blob], 'logo.png', { type: blob.type })
        formData.append('logo', file)
      }

      const response = await fetch('/api/admin/company', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setCompanyConfig(data)
        return { success: true }
      } else {
        setError('Error al actualizar la configuración')
        return { success: false, error: 'Error al actualizar la configuración' }
      }
    } catch (error) {
      console.error('Error updating company config:', error)
      setError('Error al actualizar la configuración')
      return { success: false, error: 'Error al actualizar la configuración' }
    } finally {
      setLoading(false)
    }
  }

  return {
    companyConfig,
    loading,
    error,
    updateCompanyConfig
  }
} 