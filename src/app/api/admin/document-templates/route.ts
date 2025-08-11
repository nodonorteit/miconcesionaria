import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los templates
export async function GET() {
  try {
    const templates = await prisma.documentTemplate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching document templates:', error)
    return NextResponse.json(
      { error: 'Error al obtener templates' },
      { status: 500 }
    )
  }
}

// POST - Crear o actualizar template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, type, content, variables, isActive, isDefault } = body

    // Si es el template por defecto, desactivar otros del mismo tipo
    if (isDefault) {
      await prisma.documentTemplate.updateMany({
        where: { 
          type,
          isDefault: true,
          id: { not: id || '' }
        },
        data: { isDefault: false }
      })
    }

    if (id) {
      // Actualizar template existente
      const updatedTemplate = await prisma.documentTemplate.update({
        where: { id },
        data: {
          name,
          type,
          content,
          variables,
          isActive,
          isDefault
        }
      })
      return NextResponse.json(updatedTemplate)
    } else {
      // Crear nuevo template
      const newTemplate = await prisma.documentTemplate.create({
        data: {
          name,
          type,
          content,
          variables,
          isActive,
          isDefault
        }
      })
      return NextResponse.json(newTemplate, { status: 201 })
    }
  } catch (error) {
    console.error('Error saving document template:', error)
    return NextResponse.json(
      { error: 'Error al guardar template' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID requerido' },
        { status: 400 }
      )
    }

    // Verificar que no sea el template por defecto
    const template = await prisma.documentTemplate.findUnique({
      where: { id }
    })

    if (template?.isDefault) {
      return NextResponse.json(
        { error: 'No se puede eliminar el template por defecto' },
        { status: 400 }
      )
    }

    await prisma.documentTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document template:', error)
    return NextResponse.json(
      { error: 'Error al eliminar template' },
      { status: 500 }
    )
  }
} 