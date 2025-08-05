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
    console.log('🔄 Iniciando fetch de cotizaciones desde dolarapi.com...')
    
    // Usar dolarapi.com - API confiable y gratuita
    const response = await fetch('https://dolarapi.com/v1/dolares', {
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
    console.log('✅ Datos obtenidos de dolarapi.com')
    
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
      source: 'dolarapi.com'
    }

    // Mapear los datos de la API según el formato de dolarapi.com
    data.forEach((item: any) => {
      switch (item.casa) {
        case 'oficial':
          rates.oficial.compra = item.compra
          rates.oficial.venta = item.venta
          break
        case 'blue':
          rates.blue.compra = item.compra
          rates.blue.venta = item.venta
          break
        case 'mep':
          rates.mep = item.venta
          break
        case 'ccl':
          rates.ccl.venta = item.venta
          break
        case 'crypto':
          rates.crypto.compra = item.compra
          rates.crypto.venta = item.venta
          break
        case 'tarjeta':
          rates.tarjeta.venta = item.venta
          break
        case 'ahorro':
          rates.ahorro.compra = item.compra
          rates.ahorro.venta = item.venta
          break
      }
    })

    // Si no hay tarjeta, calcular basado en oficial
    if (!rates.tarjeta.venta && rates.oficial.venta) {
      rates.tarjeta.venta = rates.oficial.venta * 1.35 // 35% de impuestos
    }

    // Si no hay ahorro, usar oficial
    if (!rates.ahorro.compra && rates.oficial.compra) {
      rates.ahorro.compra = rates.oficial.compra
    }
    if (!rates.ahorro.venta && rates.oficial.venta) {
      rates.ahorro.venta = rates.oficial.venta
    }

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
      source: 'dolarapi.com',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 