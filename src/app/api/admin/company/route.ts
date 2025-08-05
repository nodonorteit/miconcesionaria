import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// GET - Obtener configuración de empresa
export async function GET() {
  try {
    // Por ahora devolvemos configuración por defecto
    // En el futuro se puede almacenar en base de datos
    return NextResponse.json({
      name: 'AutoMax',
      logoUrl: '/logo.svg',
      description: 'Sistema de Gestión'
    })
  } catch (error) {
    console.error('Error fetching company config:', error)
    return NextResponse.json(
      { error: 'Error fetching company config' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración de empresa
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const logo = formData.get('logo') as File

    let logoUrl = '/logo.svg' // Por defecto

    // Procesar logo si se subió uno nuevo
    if (logo && logo.size > 0) {
      try {
        // Usar el directorio uploads que ya existe en el contenedor
        const uploadsDir = join(process.cwd(), 'uploads')
        await mkdir(uploadsDir, { recursive: true })

        const bytes = await logo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const filename = `company_logo_${timestamp}_${logo.name}`
        const filepath = join(uploadsDir, filename)
        
        // Guardar archivo
        await writeFile(filepath, buffer)
        logoUrl = `/uploads/${filename}`
      } catch (error) {
        console.error('Error saving logo:', error)
        // Si no se puede guardar, usar el logo por defecto
        logoUrl = '/logo.svg'
      }
    }

    // Por ahora solo devolvemos la configuración actualizada
    // En el futuro se puede guardar en base de datos
    const config = {
      name: name || 'AutoMax',
      logoUrl,
      description: description || 'Sistema de Gestión'
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating company config:', error)
    return NextResponse.json(
      { error: 'Error updating company config' },
      { status: 500 }
    )
  }
} 