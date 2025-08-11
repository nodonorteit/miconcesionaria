#!/bin/bash

# Script para crear la tabla sale_documents en la base de datos
# Este script debe ejecutarse en el servidor de producción/staging

echo "🚀 Configurando tabla sale_documents..."

# Verificar si estamos en el directorio correcto
if [ ! -f "scripts/create-sale-documents-table.sql" ]; then
    echo "❌ Error: No se encontró el archivo SQL. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar si tenemos las credenciales de la base de datos
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: Variable DATABASE_URL no está definida"
    echo "Por favor, exporta la variable DATABASE_URL con la conexión a la base de datos"
    echo "Ejemplo: export DATABASE_URL='mysql://usuario:password@host:puerto/database'"
    exit 1
fi

echo "📊 Ejecutando script SQL para crear tabla sale_documents..."

# Extraer componentes de la URL de la base de datos
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo "🔗 Conectando a: $DB_HOST:$DB_PORT/$DB_NAME"

# Ejecutar el script SQL
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < scripts/create-sale-documents-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabla sale_documents creada exitosamente!"
    echo "🎉 El sistema de boletos de compra-venta está listo para usar"
else
    echo "❌ Error al crear la tabla sale_documents"
    echo "Verifica las credenciales y la conexión a la base de datos"
    exit 1
fi

echo "✨ Configuración completada!" 