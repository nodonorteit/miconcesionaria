const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

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

  // Create vehicle types - Automotriz
  const vehicleTypes = await Promise.all([
    prisma.vehicleType.upsert({
      where: { name: 'Sedán' },
      update: {},
      create: {
        name: 'Sedán',
        description: 'Vehículo de pasajeros con 4 puertas',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'SUV' },
      update: {},
      create: {
        name: 'SUV',
        description: 'Vehículo utilitario deportivo',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Camioneta' },
      update: {},
      create: {
        name: 'Camioneta',
        description: 'Vehículo de carga ligera',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Hatchback' },
      update: {},
      create: {
        name: 'Hatchback',
        description: 'Vehículo compacto con portón trasero',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Pickup' },
      update: {},
      create: {
        name: 'Pickup',
        description: 'Camioneta con caja de carga',
      },
    }),
    // Motocicletas
    prisma.vehicleType.upsert({
      where: { name: 'Moto' },
      update: {},
      create: {
        name: 'Moto',
        description: 'Motocicleta de dos ruedas',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Scooter' },
      update: {},
      create: {
        name: 'Scooter',
        description: 'Motocicleta urbana con plataforma',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Cuatriciclo' },
      update: {},
      create: {
        name: 'Cuatriciclo',
        description: 'Vehículo todo terreno de 4 ruedas',
      },
    }),
    // Comercial
    prisma.vehicleType.upsert({
      where: { name: 'Camión' },
      update: {},
      create: {
        name: 'Camión',
        description: 'Vehículo de carga pesada',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Furgón' },
      update: {},
      create: {
        name: 'Furgón',
        description: 'Vehículo de carga cerrado',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Van Comercial' },
      update: {},
      create: {
        name: 'Van Comercial',
        description: 'Furgoneta para uso comercial',
      },
    }),
    // Agrícola
    prisma.vehicleType.upsert({
      where: { name: 'Tractor' },
      update: {},
      create: {
        name: 'Tractor',
        description: 'Maquinaria agrícola',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Cosechadora' },
      update: {},
      create: {
        name: 'Cosechadora',
        description: 'Maquinaria para cosecha',
      },
    }),
    // Marítimo
    prisma.vehicleType.upsert({
      where: { name: 'Lancha' },
      update: {},
      create: {
        name: 'Lancha',
        description: 'Embarcación recreativa',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Yate' },
      update: {},
      create: {
        name: 'Yate',
        description: 'Embarcación de lujo',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Moto de Agua' },
      update: {},
      create: {
        name: 'Moto de Agua',
        description: 'Vehículo acuático recreativo',
      },
    }),
    // Construcción
    prisma.vehicleType.upsert({
      where: { name: 'Excavadora' },
      update: {},
      create: {
        name: 'Excavadora',
        description: 'Maquinaria de construcción',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Grúa' },
      update: {},
      create: {
        name: 'Grúa',
        description: 'Maquinaria para elevación',
      },
    }),
    // Recreativo
    prisma.vehicleType.upsert({
      where: { name: 'Caravana' },
      update: {},
      create: {
        name: 'Caravana',
        description: 'Vehículo recreativo remolcable',
      },
    }),
    prisma.vehicleType.upsert({
      where: { name: 'Motorhome' },
      update: {},
      create: {
        name: 'Motorhome',
        description: 'Vehículo recreativo autopropulsado',
      },
    }),
  ])

  // Create sample seller
  const seller = await prisma.seller.upsert({
    where: { email: 'vendedor@miconcesionaria.com' },
    update: {},
    create: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'vendedor@miconcesionaria.com',
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
      zipCode: '1043',
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
      zipCode: '1425',
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
      zipCode: '1405',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user created:', adminUser.email)
  console.log('🚗 Vehicle types created:', vehicleTypes.length)
  console.log('👨‍💼 Sample seller created:', seller.email)
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