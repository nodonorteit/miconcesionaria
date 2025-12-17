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
      // Crear tablas desde el schema usando db push
      const dbUrl = buildDatabaseUrl(dbHost, dbPort, dbName, dbUser, dbPassword)

      try {
        // Ejecutar prisma db push con DATABASE_URL en el entorno
        const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss', {
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
          message: 'Tablas creadas exitosamente',
          output: stdout 
        })
      } catch (error: any) {
        console.error('Migration error:', error)
        const errorMessage = error.stderr || error.message || 'Error desconocido'
        return NextResponse.json(
          { error: `Error al crear tablas: ${errorMessage}` },
          { status: 500 }
        )
      }
    }

    if (action === 'seed') {
      // Ejecutar seed directamente desde el código
      const dbUrl = buildDatabaseUrl(dbHost, dbPort, dbName, dbUser, dbPassword)
      
      try {
        // Establecer DATABASE_URL para Prisma
        process.env.DATABASE_URL = dbUrl
        
        // Importar y ejecutar el seed
        const { PrismaClient } = await import('@prisma/client')
        const bcrypt = await import('bcryptjs')
        const prisma = new PrismaClient()

        // Crear admin user
        const hashedPassword = await bcrypt.default.hash('admin123', 12)
        const adminUser = await prisma.user.upsert({
          where: { email: 'admin@miconcesionaria.com' },
          update: { mustChangePassword: true },
          create: {
            email: 'admin@miconcesionaria.com',
            name: 'Administrador',
            password: hashedPassword,
            role: 'ADMIN',
            mustChangePassword: true,
          },
        })

        // Crear vehicle types
        await Promise.all([
          prisma.vehicleType.upsert({
            where: { name: 'Automóvil' },
            update: {},
            create: { name: 'Automóvil', description: 'Vehículos de pasajeros' },
          }),
          prisma.vehicleType.upsert({
            where: { name: 'Camioneta' },
            update: {},
            create: { name: 'Camioneta', description: 'Vehículos utilitarios' },
          }),
          prisma.vehicleType.upsert({
            where: { name: 'Camión' },
            update: {},
            create: { name: 'Camión', description: 'Vehículos de carga' },
          }),
          prisma.vehicleType.upsert({
            where: { name: 'Moto' },
            update: {},
            create: { name: 'Moto', description: 'Motocicletas' },
          }),
        ])

        // Crear template por defecto
        const defaultTemplateContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Boleto de Compra-Venta</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .document-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; margin-bottom: 10px; }
    .row { display: flex; margin-bottom: 10px; }
    .col { flex: 1; }
    .signature { margin-top: 50px; }
  </style>
</head>
<body>
  <div class="header">
    {{#if company.logoUrl}}
    <img src="{{company.logoUrl}}" alt="Logo" style="max-height: 80px;">
    {{/if}}
    <h1>{{company.name}}</h1>
    <p>{{company.address}}, {{company.city}}, {{company.state}}</p>
    <p>CUIT: {{company.cuit}}</p>
  </div>
  
  <div class="document-title">BOLETO DE COMPRA-VENTA N° {{document.number}}</div>
  
  <div class="section">
    <div class="section-title">DATOS DEL VENDEDOR</div>
    <div class="row">
      <div class="col"><strong>Nombre:</strong> {{company.name}}</div>
      <div class="col"><strong>CUIT:</strong> {{company.cuit}}</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">DATOS DEL COMPRADOR</div>
    <div class="row">
      <div class="col"><strong>Nombre:</strong> {{customer.firstName}} {{customer.lastName}}</div>
      <div class="col"><strong>{{customer.documentLabel}}:</strong> {{customer.documentFormatted}}</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">DATOS DEL VEHÍCULO</div>
    <div class="row">
      <div class="col"><strong>Marca:</strong> {{vehicle.brand}}</div>
      <div class="col"><strong>Modelo:</strong> {{vehicle.model}}</div>
    </div>
    <div class="row">
      <div class="col"><strong>Año:</strong> {{vehicle.year}}</div>
      <div class="col"><strong>Patente:</strong> {{vehicle.licensePlate}}</div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">DATOS DE LA OPERACIÓN</div>
    <div class="row">
      <div class="col"><strong>Precio:</strong> {{sale.totalAmountFormatted}}</div>
      <div class="col"><strong>Forma de Pago:</strong> {{sale.paymentMethod}}</div>
    </div>
    <div class="row">
      <div class="col"><strong>Fecha:</strong> {{sale.date}}</div>
    </div>
  </div>
  
  <div class="signature">
    <div class="row">
      <div class="col" style="text-align: center;">
        <p>_________________________</p>
        <p><strong>VENDEDOR</strong></p>
        <p>{{company.name}}</p>
      </div>
      <div class="col" style="text-align: center;">
        <p>_________________________</p>
        <p><strong>COMPRADOR</strong></p>
        <p>{{customer.firstName}} {{customer.lastName}}</p>
      </div>
    </div>
  </div>
</body>
</html>`

        await prisma.documentTemplate.upsert({
          where: { name: 'Boleto de Compra-Venta - Por Defecto' },
          update: {},
          create: {
            name: 'Boleto de Compra-Venta - Por Defecto',
            type: 'BOLETO_COMPRA_VENTA',
            isDefault: true,
            isActive: true,
            content: defaultTemplateContent,
            variables: {
              company: ['name', 'logoUrl', 'address', 'city', 'state', 'cuit', 'phone', 'email', 'postalCode', 'ivaCondition'],
              customer: ['firstName', 'lastName', 'documentNumber', 'documentType', 'documentLabel', 'documentFormatted', 'address', 'city', 'state'],
              vehicle: ['brand', 'model', 'year', 'type', 'licensePlate', 'vin', 'mileage'],
              sale: ['totalAmount', 'totalAmountFormatted', 'paymentMethod', 'date', 'deliveryDate', 'notes'],
              document: ['number', 'generatedAt']
            }
          }
        })

        await prisma.$disconnect()

        return NextResponse.json({ 
          success: true, 
          message: 'Datos iniciales creados exitosamente',
          adminEmail: adminUser.email
        })
      } catch (error: any) {
        console.error('Seed error:', error)
        return NextResponse.json(
          { error: `Error al crear datos iniciales: ${error.message || 'Error desconocido'}` },
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

