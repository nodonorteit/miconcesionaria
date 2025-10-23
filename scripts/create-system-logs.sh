#!/bin/bash

# Script para crear la tabla system_logs en la base de datos
# Este script debe ejecutarse en el servidor de producción

echo "🔧 Creando tabla system_logs..."

# Verificar que el archivo SQL existe
if [ ! -f "scripts/create-system-logs-table.sql" ]; then
    echo "❌ Error: No se encontró el archivo scripts/create-system-logs-table.sql"
    exit 1
fi

# Ejecutar el script SQL
echo "📝 Ejecutando script SQL..."
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < scripts/create-system-logs-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabla system_logs creada exitosamente"
    echo "🔍 Verificando que la tabla existe..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DESCRIBE system_logs;"
    echo "📊 Mostrando logs de prueba..."
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT * FROM system_logs ORDER BY createdAt DESC LIMIT 3;"
else
    echo "❌ Error al crear la tabla system_logs"
    exit 1
fi

echo "🎉 Migración completada exitosamente"
