#!/bin/bash

# Script manual para configurar el servidor paso a paso
# Ejecutar en el servidor para diagnosticar y resolver problemas

echo "🔧 Script manual de configuración del servidor"
echo "=============================================="

# Verificar directorio actual
echo "📁 Directorio actual: $(pwd)"
echo "📋 Archivos disponibles:"
ls -la

# Verificar si existe el directorio scripts
if [ -d "scripts" ]; then
    echo "✅ Directorio scripts encontrado"
    echo "📋 Archivos en scripts/:"
    ls -la scripts/
else
    echo "❌ Directorio scripts no encontrado"
    exit 1
fi

# Verificar si existe el archivo SQL
if [ -f "scripts/update-database.sql" ]; then
    echo "✅ Archivo update-database.sql encontrado"
else
    echo "❌ Archivo update-database.sql no encontrado"
    exit 1
fi

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "SELECT 'Conexión exitosa' as status;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Conexión a la base de datos exitosa"
else
    echo "❌ Error de conexión a la base de datos"
    exit 1
fi

# Verificar estructura actual de la tabla
echo "🔍 Verificando estructura de la tabla vehicle_types..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE vehicle_types;"

# Verificar si la columna category ya existe
echo "🔍 Verificando si la columna category existe..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "
SELECT COUNT(*) as column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'miconcesionaria' 
AND TABLE_NAME = 'vehicle_types' 
AND COLUMN_NAME = 'category';"

# Ejecutar el script SQL
echo "📊 Ejecutando script de actualización de la base de datos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < scripts/update-database.sql

if [ $? -eq 0 ]; then
    echo "✅ Script SQL ejecutado correctamente"
else
    echo "❌ Error al ejecutar el script SQL"
    exit 1
fi

# Verificar que los cambios se aplicaron
echo "✅ Verificando cambios en la base de datos..."
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "SELECT name, category FROM vehicle_types ORDER BY category, name;"

# Reiniciar la aplicación
echo "🔄 Reiniciando aplicación..."
docker-compose -f docker-compose.prod.yml restart app

# Verificar estado de la aplicación
echo "🔍 Verificando estado de la aplicación..."
sleep 10
curl -f http://localhost:3000/api/health

if [ $? -eq 0 ]; then
    echo "✅ Aplicación funcionando correctamente"
else
    echo "⚠️  La aplicación puede estar tardando en iniciar"
fi

echo "✅ Configuración manual completada!"
echo "🌐 Puedes acceder a: https://miconcesionaria.nodonorte.com"
echo "📋 Tipos de vehículos: https://miconcesionaria.nodonorte.com/vehicle-types" 