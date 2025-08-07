const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixCompanyLogo() {
  try {
    console.log('🔧 Corrigiendo URL del logo de la empresa en la base de datos...')
    
    // Verificar configuración actual
    const currentConfig = await prisma.$queryRaw`
      SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
    `
    
    console.log('📊 Configuración actual:', currentConfig[0] || 'No hay configuración')
    
    // Actualizar la URL del logo si es '/logo.svg' o está vacía
    const updateResult = await prisma.$executeRaw`
      UPDATE company_config 
      SET logoUrl = '/uploads/company_logo_1754448284279_parana_automotores.jpeg',
          updatedAt = NOW()
      WHERE logoUrl = '/logo.svg' 
         OR logoUrl IS NULL 
         OR logoUrl = ''
    `
    
    console.log('✅ Registros actualizados:', updateResult)
    
    // Si no hay registros, crear uno nuevo
    const insertResult = await prisma.$executeRaw`
      INSERT INTO company_config (name, logoUrl, description, createdAt, updatedAt)
      SELECT 'Parana Automotores', '/uploads/company_logo_1754448284279_parana_automotores.jpeg', 'Sistema de Gestión', NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM company_config)
    `
    
    console.log('✅ Registros insertados:', insertResult)
    
    // Verificar la configuración final
    const finalConfig = await prisma.$queryRaw`
      SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
    `
    
    console.log('📊 Configuración final:', finalConfig[0])
    console.log('🎉 Corrección completada exitosamente!')
    
  } catch (error) {
    console.error('❌ Error corrigiendo configuración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixCompanyLogo() 