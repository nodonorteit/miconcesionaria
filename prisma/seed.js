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

  // Create document templates
  const documentTemplates = await Promise.all([
    prisma.documentTemplate.upsert({
      where: { name: 'Boleto Estándar' },
      update: {},
      create: {
        name: 'Boleto Estándar',
        type: 'BOLETO_COMPRA_VENTA',
        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Boleto de Compra-Venta</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-logo { max-width: 200px; height: auto; }
        .company-name { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .document-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field { margin: 10px 0; }
        .field-label { font-weight: bold; color: #666; }
        .field-value { margin-top: 5px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .signature-box { text-align: center; border-top: 2px solid #000; padding-top: 10px; }
        .signature-line { height: 60px; border-bottom: 1px solid #000; margin: 20px 0; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        {{#if company.logoUrl}}
        <img src="{{company.logoUrl}}" alt="Logo" class="company-logo">
        {{/if}}
        <div class="company-name">{{company.name}}</div>
        <div>{{company.address}}</div>
        <div>{{company.city}} - {{company.state}}</div>
        <div>CUIT: {{company.cuit}}</div>
    </div>

    <div class="document-title">BOLETO DE COMPRA-VENTA N° {{document.number}}</div>
    <div style="text-align: right; margin-bottom: 20px;">Fecha: {{formatDate sale.date}}</div>

    <div class="section">
        <div class="section-title">INFORMACIÓN DE LAS PARTES</div>
        <div class="grid">
            <div>
                <div class="field">
                    <div class="field-label">COMPRADOR:</div>
                    <div class="field-value">{{company.name}}</div>
                    <div class="field-value">{{company.address}}</div>
                    <div class="field-value">{{company.city}} - {{company.state}}</div>
                    <div class="field-value">CUIT: {{company.cuit}}</div>
                </div>
            </div>
            <div>
                <div class="field">
                    <div class="field-label">VENDEDOR:</div>
                    <div class="field-value">{{customer.firstName}} {{customer.lastName}}</div>
                    <div class="field-value">{{customer.address}}</div>
                    <div class="field-value">{{customer.city}} {{customer.state}}</div>
                    <div class="field-value">Doc: {{customer.documentNumber}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">INFORMACIÓN DEL VEHÍCULO</div>
        <div class="grid">
            <div class="field">
                <div class="field-label">Marca:</div>
                <div class="field-value">{{vehicle.brand}}</div>
            </div>
            <div class="field">
                <div class="field-label">Modelo:</div>
                <div class="field-value">{{vehicle.model}}</div>
            </div>
            <div class="field">
                <div class="field-label">Año:</div>
                <div class="field-value">{{vehicle.year}}</div>
            </div>
            <div class="field">
                <div class="field-label">Color:</div>
                <div class="field-value">{{vehicle.color}}</div>
            </div>
            <div class="field">
                <div class="field-label">VIN:</div>
                <div class="field-value">{{vehicle.vin}}</div>
            </div>
            <div class="field">
                <div class="field-label">Patente:</div>
                <div class="field-value">{{vehicle.licensePlate}}</div>
            </div>
            <div class="field">
                <div class="field-label">Tipo:</div>
                <div class="field-value">{{vehicle.type}}</div>
            </div>
            <div class="field">
                <div class="field-label">Kilometraje:</div>
                <div class="field-value">{{vehicle.mileage}} km</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CONDICIONES DE LA VENTA</div>
        <div class="grid">
            <div>
                <div class="field">
                    <div class="field-label">Precio Total:</div>
                    <div class="field-value" style="font-size: 24px; font-weight: bold; color: #059669;">
                        {{formatCurrency sale.totalAmount}}
                    </div>
                </div>
            </div>
            <div>
                <div class="field">
                    <div class="field-label">Forma de Pago:</div>
                    <div class="field-value">{{sale.paymentMethod}}</div>
                </div>
                <div class="field">
                    <div class="field-label">Fecha de Entrega:</div>
                    <div class="field-value">{{formatDate sale.deliveryDate}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CONDICIONES Y RESPONSABILIDADES</div>
        <div style="font-size: 14px; line-height: 1.5;">
            <p><strong>Responsabilidades del Vendedor:</strong> El vendedor se responsabiliza por lo vendido, declarando que no tiene embargos, prendas agrarias (Ley 12.962), ni impedimentos para la venta.</p>
            <p><strong>Condiciones de Entrega:</strong> La unidad se entrega en el estado en que se encuentra, y el comprador declara conocer sus características.</p>
            <p><strong>Transferencia:</strong> El comprador se compromete a realizar la transferencia de dominio del vehículo dentro de los diez días de la fecha, según la Ley 22.977.</p>
            <p><strong>Gastos:</strong> Todos los gastos de transferencia, trámites y gestiones son a cargo exclusivo del comprador.</p>
        </div>
    </div>

    <div class="signatures">
        <div class="signature-box">
            <div style="font-weight: bold;">COMPRADOR</div>
            <div>{{company.name}}</div>
            <div class="signature-line"></div>
            <div style="font-size: 12px; color: #666;">Firma</div>
        </div>
        <div class="signature-box">
            <div style="font-weight: bold;">VENDEDOR</div>
            <div>{{customer.firstName}} {{customer.lastName}}</div>
            <div class="signature-line"></div>
            <div style="font-size: 12px; color: #666;">Firma</div>
        </div>
    </div>

    <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; font-size: 14px;">
        <p><strong>Observaciones:</strong> {{sale.notes}}</p>
        <p>Documento generado el {{formatDate document.generatedAt}}</p>
    </div>
</body>
</html>`,
        variables: {
          company: ["name", "logoUrl", "address", "city", "state", "cuit"],
          customer: ["firstName", "lastName", "address", "city", "state", "documentNumber"],
          vehicle: ["brand", "model", "year", "color", "vin", "licensePlate", "type", "mileage"],
          sale: ["totalAmount", "paymentMethod", "deliveryDate", "notes"],
          document: ["number", "generatedAt"]
        },
        isActive: true,
        isDefault: true
      },
    }),
    prisma.documentTemplate.upsert({
      where: { name: 'Recibo de Venta' },
      update: {},
      create: {
        name: 'Recibo de Venta',
        type: 'RECIBO_VENTA',
        content: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Recibo de Venta</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .document-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
        .section { margin: 20px 0; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field { margin: 10px 0; }
        .field-label { font-weight: bold; color: #666; }
        .field-value { margin-top: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{company.name}}</div>
        <div>RECIBO DE VENTA</div>
    </div>

    <div class="section">
        <div class="grid">
            <div>
                <div class="field">
                    <div class="field-label">Cliente:</div>
                    <div class="field-value">{{customer.firstName}} {{customer.lastName}}</div>
                </div>
                <div class="field">
                    <div class="field-label">Vehículo:</div>
                    <div class="field-value">{{vehicle.brand}} {{vehicle.model}} {{vehicle.year}}</div>
                </div>
            </div>
            <div>
                <div class="field">
                    <div class="field-label">Fecha:</div>
                    <div class="field-value">{{formatDate sale.date}}</div>
                </div>
                <div class="field">
                    <div class="field-label">Monto:</div>
                    <div class="field-value" style="font-size: 20px; font-weight: bold; color: #059669;">
                        {{formatCurrency sale.totalAmount}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
        variables: {
          company: ["name"],
          customer: ["firstName", "lastName"],
          vehicle: ["brand", "model", "year"],
          sale: ["date", "totalAmount"]
        },
        isActive: true,
        isDefault: false
      },
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin user created:', adminUser.email)
  console.log('🚗 Vehicle types created:', vehicleTypes.length)
  console.log('👨‍💼 Sample seller created:', seller.email)
  console.log('👥 Sample customer created:', customer.email)
  console.log('🏢 Sample provider created:', provider.name)
  console.log('🔧 Sample workshop created:', workshop.name)
  console.log('📄 Document templates created:', documentTemplates.length)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 