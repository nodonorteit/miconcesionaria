import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener template por defecto para un tipo específico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'BOLETO_COMPRA_VENTA'
    
    const template = await prisma.documentTemplate.findFirst({
      where: { 
        type,
        isDefault: true,
        isActive: true
      }
    })
    
    if (!template) {
      return NextResponse.json(
        { error: 'No se encontró template por defecto' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching default template:', error)
    return NextResponse.json(
      { error: 'Error al obtener template por defecto' },
      { status: 500 }
    )
  }
} 