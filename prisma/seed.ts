import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@miconcesionaria.com' },
    update: {},
    create: {
      email: 'admin@miconcesionaria.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
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

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user created:', adminUser.email)
  console.log('🚗 Vehicle types created:', vehicleTypes.length)
  console.log('👨‍💼 Sample commissionist created:', commissionist.email)
  console.log('👥 Sample customer created:', customer.email)
  console.log('🏢 Sample provider created:', provider.name)
  console.log('🔧 Sample workshop created:', workshop.name)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 