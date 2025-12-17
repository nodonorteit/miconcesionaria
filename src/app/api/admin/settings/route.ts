import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener configuración del sistema
export async function GET() {
  try {
    // Intentar obtener configuración de la base de datos
    const config = await prisma.$queryRaw`
      SELECT * FROM system_settings ORDER BY updatedAt DESC LIMIT 1
    `
    
    if (Array.isArray(config) && config.length > 0) {
      const result = config[0] as any
      return NextResponse.json({
        maintenanceMode: result.maintenanceMode === 1 || result.maintenanceMode === true,
        debugMode: result.debugMode === 1 || result.debugMode === true,
        emailNotifications: result.emailNotifications === 1 || result.emailNotifications === true,
        autoBackup: result.autoBackup === 1 || result.autoBackup === true,
        sessionTimeout: result.sessionTimeout || 30,
        maxFileSize: result.maxFileSize || 10,
        allowedFileTypes: result.allowedFileTypes ? JSON.parse(result.allowedFileTypes) : ['jpg', 'jpeg', 'png', 'pdf', 'webp']
      })
    }
    
    // Si no existe, devolver configuración por defecto
    return NextResponse.json({
      maintenanceMode: false,
      debugMode: false,
      emailNotifications: true,
      autoBackup: true,
      sessionTimeout: 30,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'webp']
    })
  } catch (error) {
    console.error('Error fetching system settings:', error)
    // En caso de error, devolver configuración por defecto
    return NextResponse.json({
      maintenanceMode: false,
      debugMode: false,
      emailNotifications: true,
      autoBackup: true,
      sessionTimeout: 30,
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'webp']
    })
  }
}

// POST - Guardar configuración del sistema
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 [DEBUG] Recibiendo settings:', body)
    
    const {
      maintenanceMode,
      debugMode,
      emailNotifications,
      autoBackup,
      sessionTimeout,
      maxFileSize,
      allowedFileTypes
    } = body
    
    console.log('🔍 [DEBUG] Settings parseados:', {
      maintenanceMode,
      debugMode,
      emailNotifications,
      autoBackup,
      sessionTimeout,
      maxFileSize,
      allowedFileTypes
    })

    // Guardar configuración en base de datos
    // Primero intentar crear la tabla si no existe
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          maintenanceMode TINYINT(1) DEFAULT 0,
          debugMode TINYINT(1) DEFAULT 0,
          emailNotifications TINYINT(1) DEFAULT 1,
          autoBackup TINYINT(1) DEFAULT 1,
          sessionTimeout INT DEFAULT 30,
          maxFileSize INT DEFAULT 10,
          allowedFileTypes TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
    } catch (createError) {
      // La tabla ya existe, continuar
      console.log('Tabla system_settings ya existe o error al crearla:', createError)
    }

    // Verificar si ya existe un registro
    const existing = await prisma.$queryRaw`
      SELECT id FROM system_settings LIMIT 1
    `

    const allowedFileTypesJson = JSON.stringify(allowedFileTypes || ['jpg', 'jpeg', 'png', 'pdf', 'webp'])
    const maintenanceModeValue = maintenanceMode ? 1 : 0
    const debugModeValue = debugMode ? 1 : 0
    const emailNotificationsValue = emailNotifications ? 1 : 0
    const autoBackupValue = autoBackup ? 1 : 0
    const sessionTimeoutValue = sessionTimeout || 30
    const maxFileSizeValue = maxFileSize || 10

    if (Array.isArray(existing) && existing.length > 0) {
      // Actualizar registro existente
      console.log('📝 Actualizando registro existente...')
      await prisma.$executeRawUnsafe(
        `UPDATE system_settings SET
          maintenanceMode = ?,
          debugMode = ?,
          emailNotifications = ?,
          autoBackup = ?,
          sessionTimeout = ?,
          maxFileSize = ?,
          allowedFileTypes = ?,
          updatedAt = NOW()
        LIMIT 1`,
        maintenanceModeValue,
        debugModeValue,
        emailNotificationsValue,
        autoBackupValue,
        sessionTimeoutValue,
        maxFileSizeValue,
        allowedFileTypesJson
      )
      console.log('✅ Registro actualizado')
    } else {
      // Insertar nuevo registro
      console.log('📝 Insertando nuevo registro...')
      await prisma.$executeRawUnsafe(
        `INSERT INTO system_settings (
          maintenanceMode,
          debugMode,
          emailNotifications,
          autoBackup,
          sessionTimeout,
          maxFileSize,
          allowedFileTypes,
          createdAt,
          updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        maintenanceModeValue,
        debugModeValue,
        emailNotificationsValue,
        autoBackupValue,
        sessionTimeoutValue,
        maxFileSizeValue,
        allowedFileTypesJson
      )
      console.log('✅ Registro insertado')
    }

    console.log('✅ Configuración guardada exitosamente')
    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente'
    })
  } catch (error) {
    console.error('Error saving system settings:', error)
    return NextResponse.json(
      { error: 'Error al guardar la configuración' },
      { status: 500 }
    )
  }
}

