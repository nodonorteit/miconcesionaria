#!/bin/bash

echo "🔧 Corrigiendo logo de empresa en PRODUCCIÓN..."

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.prod.yml"
    echo "   Asegúrate de estar en el directorio del proyecto en producción"
    exit 1
fi

# Crear directorio uploads si no existe
if [ ! -d "./uploads" ]; then
    echo "📁 Creando directorio uploads..."
    mkdir -p ./uploads
fi

# Verificar si el archivo del logo existe
LOGO_FILE="company_logo_1754448284279_parana_automotores.jpeg"
if [ -f "./uploads/$LOGO_FILE" ]; then
    echo "✅ Logo encontrado: $LOGO_FILE"
    ls -la "./uploads/$LOGO_FILE"
else
    echo "❌ Logo no encontrado: $LOGO_FILE"
    echo "🔍 Verificando archivos en uploads..."
    ls -la ./uploads/
    
    # Buscar archivos de logo similares
    echo "🔍 Buscando archivos de logo similares..."
    find ./uploads -name "*company_logo*" -o -name "*logo*" 2>/dev/null || echo "No se encontraron archivos de logo"
    
    echo ""
    echo "📋 Soluciones para PRODUCCIÓN:"
    echo ""
    echo "1. 🎨 Subir nuevo logo desde la aplicación:"
    echo "   - Ve a https://parana.automotores.nodonorte.com/admin/company"
    echo "   - Sube un nuevo logo de la empresa"
    echo ""
    echo "2. 🗄️ Limpiar configuración de la base de datos:"
    echo "   - Ejecuta: docker-compose -f docker-compose.prod.yml exec app npx prisma db execute --stdin < scripts/clean-company-config.sql"
    echo ""
    echo "3. 🔄 Reiniciar aplicación:"
    echo "   - Ejecuta: docker-compose -f docker-compose.prod.yml restart app"
    echo ""
    echo "4. 🔍 Verificar logs:"
    echo "   - Ejecuta: docker-compose -f docker-compose.prod.yml logs -f app"
fi

# Verificar permisos del directorio uploads
echo ""
echo "🔐 Verificando permisos del directorio uploads..."
ls -la ./uploads/

# Verificar si el contenedor puede acceder
echo ""
echo "🐳 Verificando acceso del contenedor..."
if docker-compose -f docker-compose.prod.yml exec -T app test -r /app/uploads 2>/dev/null; then
    echo "✅ Contenedor puede leer uploads"
else
    echo "❌ Contenedor NO puede leer uploads"
    echo ""
    echo "🔧 Corrigiendo permisos..."
    sudo chown -R 1001:1001 ./uploads 2>/dev/null || echo "⚠️ No se pudieron cambiar permisos con sudo"
    sudo chmod -R 755 ./uploads 2>/dev/null || echo "⚠️ No se pudieron cambiar permisos con sudo"
fi

echo ""
echo "🎉 Verificación completada!"
echo ""
echo "📋 Próximos pasos para PRODUCCIÓN:"
echo "1. Si el logo no existe, súbelo desde /admin/company"
echo "2. Si hay problemas de permisos, ejecuta: sudo chown -R 1001:1001 ./uploads"
echo "3. Reinicia la aplicación: docker-compose -f docker-compose.prod.yml restart app"
echo "4. Verifica logs: docker-compose -f docker-compose.prod.yml logs -f app" 