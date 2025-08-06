#!/bin/bash

# Script para configurar el directorio uploads externo al contenedor
# Este script debe ejecutarse en el servidor antes de iniciar los contenedores

set -e

echo "🔧 Configurando directorio uploads externo..."

# Crear directorio uploads si no existe
if [ ! -d "./uploads" ]; then
    echo "📁 Creando directorio uploads..."
    mkdir -p ./uploads
fi

# Crear archivo .gitkeep si no existe
if [ ! -f "./uploads/.gitkeep" ]; then
    echo "📄 Creando archivo .gitkeep..."
    touch ./uploads/.gitkeep
fi

# Detectar el usuario del servidor web
WEB_USER=""
if command -v nginx &> /dev/null; then
    WEB_USER="nginx"
elif command -v apache2 &> /dev/null; then
    WEB_USER="www-data"
else
    # Intentar detectar automáticamente
    if id "nginx" &>/dev/null; then
        WEB_USER="nginx"
    elif id "www-data" &>/dev/null; then
        WEB_USER="www-data"
    else
        echo "⚠️  No se pudo detectar el usuario del servidor web"
        echo "   Configurando permisos para el usuario actual..."
        WEB_USER=$(whoami)
    fi
fi

echo "👤 Usuario del servidor web detectado: $WEB_USER"

# Configurar permisos
echo "🔐 Configurando permisos..."
chmod 755 ./uploads
chmod 644 ./uploads/.gitkeep

# Cambiar propietario si es necesario
if [ "$WEB_USER" != "$(whoami)" ]; then
    echo "👥 Cambiando propietario a $WEB_USER..."
    sudo chown -R $WEB_USER:$WEB_USER ./uploads
else
    echo "👤 Manteniendo propietario actual..."
fi

# Verificar configuración
echo "✅ Verificando configuración..."
ls -la ./uploads/

echo ""
echo "🎉 Directorio uploads configurado correctamente!"
echo ""
echo "📋 Resumen de la configuración:"
echo "   - Directorio: $(pwd)/uploads"
echo "   - Permisos: 755"
echo "   - Propietario: $WEB_USER"
echo "   - Archivo .gitkeep: presente"
echo ""
echo "💡 Ahora puedes iniciar los contenedores con:"
echo "   docker-compose up -d"
echo ""
echo "📁 Los archivos subidos se guardarán en: $(pwd)/uploads" 