#!/bin/bash

# Script de despliegue para Producción - Mi Concesionaria
# Uso: ./scripts/deploy-production.sh

set -e

echo "🟢 Iniciando despliegue de PRODUCCIÓN..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Archivo docker-compose.prod.yml no encontrado."
    echo "   Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Función para limpiar imágenes antiguas
cleanup_old_images() {
    echo "🧹 Limpiando imágenes antiguas de MiConcesionaria..."
    
    # Obtener el nombre de la imagen actual
    IMAGE_NAME=$(grep "image:" docker-compose.prod.yml | head -1 | awk '{print $2}' | tr -d '"')
    
    if [ -n "$IMAGE_NAME" ]; then
        echo "🔍 Buscando imágenes antiguas de: $IMAGE_NAME"
        
        # Buscar imágenes con el mismo nombre pero diferentes tags
        OLD_IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | grep "$(echo $IMAGE_NAME | cut -d: -f1)" | grep -v "$IMAGE_NAME" || true)
        
        if [ -n "$OLD_IMAGES" ]; then
            echo "🗑️ Eliminando imágenes antiguas:"
            echo "$OLD_IMAGES"
            
            # Extraer IDs de las imágenes antiguas
            OLD_IMAGE_IDS=$(echo "$OLD_IMAGES" | awk '{print $2}')
            
            for IMAGE_ID in $OLD_IMAGE_IDS; do
                echo "🗑️ Eliminando imagen: $IMAGE_ID"
                docker rmi -f "$IMAGE_ID" 2>/dev/null || echo "⚠️ No se pudo eliminar imagen $IMAGE_ID (puede estar en uso)"
            done
        else
            echo "✅ No se encontraron imágenes antiguas para eliminar"
        fi
        
        # Limpiar imágenes huérfanas (dangling)
        DANGLING_IMAGES=$(docker images -f "dangling=true" -q)
        if [ -n "$DANGLING_IMAGES" ]; then
            echo "🧹 Limpiando imágenes huérfanas..."
            docker rmi "$DANGLING_IMAGES" 2>/dev/null || echo "⚠️ No se pudieron eliminar todas las imágenes huérfanas"
        fi
    else
        echo "⚠️ No se pudo determinar el nombre de la imagen del docker-compose"
    fi
}

# Función para verificar espacio en disco
check_disk_space() {
    echo "💾 Verificando espacio en disco..."
    DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 80 ]; then
        echo "⚠️ ADVERTENCIA: El disco está al ${DISK_USAGE}% de capacidad"
        echo "🧹 Considera limpiar espacio antes del despliegue"
    else
        echo "✅ Espacio en disco OK: ${DISK_USAGE}% usado"
    fi
}

# Función para hacer backup de la configuración actual
backup_current_config() {
    echo "💾 Haciendo backup de la configuración actual..."
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup del docker-compose actual
    cp docker-compose.prod.yml "$BACKUP_DIR/"
    
    # Backup de variables de entorno si existen
    if [ -f ".env.production" ]; then
        cp .env.production "$BACKUP_DIR/"
    fi
    
    echo "✅ Backup guardado en: $BACKUP_DIR"
}

echo "🔍 Verificando estado actual..."
check_disk_space

echo "💾 Preparando backup..."
backup_current_config

echo "🔄 Deteniendo contenedores de producción existentes..."
docker-compose -f docker-compose.prod.yml down

echo "🧹 Limpieza de imágenes anteriores..."
cleanup_old_images

echo "📦 Descargando nueva imagen de producción..."
docker-compose -f docker-compose.prod.yml pull

echo "🚀 Iniciando servicios de producción..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 15

echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

echo "📊 Verificando logs de inicio..."
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "🧹 Limpieza final de imágenes no utilizadas..."
docker image prune -f

echo "✅ Despliegue de PRODUCCIÓN completado!"
echo "🌐 La aplicación debería estar disponible en: https://miconcesionaria.nodonorte.com"
echo "📊 Para ver los logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "💾 Backup guardado en: $BACKUP_DIR" 