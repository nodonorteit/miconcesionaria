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
    console.log('🔄 Iniciando fetch de cotizaciones desde API simple...')
    
    // Usar una API más simple y confiable
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest', {
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
    console.log('✅ Datos obtenidos de Bluelytics')
    
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
      source: 'bluelytics.com.ar'
    }

    // Mapear los datos de la API
    if (data.oficial) {
      rates.oficial.compra = data.oficial.value_buy
      rates.oficial.venta = data.oficial.value_sell
    }
    
    if (data.blue) {
      rates.blue.compra = data.blue.value_buy
      rates.blue.venta = data.blue.value_sell
    }
    
    if (data.mep) {
      rates.mep = data.mep.value_sell
    }
    
    if (data.ccl) {
      rates.ccl.venta = data.ccl.value_sell
    }
    
    if (data.crypto) {
      rates.crypto.compra = data.crypto.value_buy
      rates.crypto.venta = data.crypto.value_sell
    }

    // Calcular tarjeta (oficial + impuestos)
    if (rates.oficial.venta) {
      rates.tarjeta.venta = rates.oficial.venta * 1.35 // 35% de impuestos
    }

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
      source: 'bluelytics.com.ar',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 