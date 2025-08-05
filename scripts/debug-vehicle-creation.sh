#!/bin/bash

# Script para diagnosticar problemas con la creación de vehículos
echo "🔍 Diagnóstico de problemas con creación de vehículos"
echo "=================================================="

# 1. Verificar que la aplicación está corriendo
echo "📊 Verificando estado de la aplicación..."
curl -f http://localhost:3000/api/health
if [ $? -eq 0 ]; then
    echo "✅ Aplicación funcionando"
else
    echo "❌ Aplicación no responde"
    exit 1
fi

# 2. Verificar tipos de vehículos disponibles
echo "🚗 Verificando tipos de vehículos disponibles..."
curl -s http://localhost:3000/api/vehicle-types | jq '.' 2>/dev/null || echo "No hay tipos de vehículos o error en la API"

# 3. Verificar estructura de la tabla vehicle_types
echo "📋 Verificando estructura de vehicle_types..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE vehicle_types;"

# 4. Verificar si hay tipos de vehículos
echo "📊 Verificando tipos de vehículos en la base de datos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "SELECT id, name FROM vehicle_types WHERE isActive = 1 LIMIT 5;"

# 5. Verificar estructura de la tabla Vehicle
echo "📋 Verificando estructura de Vehicle..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE Vehicle;"

# 6. Verificar estructura de la tabla vehicle_images
echo "📋 Verificando estructura de vehicle_images..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE vehicle_images;"

# 7. Verificar directorio de uploads
echo "📁 Verificando directorio de uploads..."
if [ -d "uploads" ]; then
    echo "✅ Directorio uploads existe"
    ls -la uploads/ | head -5
else
    echo "❌ Directorio uploads no existe"
fi

# 8. Verificar permisos del directorio uploads
echo "🔐 Verificando permisos..."
if [ -d "uploads" ]; then
    ls -ld uploads/
fi

# 9. Verificar logs del contenedor
echo "📝 Últimos logs del contenedor..."
docker-compose -f docker-compose.prod.yml logs --tail=20 app

echo "🔍 Diagnóstico completado" 