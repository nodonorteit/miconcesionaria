import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

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

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, location, maxPrice, category } = await request.json()
    
    console.log('🔄 Iniciando scraping de Facebook Marketplace...')
    console.log('📋 Parámetros:', { searchTerm, location, maxPrice, category })

    // Configurar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // Configurar user agent para parecer más humano
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // Configurar viewport
    await page.setViewport({ width: 1920, height: 1080 })

    // Construir URL de búsqueda
    const searchParams = new URLSearchParams()
    if (searchTerm) searchParams.append('query', searchTerm)
    if (location) searchParams.append('location', location)
    if (maxPrice) searchParams.append('maxPrice', maxPrice.toString())
    if (category) searchParams.append('category', category)

    const marketplaceUrl = `https://www.facebook.com/marketplace/search/?${searchParams.toString()}`
    
    console.log('🔗 URL de búsqueda:', marketplaceUrl)

    // Navegar a la página
    await page.goto(marketplaceUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })

    // Esperar a que carguen los resultados
    await page.waitForSelector('[data-testid="marketplace_feed_item"]', { timeout: 10000 })

    // Extraer datos de los items
    const items = await page.evaluate(() => {
      const itemElements = document.querySelectorAll('[data-testid="marketplace_feed_item"]')
      const results: MarketplaceItem[] = []

      itemElements.forEach((element, index) => {
        if (index >= 20) return // Limitar a 20 resultados

        try {
          const titleElement = element.querySelector('[data-testid="marketplace_feed_item_title"]')
          const priceElement = element.querySelector('[data-testid="marketplace_feed_item_price"]')
          const locationElement = element.querySelector('[data-testid="marketplace_feed_item_location"]')
          const imageElement = element.querySelector('img')
          const linkElement = element.querySelector('a')

          if (titleElement && priceElement) {
            const item: MarketplaceItem = {
              id: `item-${index}`,
              title: titleElement.textContent?.trim() || '',
              price: priceElement.textContent?.trim() || '',
              location: locationElement?.textContent?.trim() || '',
              imageUrl: imageElement?.getAttribute('src') || '',
              url: linkElement?.getAttribute('href') || '',
              description: '',
              postedDate: '',
              seller: ''
            }
            results.push(item)
          }
        } catch (error) {
          console.error('Error parsing item:', error)
        }
      })

      return results
    })

    await browser.close()

    console.log(`✅ Scraping completado. ${items.length} items encontrados`)

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
      searchParams: { searchTerm, location, maxPrice, category }
    })

  } catch (error) {
    console.error('❌ Error en scraping:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error en scraping',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Obtener información sobre el scraping
export async function GET() {
  return NextResponse.json({
    message: 'Facebook Marketplace Scraping API',
    endpoints: {
      POST: '/api/scraping/facebook-marketplace',
      description: 'Realizar scraping de Facebook Marketplace'
    },
    parameters: {
      searchTerm: 'string - Término de búsqueda',
      location: 'string - Ubicación',
      maxPrice: 'number - Precio máximo',
      category: 'string - Categoría'
    },
    limitations: [
      'Respetar rate limits',
      'No violar términos de servicio',
      'Usar solo para fines educativos',
      'Considerar aspectos legales'
    ]
  })
} 