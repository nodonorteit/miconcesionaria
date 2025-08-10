#!/bin/bash

# Script para sincronizar uploads entre entornos staging y producción
# Copia imágenes del volumen de producción al de staging

echo "🔄 Sincronizando uploads entre entornos..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

# Crear contenedor temporal para acceder a los volúmenes
echo "📦 Creando contenedor temporal para sincronización..."

# Crear contenedor temporal con acceso a ambos volúmenes
docker run --rm -v uploads_data:/source -v uploads_data_staging:/dest -v $(pwd):/backup alpine sh -c "
    echo '📁 Listando archivos en producción...'
    ls -la /source/
    
    echo '📋 Copiando archivos de producción a staging...'
    cp -r /source/* /dest/ 2>/dev/null || echo '⚠️  Algunos archivos no se pudieron copiar'
    
    echo '📁 Verificando archivos en staging...'
    ls -la /dest/
    
    echo '✅ Sincronización completada'
"

echo "🎯 Volúmenes sincronizados:"
echo "   - Producción: uploads_data"
echo "   - Staging: uploads_data_staging"

# Verificar estado de los contenedores
echo ""
echo "🐳 Estado de los contenedores:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 