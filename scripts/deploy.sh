#!/bin/bash

# Script de despliegue para Mi Concesionaria en Plesk
# Uso: ./scripts/deploy.sh

set -e

echo "🚀 Iniciando despliegue de Mi Concesionaria..."

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

# Verificar que el archivo .env.production exista
if [ ! -f .env.production ]; then
    echo "❌ Archivo .env.production no encontrado."
    echo "📝 Copia env.production.example a .env.production y configura las variables."
    exit 1
fi

echo "📦 Construyendo la aplicación..."
docker-compose -f docker-compose.prod.yml build

echo "🔄 Deteniendo contenedores existentes..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 30

echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Despliegue completado!"
echo "🌐 La aplicación debería estar disponible en: http://localhost:3000"
echo "📊 Para ver los logs: docker-compose -f docker-compose.prod.yml logs -f" 