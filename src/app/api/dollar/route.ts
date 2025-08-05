import { NextResponse } from 'next/server'

interface DollarRate {
  casa: string
  nombre: string
  compra: number | null
  venta: number | null
  agencia: string
  variacion: number | null
  ventaCero: boolean
  decimales: number
}

interface DollarRates {
  rates: DollarRate[]
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
    
    // Devolver directamente los datos de dolarapi.com
    const rates: DollarRates = {
      rates: data,
      timestamp: new Date().toISOString(),
      source: 'dolarapi.com'
    }

    console.log('📊 Cotizaciones extraídas:', JSON.stringify(rates, null, 2))

    return NextResponse.json(rates)

  } catch (error) {
    console.error('❌ Error fetching dollar rates:', error)
    
    // Devolver valores null en caso de error
    return NextResponse.json({
      rates: [],
      timestamp: new Date().toISOString(),
      source: 'dolarapi.com',
      error: 'Error al obtener las cotizaciones del dólar'
    })
  }
} 