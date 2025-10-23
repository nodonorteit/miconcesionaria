#!/bin/bash

# Script para crear la tabla system_logs desde dentro del contenedor Docker
# Este script usa las variables de entorno del contenedor

echo "🔧 Creando tabla system_logs desde contenedor..."

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL no está definida"
    exit 1
fi

# Extraer componentes de la URL de la base de datos
# Formato: mysql://user:password@host:port/database
DB_URL=$DATABASE_URL
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📊 Configuración de base de datos:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Crear la tabla usando el script SQL
echo "📝 Ejecutando script SQL..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < scripts/create-system-logs-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabla system_logs creada exitosamente"
    echo "🔍 Verificando que la tabla existe..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DESCRIBE system_logs;"
    echo "📊 Mostrando logs de prueba..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT COUNT(*) as total_logs FROM system_logs;"
else
    echo "❌ Error al crear la tabla system_logs"
    exit 1
fi

echo "🎉 Migración completada exitosamente"
