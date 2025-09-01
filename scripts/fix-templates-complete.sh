#!/bin/bash

# Script completo para arreglar templates de documentos
# Ejecutar en el servidor de producción

echo "🔧 Iniciando fix completo de templates de documentos..."

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.prod.yml"
    echo "   Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# 2. Descargar últimos cambios
echo "📥 Descargando últimos cambios de GitHub..."
git pull origin master

# 3. Verificar que los scripts existen
if [ ! -f "scripts/fix-document-templates-dates.sql" ]; then
    echo "❌ Error: No se encontró scripts/fix-document-templates-dates.sql"
    exit 1
fi

# 4. Ejecutar fix de fechas inválidas
echo "🔧 Arreglando fechas inválidas en document_templates..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/fix-document-templates-dates.sql

# 5. Verificar que se arregló
echo "✅ Verificando que se arreglaron las fechas..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "
SELECT 
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length,
    createdAt,
    updatedAt
FROM document_templates
ORDER BY createdAt DESC;
"

# 6. Reiniciar la aplicación
echo "🔄 Reiniciando la aplicación..."
docker-compose -f docker-compose.prod.yml restart app

# 7. Esperar que se inicie
echo "⏳ Esperando que la aplicación se inicie..."
sleep 10

# 8. Verificar logs
echo "📊 Verificando logs de la aplicación..."
docker-compose -f docker-compose.prod.yml logs --tail=20 app

echo "✅ Fix completado!"
echo "🌐 La aplicación debería estar funcionando en: https://miconcesionaria.nodonorte.com"
echo "📝 Para verificar templates: /admin/settings/document-templates"
