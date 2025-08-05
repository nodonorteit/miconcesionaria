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
    
    // Debug: Buscar fragmentos específicos del HTML
    const blueMatch = html.match(/Dólar blue[^>]*>[\s]*\$?([\d,]+\.?\d*)/i)
    if (blueMatch) {
      console.log('🔍 Encontrado Dólar Blue:', blueMatch[1])
    } else {
      console.log('❌ No se encontró Dólar Blue')
    }
    
    const oficialMatch = html.match(/Dólar Oficial[^>]*>[\s]*\$?([\d,]+\.?\d*)/i)
    if (oficialMatch) {
      console.log('🔍 Encontrado Dólar Oficial:', oficialMatch[1])
    } else {
      console.log('❌ No se encontró Dólar Oficial')
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

    // Función helper para buscar valores en el HTML
    const findValue = (patterns: RegExp[]): number | null => {
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const value = extractNumber(match[1])
          if (value) {
            console.log(`✅ Encontrado valor con patrón: ${pattern.source} = ${value}`)
            return value
          }
        }
      }
      return null
    }

    // Dólar Blue - Patrones más simples
    const blueCompraPatterns = [
      /Dólar blue[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Dólar Blue[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /blue[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Blue[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    const blueVentaPatterns = [
      /Dólar blue[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Dólar Blue[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /blue[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Blue[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    rates.blue.compra = findValue(blueCompraPatterns)
    rates.blue.venta = findValue(blueVentaPatterns)

    // Dólar MEP
    const mepCompraPatterns = [
      /Dólar MEP[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /MEP[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    const mepVentaPatterns = [
      /Dólar MEP[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /MEP[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    rates.mep = findValue(mepVentaPatterns) // Usar venta como valor principal

    // Dólar CCL (Contado con liqui)
    const cclPatterns = [
      /Contado con liqui[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /CCL[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    rates.ccl.venta = findValue(cclPatterns)

    // Dólar Cripto
    const cryptoCompraPatterns = [
      /Dólar cripto[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /cripto[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    const cryptoVentaPatterns = [
      /Dólar cripto[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /cripto[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    rates.crypto.compra = findValue(cryptoCompraPatterns)
    rates.crypto.venta = findValue(cryptoVentaPatterns)

    // Dólar Tarjeta
    const tarjetaPatterns = [
      /Dólar Tarjeta[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Tarjeta[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    rates.tarjeta.venta = findValue(tarjetaPatterns)

    // Dólar Oficial
    const oficialCompraPatterns = [
      /Dólar Oficial[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Oficial[^>]*Compra[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    const oficialVentaPatterns = [
      /Dólar Oficial[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi,
      /Oficial[^>]*Venta[^>]*>[\s]*\$?([\d,]+\.?\d*)/gi
    ]
    rates.oficial.compra = findValue(oficialCompraPatterns)
    rates.oficial.venta = findValue(oficialVentaPatterns)

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