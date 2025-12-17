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
    
    // Si no existe, devolver configuración por defecto vacía
    console.log('⚠️ No hay configuración en BD, usando valores por defecto')
    return NextResponse.json({
      name: '',
      logoUrl: '',
      description: '',
      address: '',
      city: '',
      state: '',
      cuit: '',
      phone: '',
      email: '',
      postalCode: '',
      ivaCondition: ''
    })
  } catch (error) {
    console.error('❌ Error fetching company config:', error)
    // En caso de error, devolver configuración por defecto vacía
    return NextResponse.json({
      name: '',
      logoUrl: '',
      description: '',
      address: '',
      city: '',
      state: '',
      cuit: '',
      phone: '',
      email: '',
      postalCode: '',
      ivaCondition: ''
    })
  }
}

// POST - Actualizar configuración de empresa
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const cuit = formData.get('cuit') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const postalCode = formData.get('postalCode') as string
    const ivaCondition = formData.get('ivaCondition') as string
    const logo = formData.get('logo') as File

    let logoUrl = '' // Sin valor por defecto

    // Procesar logo si se subió uno nuevo
    if (logo && logo.size > 0) {
      console.log('📁 Procesando logo:', logo.name, 'Tamaño:', logo.size)
      try {
        // Usar el directorio uploads mapeado
        const uploadsDir = join(process.cwd(), 'uploads')
        console.log('📂 Directorio uploads:', uploadsDir)
        
        // Crear directorio si no existe
        await mkdir(uploadsDir, { recursive: true })
        console.log('✅ Directorio creado/verificado')
        
        const bytes = await logo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const filename = `company_logo_${timestamp}_${logo.name}`
        const filepath = join(uploadsDir, filename)
        console.log('📄 Guardando archivo en:', filepath)
        
        // Guardar archivo directamente
        await writeFile(filepath, buffer)
        console.log('✅ Archivo guardado exitosamente')
        
        // Devolver la URL correcta
        logoUrl = `/uploads/${filename}`
        console.log('🔗 URL del logo:', logoUrl)
        
      } catch (error) {
        console.error('❌ Error saving logo:', error)
        // Si no se puede guardar, continuar sin logo
        logoUrl = ''
        console.log('⚠️ No se pudo guardar el logo')
      }
    } else {
      console.log('📝 No se subió ningún logo nuevo')
    }

    // Obtener configuración existente para preservar logoUrl si no se sube uno nuevo
    let existingConfig: any = null
    try {
      const existing = await prisma.$queryRaw`
        SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
      `
      if (Array.isArray(existing) && existing.length > 0) {
        existingConfig = existing[0]
      }
    } catch (error) {
      console.log('No hay configuración existente')
    }

    // Si no se subió un logo nuevo, usar el existente
    if (!logoUrl && existingConfig && existingConfig.logoUrl) {
      logoUrl = existingConfig.logoUrl
    }

    // Guardar configuración en base de datos
    try {
      console.log('💾 Guardando en BD:', { name, logoUrl, description, address, city, state, cuit, phone, email, postalCode, ivaCondition })
      
      await prisma.$executeRawUnsafe(
        `INSERT INTO company_config (name, logoUrl, description, address, city, state, cuit, phone, email, postalCode, ivaCondition, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        logoUrl = VALUES(logoUrl),
        description = VALUES(description),
        address = VALUES(address),
        city = VALUES(city),
        state = VALUES(state),
        cuit = VALUES(cuit),
        phone = VALUES(phone),
        email = VALUES(email),
        postalCode = VALUES(postalCode),
        ivaCondition = VALUES(ivaCondition),
        updatedAt = NOW()`,
        name || '',
        logoUrl || '',
        description || '',
        address || '',
        city || '',
        state || '',
        cuit || '',
        phone || '',
        email || '',
        postalCode || '',
        ivaCondition || ''
      )
      
      console.log('✅ Configuración guardada en BD exitosamente')
      console.log('🔗 URL final guardada en BD:', logoUrl)
    } catch (error) {
      console.error('❌ Error saving to database:', error)
      // Si falla la base de datos, continuar con la respuesta
    }

    const config = {
      name: name || '',
      logoUrl: logoUrl || '',
      description: description || '',
      address: address || '',
      city: city || '',
      state: state || '',
      cuit: cuit || '',
      phone: phone || '',
      email: email || '',
      postalCode: postalCode || '',
      ivaCondition: ivaCondition || ''
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