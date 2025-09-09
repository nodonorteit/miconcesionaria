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
    
    console.log('🔍 [API] Recibiendo datos del template:', {
      id: id,
      name: name,
      type: type,
      hasId: !!id,
      idType: typeof id,
      idValue: id,
      bodyKeys: Object.keys(body)
    })

    // Validar y limpiar el campo variables
    let cleanVariables = variables
    if (variables && typeof variables === 'object') {
      // Asegurar que variables sea un objeto JSON válido
      try {
        // Convertir a string y de vuelta para validar JSON
        cleanVariables = JSON.parse(JSON.stringify(variables))
      } catch (jsonError) {
        console.error('Error parsing variables JSON:', jsonError)
        return NextResponse.json(
          { error: 'Campo variables debe ser un objeto JSON válido' },
          { status: 400 }
        )
      }
    } else if (variables && typeof variables === 'string') {
      // Si es string, intentar parsearlo
      try {
        cleanVariables = JSON.parse(variables)
      } catch (jsonError) {
        console.error('Error parsing variables string:', jsonError)
        return NextResponse.json(
          { error: 'Campo variables debe ser un objeto JSON válido' },
          { status: 400 }
        )
      }
    }

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

    // Limpiar el ID: convertir string vacío a undefined
    const cleanId = id && id.trim() !== '' ? id : undefined
    
    console.log('🔍 [API] Procesando ID:', {
      originalId: id,
      cleanId: cleanId,
      willUpdate: !!cleanId,
      willCreate: !cleanId
    })

    if (cleanId) {
      // Verificar que el template existe antes de actualizar
      const existingTemplate = await prisma.documentTemplate.findUnique({
        where: { id: cleanId }
      })

      if (!existingTemplate) {
        console.log('❌ [API] Template no encontrado con ID:', cleanId)
        return NextResponse.json(
          { error: 'Template no encontrado' },
          { status: 404 }
        )
      }
      
      console.log('✅ [API] Template encontrado:', {
        id: existingTemplate.id,
        name: existingTemplate.name,
        newName: name.trim(),
        nameChanged: existingTemplate.name !== name.trim()
      })

      // Verificar si ya existe otro template con el mismo nombre (excluyendo el actual)
      // Solo verificar si el nombre cambió
      if (existingTemplate.name !== name.trim()) {
        const duplicateTemplate = await prisma.documentTemplate.findFirst({
          where: {
            name: name.trim(),
            type: type.trim(),
            id: { not: cleanId }
          }
        })

        if (duplicateTemplate) {
          console.log('❌ [API] Template duplicado encontrado:', duplicateTemplate)
          return NextResponse.json(
            { error: `Ya existe un template con el nombre "${name}" y tipo "${type}"` },
            { status: 400 }
          )
        }
      }

      // Actualizar template existente
      const updatedTemplate = await prisma.documentTemplate.update({
        where: { id: cleanId },
        data: {
          name: name.trim(),
          type: type.trim(),
          content,
          variables: cleanVariables,
          isActive,
          isDefault
        }
      })
      return NextResponse.json(updatedTemplate)
    } else {
      // Verificar si ya existe un template con el mismo nombre y tipo
      const duplicateTemplate = await prisma.documentTemplate.findFirst({
        where: {
          name: name.trim(),
          type: type.trim()
        }
      })

      if (duplicateTemplate) {
        return NextResponse.json(
          { error: `Ya existe un template con el nombre "${name}" y tipo "${type}"` },
          { status: 400 }
        )
      }

      // Crear nuevo template
      const newTemplate = await prisma.documentTemplate.create({
        data: {
          name: name.trim(),
          type: type.trim(),
          content,
          variables: cleanVariables,
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