import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

// GET - Obtener configuración de empresa
export async function GET() {
  try {
    console.log('🔍 Buscando configuración de empresa en base de datos...')
    
    // Intentar obtener configuración de la base de datos
    const config = await prisma.$queryRaw`
      SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
    `
    
    console.log('📊 Configuración encontrada:', config)
    
    if (Array.isArray(config) && config.length > 0) {
      const result = config[0]
      console.log('✅ Devolviendo configuración de BD:', result)
      return NextResponse.json(result)
    }
    
    // Si no existe, devolver configuración por defecto
    console.log('⚠️ No hay configuración en BD, usando por defecto')
    return NextResponse.json({
      name: 'AutoMax',
      logoUrl: '/logo.svg',
      description: 'Sistema de Gestión'
    })
  } catch (error) {
    console.error('❌ Error fetching company config:', error)
    // En caso de error, devolver configuración por defecto
    return NextResponse.json({
      name: 'AutoMax',
      logoUrl: '/logo.svg',
      description: 'Sistema de Gestión'
    })
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
        // Usar el directorio uploads mapeado
        const uploadsDir = join(process.cwd(), 'uploads')
        
        // Crear directorio si no existe
        await mkdir(uploadsDir, { recursive: true })
        
        // Verificar permisos de escritura
        const testFile = join(uploadsDir, 'test.txt')
        await writeFile(testFile, 'test')
        await writeFile(testFile, '') // Limpiar archivo de prueba
        
        const bytes = await logo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const filename = `company_logo_${timestamp}_${logo.name}`
        const filepath = join(uploadsDir, filename)
        
        // Guardar archivo
        await writeFile(filepath, buffer)
        
        // Devolver la URL correcta
        logoUrl = `/uploads/${filename}`
        console.log('✅ Logo guardado exitosamente:', logoUrl)
        
      } catch (error) {
        console.error('❌ Error saving logo:', error)
        // Si no se puede guardar, usar el logo por defecto
        logoUrl = '/logo.svg'
        console.log('⚠️ Usando logo por defecto debido a error de permisos')
      }
    }

    // Guardar configuración en base de datos
    try {
      console.log('💾 Guardando en BD:', { name, logoUrl, description })
      
      await prisma.$executeRaw`
        INSERT INTO company_config (name, logoUrl, description, createdAt, updatedAt)
        VALUES (${name || 'AutoMax'}, ${logoUrl}, ${description || 'Sistema de Gestión'}, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        logoUrl = VALUES(logoUrl),
        description = VALUES(description),
        updatedAt = NOW()
      `
      
      console.log('✅ Configuración guardada en BD exitosamente')
    } catch (error) {
      console.error('❌ Error saving to database:', error)
      // Si falla la base de datos, continuar con la respuesta
    }

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