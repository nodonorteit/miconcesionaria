#!/bin/bash

# Script alternativo para crear la tabla system_logs
# Este script permite ingresar la contraseña manualmente

echo "🔧 Creando tabla system_logs..."

# Configuración de la base de datos
DB_HOST="127.0.0.1"
DB_NAME="miconcesionaria"

echo "📊 Configuración de base de datos:"
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"

# Verificar que el archivo SQL existe
if [ ! -f "scripts/create-system-logs-table.sql" ]; then
    echo "❌ Error: No se encontró el archivo scripts/create-system-logs-table.sql"
    exit 1
fi

echo ""
echo "🔑 Opciones de usuario:"
echo "1. root (sin contraseña)"
echo "2. root (con contraseña)"
echo "3. miconcesionaria (con contraseña)"
echo ""
read -p "Selecciona una opción (1-3): " option

case $option in
    1)
        DB_USER="root"
        DB_PASSWORD=""
        echo "📝 Ejecutando script SQL con root (sin contraseña)..."
        mysql -h "$DB_HOST" -u "$DB_USER" "$DB_NAME" < scripts/create-system-logs-table.sql
        ;;
    2)
        DB_USER="root"
        echo "📝 Ejecutando script SQL con root (con contraseña)..."
        mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < scripts/create-system-logs-table.sql
        ;;
    3)
        DB_USER="miconcesionaria"
        echo "📝 Ejecutando script SQL con miconcesionaria..."
        mysql -h "$DB_HOST" -u "$DB_USER" -p "$DB_NAME" < scripts/create-system-logs-table.sql
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo "✅ Tabla system_logs creada exitosamente"
    echo "🔍 Verificando que la tabla existe..."
    mysql -h "$DB_HOST" -u "$DB_USER" ${DB_PASSWORD:+-p} "$DB_NAME" -e "DESCRIBE system_logs;"
    echo "📊 Mostrando logs de prueba..."
    mysql -h "$DB_HOST" -u "$DB_USER" ${DB_PASSWORD:+-p} "$DB_NAME" -e "SELECT * FROM system_logs ORDER BY createdAt DESC LIMIT 3;"
else
    echo "❌ Error al crear la tabla system_logs"
    exit 1
fi

echo "🎉 Migración completada exitosamente"
