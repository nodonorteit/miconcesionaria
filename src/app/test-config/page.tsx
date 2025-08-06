'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestConfigPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testConfig()
  }, [])

  const testConfig = async () => {
    try {
      setLoading(true)
      console.log('🧪 Probando API de configuración...')
      
      const response = await fetch('/api/admin/company')
      console.log('📡 Respuesta:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Datos recibidos:', data)
        setConfig(data)
      } else {
        console.error('❌ Error en respuesta:', response.status)
        setConfig({ error: `HTTP ${response.status}` })
      }
    } catch (error) {
      console.error('❌ Error:', error)
      setConfig({ error: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Prueba de Configuración de Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testConfig} disabled={loading} className="mb-4">
            {loading ? 'Probando...' : 'Probar API'}
          </Button>
          
          {config && (
            <div className="space-y-4">
              <h3 className="font-bold">Resultado:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(config, null, 2)}
              </pre>
              
              {config.logoUrl && (
                <div>
                  <h4 className="font-bold">Logo URL:</h4>
                  <p>{config.logoUrl}</p>
                  <img 
                    src={config.logoUrl} 
                    alt="Logo" 
                    className="mt-2 max-w-xs border"
                    onError={(e) => {
                      console.error('❌ Error cargando imagen:', e)
                      e.currentTarget.style.display = 'none'
                    }}
                    onLoad={() => console.log('✅ Imagen cargada correctamente')}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 