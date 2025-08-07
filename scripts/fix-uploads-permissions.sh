#!/bin/bash
set -e

echo "🔧 Corrigiendo permisos del directorio uploads..."

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.yml"
    echo "   Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# Verificar si existe el directorio uploads
if [ ! -d "./uploads" ]; then
    echo "📁 Creando directorio uploads..."
    mkdir -p ./uploads
fi

# Detectar el usuario del contenedor
echo "👤 Detectando usuario del contenedor..."
CONTAINER_USER=$(docker-compose exec -T app id -u 2>/dev/null || echo "1001")
CONTAINER_GROUP=$(docker-compose exec -T app id -g 2>/dev/null || echo "1001")

echo "🔍 Usuario del contenedor: $CONTAINER_USER:$CONTAINER_GROUP"

# Cambiar permisos del directorio uploads
echo "🔐 Configurando permisos..."
sudo chown -R $CONTAINER_USER:$CONTAINER_GROUP ./uploads
sudo chmod -R 755 ./uploads

# Verificar que los permisos se aplicaron correctamente
echo "✅ Verificando permisos..."
ls -la ./uploads/

echo ""
echo "🎉 Permisos corregidos exitosamente!"
echo ""
echo "📋 Para verificar que funcionó:"
echo "   - Intenta subir un nuevo logo desde la configuración de empresa"
echo "   - Verifica que no aparezcan errores de permisos en los logs"
echo ""
echo "🔄 Si necesitas reiniciar la aplicación:"
echo "   docker-compose restart app" 