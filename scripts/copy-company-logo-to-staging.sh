#!/bin/bash

# Script para copiar el logo de la empresa del entorno de producción al de staging

echo "🔄 Copiando logo de empresa a staging..."

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

# Nombre del archivo del logo
LOGO_FILE="company_logo_1754448284279_parana_automotores.jpeg"

echo "📁 Buscando archivo: $LOGO_FILE"

# Crear contenedor temporal para copiar el archivo
docker run --rm -v uploads_data:/source -v uploads_data_staging:/dest alpine sh -c "
    if [ -f /source/$LOGO_FILE ]; then
        echo '✅ Archivo encontrado en producción'
        cp /source/$LOGO_FILE /dest/
        echo '📋 Archivo copiado a staging'
        ls -la /dest/$LOGO_FILE
    else
        echo '❌ Archivo no encontrado en producción'
        echo '📁 Contenido del directorio de producción:'
        ls -la /source/
    fi
"

echo "🎯 Verificación final:"
docker run --rm -v uploads_data_staging:/uploads alpine ls -la /uploads/ 