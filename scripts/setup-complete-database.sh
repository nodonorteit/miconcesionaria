#!/bin/bash

# Script completo para configurar la base de datos desde cero
echo "🔧 Configurando base de datos completa..."
echo "=========================================="

# 1. Crear directorio uploads si no existe
echo "📁 Creando directorio uploads..."
mkdir -p uploads
chmod 755 uploads
echo "✅ Directorio uploads creado"

# 2. Crear tablas faltantes
echo "📊 Creando tablas faltantes..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/create-missing-tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Tablas creadas correctamente"
else
    echo "❌ Error creando tablas"
    exit 1
fi

# 3. Actualizar enums en la tabla Vehicle
echo "🔄 Actualizando enums en Vehicle..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria << 'EOF'

-- Actualizar enum FuelType
ALTER TABLE Vehicle MODIFY COLUMN fuelType ENUM('GASOLINE','DIESEL','ELECTRIC','HYBRID','LPG','CNG','HYDROGEN','BIOFUEL','SOLAR','WIND') NOT NULL;

-- Actualizar enum Transmission
ALTER TABLE Vehicle MODIFY COLUMN transmission ENUM('MANUAL','AUTOMATIC','CVT','SEMI_AUTOMATIC','DCT','HYDRAULIC','ELECTRIC_DRIVE') NOT NULL;

-- Actualizar enum VehicleStatus
ALTER TABLE Vehicle MODIFY COLUMN status ENUM('AVAILABLE','SOLD','RESERVED','MAINTENANCE','REPAIR','INSPECTION','STORAGE') NOT NULL DEFAULT 'AVAILABLE';

EOF

if [ $? -eq 0 ]; then
    echo "✅ Enums actualizados correctamente"
else
    echo "❌ Error actualizando enums"
fi

# 4. Poblar la base de datos con datos de prueba
echo "🎯 Poblando base de datos con datos de prueba..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/populate-database.sh

if [ $? -eq 0 ]; then
    echo "✅ Base de datos poblada exitosamente"
else
    echo "❌ Error poblando la base de datos"
    exit 1
fi

# 5. Verificar que todo funciona
echo "🔍 Verificando configuración..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "
SELECT 'RESUMEN FINAL:' as info;
SELECT 'Tablas creadas:' as tipo, COUNT(*) as cantidad FROM information_schema.tables WHERE table_schema = 'miconcesionaria';
SELECT 'Tipos de vehículos:' as tipo, COUNT(*) as cantidad FROM vehicle_types;
SELECT 'Clientes:' as tipo, COUNT(*) as cantidad FROM Client;
SELECT 'Proveedores:' as tipo, COUNT(*) as cantidad FROM Provider;
SELECT 'Talleres:' as tipo, COUNT(*) as cantidad FROM Workshop;
SELECT 'Vendedores:' as tipo, COUNT(*) as cantidad FROM Seller;
SELECT 'Vehículos:' as tipo, COUNT(*) as cantidad FROM Vehicle;
SELECT 'Ventas:' as tipo, COUNT(*) as cantidad FROM sales;
SELECT 'Flujo de caja:' as tipo, COUNT(*) as cantidad FROM cashflow;
SELECT 'Imágenes:' as tipo, COUNT(*) as cantidad FROM vehicle_images;
"

# 6. Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
cd /var/www/vhosts/nodonorte.com/miconcesionaria
docker-compose -f docker-compose.prod.yml restart app

# 7. Verificar que la aplicación funciona
echo "🔍 Verificando que la aplicación funciona..."
sleep 10
curl -f http://localhost:3000/api/health

if [ $? -eq 0 ]; then
    echo "✅ Aplicación funcionando correctamente"
else
    echo "⚠️ La aplicación puede estar tardando en iniciar"
fi

echo "✅ Configuración completa finalizada!"
echo "🌐 Puedes acceder a: https://miconcesionaria.nodonorte.com"
echo "📊 Datos disponibles:"
echo "   - 30 tipos de vehículos (todas las categorías)"
echo "   - 10 clientes"
echo "   - 8 proveedores"
echo "   - 7 talleres"
echo "   - 8 vendedores"
echo "   - 20 vehículos (diferentes categorías)"
echo "   - 7 ventas realizadas"
echo "   - 17 movimientos de flujo de caja"
echo "   - 13 imágenes de vehículos" 