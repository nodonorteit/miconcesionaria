#!/bin/bash

# Script para sincronizar la base de datos de producción con el schema de Prisma
# Ejecutar en el servidor de producción

echo "🚀 Sincronizando base de datos de producción..."

# Verificar si estamos en el directorio correcto
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: No se encontró prisma/schema.prisma"
    echo "Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: Variable DATABASE_URL no está definida"
    echo "Por favor, exporta la variable DATABASE_URL"
    echo "Ejemplo: export DATABASE_URL='mysql://usuario:password@host:puerto/database'"
    exit 1
fi

echo "📊 Verificando estado actual de la base de datos..."

# Ejecutar script de verificación
mysql -h "$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')" \
      -P "$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')" \
      -u "$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')" \
      -p"$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')" \
      "$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')" \
      < scripts/check-database-tables.sql

echo ""
echo "🔄 Sincronizando schema con Prisma..."

# Generar cliente de Prisma
echo "📦 Generando cliente de Prisma..."
npx prisma generate

# Sincronizar base de datos
echo "🔄 Sincronizando base de datos..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Base de datos sincronizada exitosamente!"
    
    echo ""
    echo "🔍 Verificando estado final..."
    
    # Ejecutar script de verificación nuevamente
    mysql -h "$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')" \
          -P "$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')" \
          -u "$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')" \
          -p"$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')" \
          "$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')" \
          < scripts/check-database-tables.sql
    
    echo ""
    echo "🎉 Sincronización completada!"
    echo "📋 Próximos pasos:"
    echo "1. Reinicia el contenedor de la aplicación"
    echo "2. Verifica que las APIs funcionen correctamente"
    echo "3. Prueba el sistema de boletos"
    
else
    echo "❌ Error al sincronizar la base de datos"
    echo "Verifica las credenciales y la conexión"
    exit 1
fi
