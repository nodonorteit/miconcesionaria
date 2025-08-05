#!/bin/bash

# Script para configurar el servidor con las nuevas funcionalidades
# Ejecutar en el servidor después del deploy

echo "🚀 Configurando servidor con nuevas funcionalidades..."

# 1. Actualizar la base de datos
echo "📊 Actualizando base de datos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/update-database.sql

# 2. Verificar que los cambios se aplicaron
echo "✅ Verificando cambios en la base de datos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "SELECT name, category FROM vehicle_types ORDER BY category, name;"

# 3. Reiniciar el contenedor de la aplicación
echo "🔄 Reiniciando aplicación..."
cd /var/www/vhosts/nodonorte.com/miconcesionaria
docker-compose -f docker-compose.prod.yml restart app

# 4. Verificar que la aplicación está funcionando
echo "🔍 Verificando estado de la aplicación..."
sleep 10
curl -f http://localhost:3000/api/health || echo "⚠️  La aplicación puede estar tardando en iniciar"

echo "✅ Configuración completada!"
echo "🌐 Puedes acceder a: https://miconcesionaria.nodonorte.com"
echo "📋 Tipos de vehículos: https://miconcesionaria.nodonorte.com/vehicle-types" 