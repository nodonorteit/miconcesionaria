import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@miconcesionaria.com' },
    update: {
      mustChangePassword: true
    },
    create: {
      email: 'admin@miconcesionaria.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      mustChangePassword: true,
    },
  })

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 12)
  
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@miconcesionaria.com' },
    update: {},
    create: {
      email: 'manager@miconcesionaria.com',
      name: 'Gerente',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 12)
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@miconcesionaria.com' },
    update: {},
    create: {
      email: 'user@miconcesionaria.com',
      name: 'Usuario',
      password: userPassword,
      role: 'USER',
    },
  })

  console.log('👤 Users created:', { adminUser, managerUser, regularUser })

  // Create vehicle types
  const vehicleTypes = await Promise.all([
    prisma.vehicleType.upsert({
      where: { name: 'Automóvil' },
      update: {},
      create: {
        name: 'Automóvil',
        description: 'Vehículos de pasajeros',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Camioneta' },
      update: {},
      create: {
        name: 'Camioneta',
        description: 'Vehículos utilitarios',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Camión' },
      update: {},
      create: {
        name: 'Camión',
        description: 'Vehículos de carga',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Moto' },
      update: {},
      create: {
        name: 'Moto',
        description: 'Motocicletas',
      },
    }),
  ])

  // Create sample commissionist
  const commissionist = await prisma.commissionist.upsert({
    where: { email: 'comisionista@miconcesionaria.com' },
    update: {},
    create: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'comisionista@miconcesionaria.com',
      phone: '+54 11 1234-5678',
      commissionRate: 0.05, // 5%
    },
  })

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      firstName: 'María',
      lastName: 'González',
      email: 'cliente@ejemplo.com',
      phone: '+54 11 9876-5432',
      address: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      documentNumber: '12345678',
    },
  })

  // Create sample provider
  const provider = await prisma.provider.upsert({
    where: { taxId: '30-12345678-9' },
    update: {},
    create: {
      name: 'Proveedor Ejemplo S.A.',
      email: 'contacto@proveedor.com',
      phone: '+54 11 5555-1234',
      address: 'Av. Libertador 5678',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      taxId: '30-12345678-9',
    },
  })

  // Create sample workshop
  const workshop = await prisma.workshop.create({
    data: {
      name: 'Taller Ejemplo',
      email: 'info@tallerejemplo.com',
      phone: '+54 11 4444-5678',
      address: 'Calle Ejemplo 999',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
    },
  })

  // Create default document template for BOLETO_COMPRA_VENTA
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

  const defaultTemplate = await prisma.documentTemplate.upsert({
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
        sale: ['totalAmount', 'paymentMethod', 'date', 'deliveryDate', 'notes'],
        document: ['number', 'generatedAt']
      }
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user created:', adminUser.email)
  console.log('🚗 Vehicle types created:', vehicleTypes.length)
  console.log('👨‍💼 Sample commissionist created:', commissionist.email)
  console.log('👥 Sample customer created:', customer.email)
  console.log('🏢 Sample provider created:', provider.name)
  console.log('🔧 Sample workshop created:', workshop.name)
  console.log('📄 Default document template created:', defaultTemplate.name)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 