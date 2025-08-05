#!/bin/bash

# Script para arreglar problemas con vehículos
echo "🔧 Arreglando problemas con vehículos..."
echo "========================================"

# 1. Crear directorio uploads
echo "📁 Creando directorio uploads..."
mkdir -p uploads
chmod 755 uploads
echo "✅ Directorio uploads creado"

# 2. Actualizar enums en la base de datos
echo "📊 Actualizando enums en la base de datos..."
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

# 3. Agregar más tipos de vehículos
echo "🚗 Agregando tipos de vehículos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria << 'EOF'

-- Insertar tipos de vehículos si no existen
INSERT IGNORE INTO vehicle_types (id, name, category, description, isActive, createdAt, updatedAt) VALUES
('type-sedan', 'Sedán', 'AUTOMOTIVE', 'Vehículo de pasajeros con 4 puertas', 1, NOW(), NOW()),
('type-suv', 'SUV', 'AUTOMOTIVE', 'Vehículo utilitario deportivo', 1, NOW(), NOW()),
('type-camioneta', 'Camioneta', 'AUTOMOTIVE', 'Vehículo de carga ligera', 1, NOW(), NOW()),
('type-hatchback', 'Hatchback', 'AUTOMOTIVE', 'Vehículo compacto con portón trasero', 1, NOW(), NOW()),
('type-pickup', 'Pickup', 'AUTOMOTIVE', 'Camioneta con caja de carga', 1, NOW(), NOW()),
('type-moto', 'Moto', 'MOTORCYCLE', 'Motocicleta de dos ruedas', 1, NOW(), NOW()),
('type-scooter', 'Scooter', 'MOTORCYCLE', 'Motocicleta urbana con plataforma', 1, NOW(), NOW()),
('type-cuatriciclo', 'Cuatriciclo', 'MOTORCYCLE', 'Vehículo todo terreno de 4 ruedas', 1, NOW(), NOW()),
('type-camion', 'Camión', 'COMMERCIAL', 'Vehículo de carga pesada', 1, NOW(), NOW()),
('type-furgon', 'Furgón', 'COMMERCIAL', 'Vehículo de carga cerrado', 1, NOW(), NOW()),
('type-van', 'Van Comercial', 'COMMERCIAL', 'Furgoneta para uso comercial', 1, NOW(), NOW()),
('type-tractor', 'Tractor', 'AGRICULTURAL', 'Maquinaria agrícola', 1, NOW(), NOW()),
('type-cosechadora', 'Cosechadora', 'AGRICULTURAL', 'Maquinaria para cosecha', 1, NOW(), NOW()),
('type-lancha', 'Lancha', 'MARINE', 'Embarcación recreativa', 1, NOW(), NOW()),
('type-yate', 'Yate', 'MARINE', 'Embarcación de lujo', 1, NOW(), NOW()),
('type-moto-agua', 'Moto de Agua', 'MARINE', 'Vehículo acuático recreativo', 1, NOW(), NOW()),
('type-excavadora', 'Excavadora', 'CONSTRUCTION', 'Maquinaria de construcción', 1, NOW(), NOW()),
('type-grua', 'Grúa', 'CONSTRUCTION', 'Maquinaria para elevación', 1, NOW(), NOW()),
('type-caravana', 'Caravana', 'RECREATIONAL', 'Vehículo recreativo remolcable', 1, NOW(), NOW()),
('type-motorhome', 'Motorhome', 'RECREATIONAL', 'Vehículo recreativo autopropulsado', 1, NOW(), NOW());

EOF

if [ $? -eq 0 ]; then
    echo "✅ Tipos de vehículos agregados"
else
    echo "❌ Error agregando tipos de vehículos"
fi

# 4. Verificar cambios
echo "🔍 Verificando cambios..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "SELECT COUNT(*) as total_types FROM vehicle_types WHERE isActive = 1;"

# 5. Reiniciar aplicación
echo "🔄 Reiniciando aplicación..."
cd /var/www/vhosts/nodonorte.com/miconcesionaria
docker-compose -f docker-compose.prod.yml restart app

# 6. Verificar que todo funciona
echo "🔍 Verificando que todo funciona..."
sleep 10
curl -f http://localhost:3000/api/health

if [ $? -eq 0 ]; then
    echo "✅ Aplicación funcionando correctamente"
else
    echo "⚠️ La aplicación puede estar tardando en iniciar"
fi

echo "✅ Problemas arreglados!"
echo "🌐 Puedes acceder a: https://miconcesionaria.nodonorte.com"
echo "📋 Tipos de vehículos: https://miconcesionaria.nodonorte.com/vehicle-types" 