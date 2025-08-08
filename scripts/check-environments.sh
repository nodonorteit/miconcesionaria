#!/bin/bash

# Script para verificar el estado de los entornos - Mi Concesionaria
# Uso: ./scripts/check-environments.sh

echo "🔍 Verificando estado de los entornos..."

# Verificar staging
echo ""
echo "🟡 === STAGING ==="
if [ -f "docker-compose.staging.yml" ]; then
    echo "📁 Archivo docker-compose.staging.yml encontrado"
    
    # Verificar si los contenedores están corriendo
    if docker-compose -f docker-compose.staging.yml ps | grep -q "Up"; then
        echo "✅ Contenedores de staging están corriendo"
        echo "🌐 URL: https://miconcesionaria.staging.nodonorte.com"
    else
        echo "❌ Contenedores de staging NO están corriendo"
    fi
    
    # Mostrar logs recientes
    echo "📊 Últimos logs de staging:"
    docker-compose -f docker-compose.staging.yml logs --tail=5
else
    echo "❌ Archivo docker-compose.staging.yml no encontrado"
fi

# Verificar producción
echo ""
echo "🟢 === PRODUCCIÓN ==="
if [ -f "docker-compose.prod.yml" ]; then
    echo "📁 Archivo docker-compose.prod.yml encontrado"
    
    # Verificar si los contenedores están corriendo
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo "✅ Contenedores de producción están corriendo"
        echo "🌐 URL: https://miconcesionaria.nodonorte.com"
    else
        echo "❌ Contenedores de producción NO están corriendo"
    fi
    
    # Mostrar logs recientes
    echo "📊 Últimos logs de producción:"
    docker-compose -f docker-compose.prod.yml logs --tail=5
else
    echo "❌ Archivo docker-compose.prod.yml no encontrado"
fi

echo ""
echo "🎯 Comandos útiles:"
echo "  🟡 Staging:   ./scripts/deploy-staging.sh"
echo "  🟢 Producción: ./scripts/deploy-production.sh"
echo "  📊 Logs staging: docker-compose -f docker-compose.staging.yml logs -f"
echo "  📊 Logs producción: docker-compose -f docker-compose.prod.yml logs -f" 