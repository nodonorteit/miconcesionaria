#!/bin/bash
set -e

echo "🔧 Corrigiendo URL del logo de la empresa en el servidor..."

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.yml"
    echo "   Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# Ejecutar la corrección directamente en el contenedor
echo "📊 Ejecutando corrección en el contenedor..."
docker-compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCompanyLogo() {
  try {
    console.log('🔧 Corrigiendo URL del logo de la empresa...');
    
    // Verificar configuración actual
    const currentConfig = await prisma.\$queryRaw\`SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1\`;
    console.log('📊 Configuración actual:', currentConfig[0] || 'No hay configuración');
    
    // Actualizar la URL del logo
    const updateResult = await prisma.\$executeRaw\`UPDATE company_config SET logoUrl = '/uploads/company_logo_1754448284279_parana_automotores.jpeg', updatedAt = NOW() WHERE logoUrl = '/logo.svg' OR logoUrl IS NULL OR logoUrl = ''\`;
    console.log('✅ Registros actualizados:', updateResult);
    
    // Verificar la configuración final
    const finalConfig = await prisma.\$queryRaw\`SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1\`;
    console.log('📊 Configuración final:', finalConfig[0]);
    console.log('🎉 Corrección completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

fixCompanyLogo();
"

echo ""
echo "✅ Corrección completada!"
echo ""
echo "🔄 Reiniciando la aplicación..."
docker-compose restart app

echo ""
echo "📋 Para verificar que funcionó:"
echo "   - Revisa los logs: docker-compose logs app"
echo "   - Verifica que el logo se muestre en la aplicación"
echo "   - Confirma que la URL en la BD sea correcta" 