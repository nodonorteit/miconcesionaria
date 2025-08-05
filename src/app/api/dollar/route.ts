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
    console.log('🔄 Iniciando fetch de cotizaciones desde API alternativa...')
    
    // Usar una API más confiable
    const response = await fetch('https://api-dolar-argentina.herokuapp.com/api/dolares', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 300 } // Cache por 5 minutos
    })

    if (!response.ok) {
      console.error('❌ Error en la respuesta HTTP:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Datos obtenidos:', JSON.stringify(data, null, 2))
    
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
      source: 'api-dolar-argentina.herokuapp.com'
    }

    // Función helper para extraer números
    const extractNumber = (text: string): number | null => {
      if (typeof text === 'number') return text
      const match = text.toString().match(/[\d,]+\.?\d*/)
      if (match) {
        const num = parseFloat(match[0].replace(/[$,]/g, ''))
        return isNaN(num) ? null : num
      }
      return null
    }

    // Mapear los datos de la API
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        switch (item.casa?.nombre?.toLowerCase()) {
          case 'dolar blue':
            rates.blue.compra = extractNumber(item.casa.compra)
            rates.blue.venta = extractNumber(item.casa.venta)
            break
          case 'dolar oficial':
            rates.oficial.compra = extractNumber(item.casa.compra)
            rates.oficial.venta = extractNumber(item.casa.venta)
            break
          case 'dolar mep':
            rates.mep = extractNumber(item.casa.venta)
            break
          case 'dolar ccl':
            rates.ccl.venta = extractNumber(item.casa.venta)
            break
          case 'dolar cripto':
            rates.crypto.compra = extractNumber(item.casa.compra)
            rates.crypto.venta = extractNumber(item.casa.venta)
            break
          case 'dolar tarjeta':
            rates.tarjeta.venta = extractNumber(item.casa.venta)
            break
        }
      })
    }

    // Dólar Ahorro (usar oficial como base)
    rates.ahorro.compra = rates.oficial.compra
    rates.ahorro.venta = rates.oficial.venta

    console.log('📊 Cotizaciones extraídas:', JSON.stringify(rates, null, 2))

    return NextResponse.json(rates)

  } catch (error) {
    console.error('❌ Error fetching dollar rates:', error)
    
    // Valores de fallback basados en datos recientes
    return NextResponse.json({
      mep: 1343.10,
      blue: { compra: 1305, venta: 1325 },
      ccl: { venta: 1343.80 },
      crypto: { compra: 1346, venta: 1350.39 },
      tarjeta: { venta: 1768 },
      ahorro: { compra: 1310, venta: 1360 },
      oficial: { compra: 1310, venta: 1360 },
      timestamp: new Date().toISOString(),
      source: 'fallback-data',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 