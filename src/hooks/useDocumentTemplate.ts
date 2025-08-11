import { useState, useEffect } from 'react'
import { DocumentTemplate } from '@/types/document-template'

export function useDocumentTemplate(type: string = 'BOLETO_COMPRA_VENTA') {
  const [template, setTemplate] = useState<DocumentTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/document-templates/default?type=${type}`)
        if (response.ok) {
          const data = await response.json()
          setTemplate(data)
        } else {
          setError('No se encontró template por defecto')
        }
      } catch (error) {
        console.error('Error loading document template:', error)
        setError('Error al cargar template')
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
  }, [type])

  return {
    template,
    loading,
    error
  }
} 