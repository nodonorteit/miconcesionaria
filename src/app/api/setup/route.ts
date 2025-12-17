import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const execAsync = promisify(exec)

interface SetupRequest {
  action: 'create-db' | 'migrate' | 'seed' | 'finalize'
  dbHost: string
  dbPort: string
  dbName: string
  dbUser: string
  dbPassword: string
  rootPassword: string
}

function buildDatabaseUrl(host: string, port: string, database: string, user: string, password: string): string {
  // URL encode password para caracteres especiales
  const encodedPassword = encodeURIComponent(password)
  return `mysql://${user}:${encodedPassword}@${host}:${port}/${database}`
}

export async function POST(request: NextRequest) {
  try {
    const body: SetupRequest = await request.json()
    const { action, dbHost, dbPort, dbName, dbUser, dbPassword, rootPassword } = body

    if (action === 'create-db') {
      // Crear base de datos y usuario usando MySQL root
      const rootUrl = buildDatabaseUrl(dbHost, dbPort, 'mysql', 'root', rootPassword)
      const rootPrisma = new PrismaClient({
        datasources: {
          db: {
            url: rootUrl
          }
        }
      })

      try {
        // Crear base de datos
        await rootPrisma.$executeRawUnsafe(
          `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        )

        // Crear usuario y otorgar permisos
        await rootPrisma.$executeRawUnsafe(
          `CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY ?`,
          dbPassword
        )

        await rootPrisma.$executeRawUnsafe(
          `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`
        )

        await rootPrisma.$executeRawUnsafe(`FLUSH PRIVILEGES`)

        await rootPrisma.$disconnect()

        return NextResponse.json({ success: true, message: 'Base de datos y usuario creados exitosamente' })
      } catch (error) {
        await rootPrisma.$disconnect()
        console.error('Error creating database:', error)
        throw error
      }
    }

    if (action === 'migrate') {
      // Ejecutar migraciones de Prisma
      const dbUrl = buildDatabaseUrl(dbHost, dbPort, dbName, dbUser, dbPassword)

      try {
        // Ejecutar prisma migrate deploy con DATABASE_URL en el entorno
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
          env: { 
            ...process.env, 
            DATABASE_URL: dbUrl,
            PATH: process.env.PATH
          },
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        })

        if (stderr && !stderr.includes('warning') && !stderr.includes('No schema found')) {
          console.error('Migration stderr:', stderr)
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Migraciones aplicadas exitosamente',
          output: stdout 
        })
      } catch (error: any) {
        console.error('Migration error:', error)
        const errorMessage = error.stderr || error.message || 'Error desconocido'
        return NextResponse.json(
          { error: `Error al aplicar migraciones: ${errorMessage}` },
          { status: 500 }
        )
      }
    }

    if (action === 'seed') {
      // Ejecutar seed de Prisma
      const dbUrl = buildDatabaseUrl(dbHost, dbPort, dbName, dbUser, dbPassword)
      
      try {
        // Ejecutar prisma db seed con DATABASE_URL en el entorno
        const { stdout, stderr } = await execAsync('npx prisma db seed', {
          env: { 
            ...process.env, 
            DATABASE_URL: dbUrl,
            PATH: process.env.PATH
          },
          cwd: process.cwd(),
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        })

        if (stderr && !stderr.includes('warning')) {
          console.error('Seed stderr:', stderr)
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Datos iniciales creados exitosamente',
          output: stdout 
        })
      } catch (error: any) {
        console.error('Seed error:', error)
        const errorMessage = error.stderr || error.message || 'Error desconocido'
        return NextResponse.json(
          { error: `Error al crear datos iniciales: ${errorMessage}` },
          { status: 500 }
        )
      }
    }

    if (action === 'finalize') {
      // Guardar configuración en un archivo para uso futuro
      const dbUrl = buildDatabaseUrl(dbHost, dbPort, dbName, dbUser, dbPassword)
      
      try {
        // Guardar en un archivo de configuración
        const configDir = join(process.cwd(), '.config')
        await mkdir(configDir, { recursive: true })
        
        const configFile = join(configDir, 'database.json')
        await writeFile(
          configFile,
          JSON.stringify({
            dbHost,
            dbPort,
            dbName,
            dbUser,
            // No guardar contraseñas en texto plano en producción
            // En producción, esto debería ir a un secret manager
            dbUrl,
            setupCompleted: true,
            setupDate: new Date().toISOString()
          }, null, 2)
        )

        // También actualizar DATABASE_URL en .env si existe
        // (En Docker esto se maneja con variables de entorno del contenedor)

        return NextResponse.json({ 
          success: true, 
          message: 'Configuración finalizada exitosamente' 
        })
      } catch (error: any) {
        console.error('Finalize error:', error)
        return NextResponse.json(
          { error: `Error al finalizar configuración: ${error.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Error desconocido durante la configuración' },
      { status: 500 }
    )
  }
}

// GET - Verificar estado del setup
export async function GET() {
  try {
    // Intentar conectar a la base de datos usando DATABASE_URL actual
    const prisma = new PrismaClient()
    
    try {
      // Verificar si existe la tabla User y tiene el admin
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@miconcesionaria.com' }
      })

      await prisma.$disconnect()

      if (adminUser) {
        return NextResponse.json({ 
          setupCompleted: true,
          message: 'El sistema ya está configurado' 
        })
      }

      return NextResponse.json({ 
        setupCompleted: false,
        message: 'El sistema necesita configuración inicial' 
      })
    } catch (error) {
      await prisma.$disconnect()
      // Si no puede conectar, el setup no está completo
      return NextResponse.json({ 
        setupCompleted: false,
        message: 'No se puede conectar a la base de datos. Se requiere configuración inicial.' 
      })
    }
  } catch (error) {
    return NextResponse.json({ 
      setupCompleted: false,
      message: 'Error al verificar estado del setup' 
    })
  }
}

