const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCompanyConfig() {
  try {
    console.log('🔧 Actualizando configuración de empresa...');
    
    // Verificar configuración actual
    const currentConfig = await prisma.$queryRaw`
      SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
    `;
    
    console.log('📊 Configuración actual:', currentConfig[0]);
    
    // Actualizar con valores correctos
    const result = await prisma.$executeRaw`
      UPDATE company_config 
      SET 
        name = 'Parana Automotores',
        logoUrl = '/uploads/company_logo_1754448284279_parana_automotores.jpeg',
        description = 'Sistema de Gestión',
        updatedAt = NOW()
      WHERE id = (SELECT id FROM company_config ORDER BY updatedAt DESC LIMIT 1)
    `;
    
    console.log('✅ Configuración actualizada exitosamente');
    
    // Verificar la actualización
    const updatedConfig = await prisma.$queryRaw`
      SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
    `;
    
    console.log('📊 Configuración actualizada:', updatedConfig[0]);
    
  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompanyConfig(); 