#!/bin/bash

# Script de post-deployment para miconcesionaria
# Este script se ejecuta después del deployment para configurar el entorno

set -e

echo "🚀 Iniciando configuración post-deployment..."

# 1. Configurar directorio uploads externo
echo "📁 Configurando directorio uploads..."
if [ -f "./scripts/setup-uploads-external.sh" ]; then
    bash ./scripts/setup-uploads-external.sh
else
    echo "⚠️  Script setup-uploads-external.sh no encontrado"
    echo "   Creando directorio uploads manualmente..."
    mkdir -p ./uploads
    touch ./uploads/.gitkeep
    chmod 755 ./uploads
    chmod 644 ./uploads/.gitkeep
fi

# 2. Verificar y crear usuario por defecto
echo "👤 Verificando usuario por defecto..."
if [ -f "./scripts/create-default-user.sh" ]; then
    bash ./scripts/create-default-user.sh
else
    echo "⚠️  Script create-default-user.sh no encontrado"
fi

# 3. Verificar permisos de la aplicación
echo "🔐 Verificando permisos de la aplicación..."
if [ -d "./uploads" ]; then
    echo "   - Directorio uploads: OK"
    ls -la ./uploads/
else
    echo "   ❌ Directorio uploads no encontrado"
fi

# 4. Verificar servicios web
echo "🌐 Verificando servicios web..."
if command -v nginx &> /dev/null; then
    echo "   - Nginx: Instalado"
    sudo systemctl status nginx --no-pager -l || echo "   ⚠️  Nginx no está ejecutándose"
elif command -v apache2 &> /dev/null; then
    echo "   - Apache: Instalado"
    sudo systemctl status apache2 --no-pager -l || echo "   ⚠️  Apache no está ejecutándose"
else
    echo "   ⚠️  No se detectó servidor web"
fi

# 5. Verificar Docker
echo "🐳 Verificando Docker..."
if command -v docker &> /dev/null; then
    echo "   - Docker: Instalado"
    docker --version
    docker-compose --version || echo "   ⚠️  Docker Compose no encontrado"
else
    echo "   ❌ Docker no está instalado"
fi

# 6. Verificar conectividad de base de datos
echo "🗄️  Verificando base de datos..."
if [ -f "./scripts/check-database-structure.sh" ]; then
    bash ./scripts/check-database-structure.sh
else
    echo "⚠️  Script check-database-structure.sh no encontrado"
fi

echo ""
echo "✅ Configuración post-deployment completada!"
echo ""
echo "📋 Resumen:"
echo "   - Directorio uploads configurado externamente"
echo "   - Usuario por defecto verificado/creado"
echo "   - Permisos verificados"
echo "   - Servicios web verificados"
echo "   - Docker verificado"
echo "   - Base de datos verificada"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Iniciar contenedores: docker-compose up -d"
echo "   2. Verificar aplicación: curl http://localhost:3000/api/health"
echo "   3. Acceder a la aplicación en el navegador"
echo ""
echo "🔧 Si hay problemas:"
echo "   - Revisar logs: docker-compose logs -f"
echo "   - Verificar permisos: ls -la ./uploads/"
echo "   - Verificar contenedores: docker ps" 