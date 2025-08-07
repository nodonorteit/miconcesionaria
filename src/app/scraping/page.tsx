'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navigation } from '@/components/ui/navigation'
import { Search, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface MarketplaceItem {
  id: string
  title: string
  price: string
  location: string
  description?: string
  imageUrl?: string
  url: string
  postedDate?: string
  seller?: string
}

interface ScrapingResult {
  success: boolean
  items: MarketplaceItem[]
  total: number
  searchParams: {
    searchTerm?: string
    location?: string
    maxPrice?: number
    category?: string
  }
}

export default function ScrapingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<ScrapingResult | null>(null)

  const handleScraping = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      toast.error('Debes ingresar un término de búsqueda')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/scraping/facebook-marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          location: location.trim() || undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          category: category.trim() || undefined
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data)
        toast.success(`Encontrados ${data.total} resultados`)
      } else {
        toast.error(data.error || 'Error en el scraping')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al realizar el scraping')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation
        title="Scraping de Facebook Marketplace"
        breadcrumbs={[{ label: 'Scraping' }]}
      />

      {/* Advertencia */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold">⚠️ Advertencia Importante</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            Este scraping es solo para fines educativos. Respeta los términos de servicio de Facebook 
            y las leyes locales. El uso excesivo puede resultar en bloqueos de IP.
          </p>
        </CardContent>
      </Card>

      {/* Formulario de búsqueda */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda en Facebook Marketplace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScraping} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="searchTerm">Término de búsqueda *</Label>
                <Input
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: Toyota Corolla 2020"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Buenos Aires, Argentina"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Precio máximo</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Ej: 50000"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todas las categorías</option>
                  <option value="vehicles">Vehículos</option>
                  <option value="property">Propiedades</option>
                  <option value="electronics">Electrónicos</option>
                  <option value="furniture">Muebles</option>
                  <option value="clothing">Ropa</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Realizando scraping...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar en Marketplace
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>
              Resultados ({results.total} items encontrados)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {item.imageUrl && (
                      <div className="mb-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-green-600">
                        {item.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.location}
                      </span>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver en Facebook
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 