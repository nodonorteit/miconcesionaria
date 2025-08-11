#!/bin/bash

# Script para crear la tabla sale_documents en PRODUCCIÓN
# Credenciales específicas del entorno de producción

echo "🚀 Configurando tabla sale_documents en PRODUCCIÓN..."

# Credenciales de producción
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_NAME="miconcesionaria"
DB_USER="miconcesionaria"
DB_PASS="!FVsxr?pmm34xm2N"

echo "🔗 Conectando a: $DB_HOST:$DB_PORT/$DB_NAME"
echo "👤 Usuario: $DB_USER"
echo "⚠️  ATENCIÓN: Estás configurando PRODUCCIÓN"

# Confirmar antes de proceder
read -p "¿Estás seguro de que quieres continuar en PRODUCCIÓN? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

# Verificar si estamos en el directorio correcto
if [ ! -f "scripts/create-sale-documents-table.sql" ]; then
    echo "❌ Error: No se encontró el archivo SQL. Ejecutar desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar si MySQL está disponible
if ! command -v mysql &> /dev/null; then
    echo "❌ Error: Cliente MySQL no está instalado"
    echo "Instalar con: sudo apt-get install mysql-client"
    exit 1
fi

echo "📊 Ejecutando script SQL para crear tabla sale_documents..."

# Ejecutar el script SQL
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < scripts/create-sale-documents-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabla sale_documents creada exitosamente!"
    echo "🎉 El sistema de boletos de compra-venta está listo para usar en PRODUCCIÓN"
    
    # Verificar que la tabla se creó
    echo "🔍 Verificando creación de la tabla..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "DESCRIBE sale_documents;"
    
else
    echo "❌ Error al crear la tabla sale_documents"
    echo "Verifica la conexión a la base de datos"
    exit 1
fi

echo "✨ Configuración de PRODUCCIÓN completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Reinicia el contenedor de producción"
echo "2. Verifica que la aplicación funcione sin errores"
echo "3. Prueba crear una venta y generar un boleto"
echo "4. Monitorea los logs para asegurar que no hay errores" 