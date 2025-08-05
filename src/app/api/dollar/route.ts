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
    console.log('🔄 Iniciando fetch de cotizaciones desde dolarhoy.com...')
    
    // Intentar obtener el valor del dólar desde dolarhoy.com
    const response = await fetch('https://dolarhoy.com/', {
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
      source: 'dolarhoy.com'
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

    // Función helper para buscar valores en el HTML usando la estructura real
    const findValueByStructure = (title: string, type: 'compra' | 'venta'): number | null => {
      // Buscar el contenedor que contiene el título y luego el valor correspondiente
      const patterns = [
        new RegExp(`${title}[^>]*>.*?<div class="compra">[^>]*<div class="val">\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`${title}[^>]*>.*?<div class="venta">[^>]*<div class="val">\\$?([\\d,]+\\.?\\d*)`, 'i'),
        new RegExp(`${title}[^>]*>.*?class="val">\\$?([\\d,]+\\.?\\d*)`, 'i')
      ]
      
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const value = extractNumber(match[1])
          if (value) {
            console.log(`✅ Encontrado ${title} ${type}: ${value}`)
            return value
          }
        }
      }
      
      console.log(`❌ No se encontró valor para ${title} ${type}`)
      return null
    }

    // Dólar Blue
    rates.blue.compra = findValueByStructure('Dólar blue', 'compra')
    rates.blue.venta = findValueByStructure('Dólar blue', 'venta')

    // Dólar Oficial
    rates.oficial.compra = findValueByStructure('Dólar Oficial', 'compra')
    rates.oficial.venta = findValueByStructure('Dólar Oficial', 'venta')

    // Dólar MEP
    rates.mep = findValueByStructure('Dólar MEP', 'venta')

    // Dólar CCL (Contado con liqui)
    rates.ccl.venta = findValueByStructure('Contado con liqui', 'venta')

    // Dólar Cripto
    rates.crypto.compra = findValueByStructure('Dólar cripto', 'compra')
    rates.crypto.venta = findValueByStructure('Dólar cripto', 'venta')

    // Dólar Tarjeta
    rates.tarjeta.venta = findValueByStructure('Dólar Tarjeta', 'venta')

    // Dólar Ahorro (usar oficial como base)
    rates.ahorro.compra = rates.oficial.compra
    rates.ahorro.venta = rates.oficial.venta

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
      source: 'dolarhoy.com',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 