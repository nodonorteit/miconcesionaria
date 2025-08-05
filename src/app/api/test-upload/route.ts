import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Iniciando prueba de carga de archivos...')
    
    const formData = await request.formData()
    console.log('✅ FormData recibido')
    
    // Verificar si hay archivos
    const files = formData.getAll('images') as File[]
    console.log(`📁 Archivos recibidos: ${files.length}`)
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron archivos', filesCount: 0 },
        { status: 400 }
      )
    }
    
    // Crear directorio de uploads si no existe
    const uploadsDir = join(process.cwd(), 'uploads')
    console.log(`📁 Directorio de uploads: ${uploadsDir}`)
    
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log('✅ Directorio uploads creado/verificado')
    } catch (error) {
      console.error('❌ Error creando directorio:', error)
      return NextResponse.json(
        { error: 'Error creando directorio de uploads', details: error },
        { status: 500 }
      )
    }
    
    const savedFiles = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log(`📄 Procesando archivo ${i + 1}: ${file.name} (${file.size} bytes)`)
      
      if (file.size > 0) {
        try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          
          // Generar nombre único para la imagen
          const timestamp = Date.now()
          const filename = `test_${timestamp}_${i}_${file.name}`
          const filepath = join(uploadsDir, filename)
          
          console.log(`💾 Guardando archivo: ${filepath}`)
          
          // Guardar archivo
          await writeFile(filepath, buffer)
          
          savedFiles.push({
            originalName: file.name,
            savedName: filename,
            size: file.size,
            path: `/uploads/${filename}`
          })
          
          console.log(`✅ Archivo guardado: ${filename}`)
        } catch (error) {
          console.error(`❌ Error guardando archivo ${file.name}:`, error)
          return NextResponse.json(
            { error: `Error guardando archivo ${file.name}`, details: error },
            { status: 500 }
          )
        }
      } else {
        console.log(`⚠️ Archivo ${file.name} está vacío`)
      }
    }
    
    console.log('✅ Prueba completada exitosamente')
    
    return NextResponse.json({
      success: true,
      message: 'Archivos cargados correctamente',
      filesCount: files.length,
      savedFiles: savedFiles
    })
    
  } catch (error) {
    console.error('❌ Error en prueba de carga:', error)
    return NextResponse.json(
      { error: 'Error en prueba de carga', details: error },
      { status: 500 }
    )
  }
} 