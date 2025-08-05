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
    console.log('🔄 Iniciando fetch de cotizaciones desde dolarmep.com...')
    
    // Intentar obtener el valor del dólar desde dolarmep.com
    const response = await fetch('https://dolarmep.com/', {
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
    console.log('✅ HTML obtenido, longitud:', html.length)
    
    // Debug: Buscar fragmentos específicos del HTML
    const dollarContainerMatch = html.match(/<div class="dollar-prices-container">([\s\S]*?)<\/div>/i)
    if (dollarContainerMatch) {
      console.log('🔍 Fragmento encontrado:', dollarContainerMatch[1].substring(0, 500))
    } else {
      console.log('❌ No se encontró el contenedor de precios')
    }
    
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
      source: 'dolarmep.com'
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

    // Función helper para buscar valores en el HTML usando IDs específicos
    const findValueById = (id: string): number | null => {
      // Múltiples patrones para mayor compatibilidad
      const patterns = [
        new RegExp(`id="${id}">\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`id="${id}"[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`id="${id}">([^<]+)`, 'i'),
        new RegExp(`id="${id}"[^>]*>([^<]+)`, 'i'),
        new RegExp(`"${id}"[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const value = extractNumber(match[1])
          if (value) {
            console.log(`✅ Encontrado valor para ${id}: ${value}`)
            return value
          }
        }
      }
      
      // Buscar por texto cercano si no se encuentra por ID
      const fallbackPatterns = [
        new RegExp(`Dólar Blue[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`Blue[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`CCL[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`Cripto[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`Tarjeta[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`Ahorro[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`Oficial[^>]*>\\$?([\\d,]+\\.?\\d*)`, 'i')
      ]
      
      for (const pattern of fallbackPatterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const value = extractNumber(match[1])
          if (value) {
            console.log(`✅ Encontrado valor por fallback para ${id}: ${value}`)
            return value
          }
        }
      }
      
      console.log(`❌ No se encontró valor para ${id}`)
      return null
    }

    // Dólar Blue - usando IDs específicos
    rates.blue.compra = findValueById('price-blue-buy')
    rates.blue.venta = findValueById('price-blue-sell')

    // Dólar CCL
    rates.ccl.venta = findValueById('price-ccl-sell')

    // Dólar Cripto
    rates.crypto.compra = findValueById('price-cripto-buy')
    rates.crypto.venta = findValueById('price-cripto-sell')

    // Dólar Tarjeta
    rates.tarjeta.venta = findValueById('price-tarjeta-sell')

    // Dólar Ahorro
    rates.ahorro.compra = findValueById('price-ahorro-buy')
    rates.ahorro.venta = findValueById('price-ahorro-sell')

    // Dólar Oficial
    rates.oficial.compra = findValueById('price-oficial-buy')
    rates.oficial.venta = findValueById('price-oficial-sell')

    // Dólar MEP - buscar en el contenido general ya que no aparece en el HTML proporcionado
    const mepPatterns = [
      /Dólar MEP.*?(\$?[\d,]+\.?\d*)/gi,
      /MEP.*?(\$?[\d,]+\.?\d*)/gi,
      /cotización.*?MEP.*?(\$?[\d,]+\.?\d*)/gi
    ]
    
    for (const pattern of mepPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        const value = extractNumber(match[1])
        if (value) {
          console.log(`✅ Encontrado Dólar MEP: ${value}`)
          rates.mep = value
          break
        }
      }
    }

    console.log('📊 Cotizaciones extraídas:', JSON.stringify(rates, null, 2))

    return NextResponse.json(rates)

  } catch (error) {
    console.error('❌ Error fetching dollar rates:', error)
    return NextResponse.json({
      mep: null,
      blue: { compra: null, venta: null },
      ccl: { venta: null },
      crypto: { compra: null, venta: null },
      tarjeta: { venta: null },
      ahorro: { compra: null, venta: null },
      oficial: { compra: null, venta: null },
      timestamp: new Date().toISOString(),
      source: 'dolarmep.com',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 