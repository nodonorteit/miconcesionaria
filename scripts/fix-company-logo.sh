#!/bin/bash

# Script para corregir la configuración del logo de la empresa
# Este script actualiza la URL del logo en la base de datos

set -e

echo "🔧 Corrigiendo configuración del logo de la empresa..."

# Verificar si existe el directorio uploads
if [ ! -d "./uploads" ]; then
    echo "❌ Directorio uploads no encontrado"
    exit 1
fi

# Buscar archivos de logo de empresa
echo "🔍 Buscando archivos de logo..."
LOGO_FILES=$(find ./uploads -name "company_logo_*" -type f | head -5)

if [ -z "$LOGO_FILES" ]; then
    echo "❌ No se encontraron archivos de logo de empresa"
    echo "   Asegúrate de haber subido un logo desde la configuración de empresa"
    exit 1
fi

echo "📁 Archivos de logo encontrados:"
echo "$LOGO_FILES"

# Tomar el archivo más reciente
LATEST_LOGO=$(echo "$LOGO_FILES" | sort | tail -1)
LOGO_FILENAME=$(basename "$LATEST_LOGO")
LOGO_URL="/uploads/$LOGO_FILENAME"

echo "🎯 Logo más reciente: $LOGO_FILENAME"
echo "🔗 URL del logo: $LOGO_URL"

# Crear script temporal de Node.js para actualizar la BD
cat > /tmp/update-logo.js << EOF
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateLogo() {
  try {
    console.log('🔗 Actualizando logo URL en la base de datos...');
    
    const result = await prisma.\$executeRaw\`
      UPDATE company_config 
      SET logoUrl = '${LOGO_URL}', updatedAt = NOW()
      WHERE id = (SELECT id FROM company_config ORDER BY updatedAt DESC LIMIT 1)
    \`;
    
    console.log('✅ Logo URL actualizada exitosamente');
    
    // Verificar la actualización
    const config = await prisma.\$queryRaw\`
      SELECT * FROM company_config ORDER BY updatedAt DESC LIMIT 1
    \`;
    
    console.log('📊 Configuración actualizada:', config[0]);
    
  } catch (error) {
    console.error('❌ Error actualizando logo:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

updateLogo();
EOF

# Ejecutar el script de actualización
echo "💾 Actualizando base de datos..."
node /tmp/update-logo.js

# Limpiar archivo temporal
rm -f /tmp/update-logo.js

echo ""
echo "✅ Configuración del logo corregida!"
echo ""
echo "📋 Resumen:"
echo "   - Archivo: $LOGO_FILENAME"
echo "   - URL: $LOGO_URL"
echo "   - Base de datos: Actualizada"
echo ""
echo "🔄 Reinicia la aplicación para ver los cambios:"
echo "   docker-compose restart app" 