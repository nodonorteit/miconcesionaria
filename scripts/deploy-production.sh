#!/bin/bash

# Script de despliegue para Producción - Mi Concesionaria
# Uso: ./scripts/deploy-production.sh

set -e

echo "🟢 Iniciando despliegue de PRODUCCIÓN..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Archivo docker-compose.prod.yml no encontrado."
    echo "   Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

echo "📦 Actualizando imagen de producción..."
docker-compose -f docker-compose.prod.yml pull

echo "🔄 Deteniendo contenedores de producción existentes..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Iniciando servicios de producción..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Despliegue de PRODUCCIÓN completado!"
echo "🌐 La aplicación debería estar disponible en: https://miconcesionaria.nodonorte.com"
echo "📊 Para ver los logs: docker-compose -f docker-compose.prod.yml logs -f" 