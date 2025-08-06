import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

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
        // Intentar usar el directorio uploads primero
        let uploadsDir = join(process.cwd(), 'uploads')
        let canWrite = false
        
        try {
          await mkdir(uploadsDir, { recursive: true })
          // Probar si podemos escribir en el directorio
          const testFile = join(uploadsDir, 'test.txt')
          await writeFile(testFile, 'test')
          await writeFile(testFile, '') // Limpiar archivo de prueba
          canWrite = true
        } catch (error) {
          console.log('No se puede escribir en uploads, usando directorio temporal')
          // Usar directorio temporal del sistema
          uploadsDir = join(tmpdir(), 'miconcesionaria-uploads')
          await mkdir(uploadsDir, { recursive: true })
        }

        const bytes = await logo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const filename = `company_logo_${timestamp}_${logo.name}`
        const filepath = join(uploadsDir, filename)
        
        // Guardar archivo
        await writeFile(filepath, buffer)
        
        if (canWrite) {
          logoUrl = `/uploads/${filename}`
        } else {
          // Si usamos directorio temporal, devolver el logo por defecto por ahora
          logoUrl = '/logo.svg'
          console.log('Logo guardado en directorio temporal, usando logo por defecto')
        }
        
        console.log('Logo guardado exitosamente:', filepath)
      } catch (error) {
        console.error('Error saving logo:', error)
        // Si no se puede guardar, usar el logo por defecto
        logoUrl = '/logo.svg'
        console.log('Usando logo por defecto debido a error de permisos')
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