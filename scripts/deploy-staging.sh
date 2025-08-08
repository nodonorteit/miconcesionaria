#!/bin/bash

# Script de despliegue para Staging - Mi Concesionaria
# Uso: ./scripts/deploy-staging.sh

set -e

echo "🟡 Iniciando despliegue de STAGING..."

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
if [ ! -f "docker-compose.staging.yml" ]; then
    echo "❌ Archivo docker-compose.staging.yml no encontrado."
    echo "   Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

echo "📦 Actualizando imagen de staging..."
docker-compose -f docker-compose.staging.yml pull

echo "🔄 Deteniendo contenedores de staging existentes..."
docker-compose -f docker-compose.staging.yml down

echo "🚀 Iniciando servicios de staging..."
docker-compose -f docker-compose.staging.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.staging.yml ps

echo "✅ Despliegue de STAGING completado!"
echo "🌐 La aplicación debería estar disponible en: https://miconcesionaria.staging.nodonorte.com"
echo "📊 Para ver los logs: docker-compose -f docker-compose.staging.yml logs -f" 