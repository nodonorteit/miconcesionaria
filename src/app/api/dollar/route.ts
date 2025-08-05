import { NextResponse } from 'next/server'

interface DollarRates {
  mep: number | null
  blue: { compra: number | null; venta: number | null }
  ccl: { venta: number | null }
  crypto: { compra: number | null; venta: number | null }
  tarjeta: { venta: number | null }
  ahorro: { compra: number | null; venta: number | null }
  oficial: { compra: number | null; venta: number | null }
  timestamp: string
  source: string
}

// GET - Obtener todas las cotizaciones del dólar
export async function GET() {
  try {
    console.log('🔄 Iniciando fetch de cotizaciones desde ámbito.com...')
    
    // Usar ámbito.com - fuente confiable para Argentina
    const response = await fetch('https://www.ambito.com/contenidos/dolar.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      next: { revalidate: 300 } // Cache por 5 minutos
    })

    if (!response.ok) {
      console.error('❌ Error en la respuesta HTTP:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    console.log('✅ HTML obtenido de ámbito.com, longitud:', html.length)
    
    // Extraer todas las cotizaciones
    const rates: DollarRates = {
      mep: null,
      blue: { compra: null, venta: null },
      ccl: { venta: null },
      crypto: { compra: null, venta: null },
      tarjeta: { venta: null },
      ahorro: { compra: null, venta: null },
      oficial: { compra: null, venta: null },
      timestamp: new Date().toISOString(),
      source: 'ambito.com'
    }

    // Función helper para extraer números
    const extractNumber = (text: string): number | null => {
      const match = text.match(/[\d,]+\.?\d*/)
      if (match) {
        const num = parseFloat(match[0].replace(/[$,]/g, ''))
        return isNaN(num) ? null : num
      }
      return null
    }

    // Función helper para buscar valores en el HTML de ámbito.com
    const findValueBySection = (sectionTitle: string, type: 'compra' | 'venta'): number | null => {
      const patterns = [
        new RegExp(`${sectionTitle}[^>]*>.*?${type}[^>]*>.*?\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`${sectionTitle}[^>]*>.*?\\$?([\\d,]+\\.?\\d*)`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const value = extractNumber(match[1])
          if (value) {
            console.log(`✅ Encontrado ${sectionTitle} ${type}: ${value}`)
            return value
          }
        }
      }
      
      console.log(`❌ No se encontró valor para ${sectionTitle} ${type}`)
      return null
    }

    // Dólar Blue
    rates.blue.compra = findValueBySection('Dólar Blue', 'compra')
    rates.blue.venta = findValueBySection('Dólar Blue', 'venta')

    // Dólar Oficial
    rates.oficial.compra = findValueBySection('Dólar Oficial', 'compra')
    rates.oficial.venta = findValueBySection('Dólar Oficial', 'venta')

    // Dólar MEP
    rates.mep = findValueBySection('Dólar MEP', 'venta')

    // Dólar CCL
    rates.ccl.venta = findValueBySection('Dólar CCL', 'venta')

    // Dólar Cripto
    rates.crypto.compra = findValueBySection('Dólar Cripto', 'compra')
    rates.crypto.venta = findValueBySection('Dólar Cripto', 'venta')

    // Dólar Turista (usar como tarjeta)
    rates.tarjeta.venta = findValueBySection('Dólar Turista', 'venta')

    // Dólar Ahorro (usar oficial como base)
    rates.ahorro.compra = rates.oficial.compra
    rates.ahorro.venta = rates.oficial.venta

    console.log('📊 Cotizaciones extraídas:', JSON.stringify(rates, null, 2))

    return NextResponse.json(rates)

  } catch (error) {
    console.error('❌ Error fetching dollar rates:', error)
    
    // Devolver valores null en caso de error
    return NextResponse.json({
      mep: null,
      blue: { compra: null, venta: null },
      ccl: { venta: null },
      crypto: { compra: null, venta: null },
      tarjeta: { venta: null },
      ahorro: { compra: null, venta: null },
      oficial: { compra: null, venta: null },
      timestamp: new Date().toISOString(),
      source: 'ambito.com',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 