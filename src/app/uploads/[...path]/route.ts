import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Servir archivos directamente desde el volumen Docker
    const filePath = join('/app/uploads', ...params.path)
    console.log('🔍 [Static Route] Buscando archivo:', filePath)
    
    // Verificar que el archivo existe
    if (!existsSync(filePath)) {
      console.error(`❌ [Static Route] File not found: ${filePath}`)
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Verificar que es un archivo (no un directorio)
    const fs = await import('fs')
    const stats = await fs.promises.stat(filePath)
    if (!stats.isFile()) {
      console.error(`❌ [Static Route] Path is not a file: ${filePath}`)
      return new NextResponse('Not a file', { status: 400 })
    }
    
    console.log('📄 [Static Route] Leyendo archivo:', filePath, 'Tamaño:', stats.size)
    
    // Leer el archivo
    const fileBuffer = await readFile(filePath)
    
    // Verificar que el archivo no esté vacío
    if (fileBuffer.length === 0) {
      console.error(`❌ [Static Route] File is empty: ${filePath}`)
      return new NextResponse('File is empty', { status: 400 })
    }
    
    console.log('✅ [Static Route] Archivo leído correctamente, tamaño:', fileBuffer.length, 'bytes')
    
    // Determinar el tipo MIME basado en la extensión
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      default:
        // Intentar detectar el tipo MIME basado en el contenido del archivo
        if (fileBuffer.length >= 2) {
          const header = fileBuffer.subarray(0, 2)
          if (header[0] === 0xFF && header[1] === 0xD8) {
            contentType = 'image/jpeg'
          } else if (header[0] === 0x89 && header[1] === 0x50) {
            contentType = 'image/png'
          } else if (header[0] === 0x47 && header[1] === 0x49) {
            contentType = 'image/gif'
          }
        }
        break
    }
    
    console.log('🎨 [Static Route] Content-Type detectado:', contentType)
    
    // Devolver el archivo con el tipo MIME correcto y headers de cache
    const response = new NextResponse(fileBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache por 1 año
        'Content-Length': fileBuffer.length.toString(),
        'Access-Control-Allow-Origin': '*', // Permitir CORS para imágenes
      },
    })
    
    console.log('✅ [Static Route] Archivo servido correctamente')
    return response
    
  } catch (error) {
    console.error('❌ [Static Route] Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 