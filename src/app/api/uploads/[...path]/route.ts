import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), 'uploads', ...params.path)
    
    // Verificar que el archivo existe
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Leer el archivo
    const fileBuffer = await readFile(filePath)
    
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
    }
    
    // Devolver el archivo con el tipo MIME correcto
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 