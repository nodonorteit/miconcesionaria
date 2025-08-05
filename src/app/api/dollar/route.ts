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
    // Intentar obtener el valor del dólar desde dolarmep.com
    const response = await fetch('https://dolarmep.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 300 } // Cache por 5 minutos
    })

    if (!response.ok) {
      throw new Error('Failed to fetch dollar rates')
    }

    const html = await response.text()
    
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

    // Dólar MEP
    const mepPatterns = [
      /cotización del Dólar MEP hoy es de:\s*\$?([\d,]+\.?\d*)/i,
      /Dólar MEP.*?(\$?[\d,]+\.?\d*)/i,
      /(\$?[\d,]+\.?\d*).*?MEP/i
    ]
    for (const pattern of mepPatterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        rates.mep = extractNumber(match[1])
        if (rates.mep) break
      }
    }

    // Dólar Blue
    const blueCompraMatch = html.match(/Dólar Blue.*?Compra.*?(\$?[\d,]+\.?\d*)/i)
    const blueVentaMatch = html.match(/Dólar Blue.*?Venta.*?(\$?[\d,]+\.?\d*)/i)
    if (blueCompraMatch) rates.blue.compra = extractNumber(blueCompraMatch[1])
    if (blueVentaMatch) rates.blue.venta = extractNumber(blueVentaMatch[1])

    // Dólar CCL
    const cclMatch = html.match(/Dólar CCL.*?Venta.*?(\$?[\d,]+\.?\d*)/i)
    if (cclMatch) rates.ccl.venta = extractNumber(cclMatch[1])

    // Dólar Cripto
    const cryptoCompraMatch = html.match(/Dólar Cripto.*?Compra.*?(\$?[\d,]+\.?\d*)/i)
    const cryptoVentaMatch = html.match(/Dólar Cripto.*?Venta.*?(\$?[\d,]+\.?\d*)/i)
    if (cryptoCompraMatch) rates.crypto.compra = extractNumber(cryptoCompraMatch[1])
    if (cryptoVentaMatch) rates.crypto.venta = extractNumber(cryptoVentaMatch[1])

    // Dólar Tarjeta
    const tarjetaMatch = html.match(/Dólar Tarjeta.*?Venta.*?(\$?[\d,]+\.?\d*)/i)
    if (tarjetaMatch) rates.tarjeta.venta = extractNumber(tarjetaMatch[1])

    // Dólar Ahorro
    const ahorroCompraMatch = html.match(/Dólar Ahorro.*?Compra.*?(\$?[\d,]+\.?\d*)/i)
    const ahorroVentaMatch = html.match(/Dólar Ahorro.*?Venta.*?(\$?[\d,]+\.?\d*)/i)
    if (ahorroCompraMatch) rates.ahorro.compra = extractNumber(ahorroCompraMatch[1])
    if (ahorroVentaMatch) rates.ahorro.venta = extractNumber(ahorroVentaMatch[1])

    // Dólar Oficial
    const oficialCompraMatch = html.match(/Dólar Oficial.*?Compra.*?(\$?[\d,]+\.?\d*)/i)
    const oficialVentaMatch = html.match(/Dólar Oficial.*?Venta.*?(\$?[\d,]+\.?\d*)/i)
    if (oficialCompraMatch) rates.oficial.compra = extractNumber(oficialCompraMatch[1])
    if (oficialVentaMatch) rates.oficial.venta = extractNumber(oficialVentaMatch[1])

    return NextResponse.json(rates)

  } catch (error) {
    console.error('Error fetching dollar rates:', error)
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