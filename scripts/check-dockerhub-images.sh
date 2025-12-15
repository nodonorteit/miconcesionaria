#!/bin/bash

# 🔍 Script de Verificación de Imágenes en Docker Hub
# Uso: ./scripts/check-dockerhub-images.sh

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo "🔍 Verificación de Imágenes en Docker Hub"
echo "=========================================="

# Configuración
REPOSITORY="gmsastre/miconcesionaria"
IMAGE_NAME="miconcesionaria"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

# Verificar si estamos logueados en Docker Hub
log "Verificando autenticación en Docker Hub..."
if ! docker info | grep -q "Username"; then
    warning "No estás logueado en Docker Hub"
    echo "Ejecuta: ./scripts/dockerhub-login.sh"
    exit 1
fi

# Función para obtener información de imágenes remotas
check_remote_images() {
    log "Verificando imágenes remotas en Docker Hub..."
    
    # Intentar obtener información de las imágenes
    echo "📋 Imágenes disponibles en Docker Hub:"
    echo "====================================="
    
    # Verificar imagen latest
    if docker pull "$REPOSITORY:latest" >/dev/null 2>&1; then
        LATEST_INFO=$(docker images "$REPOSITORY:latest" --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}\t{{.CreatedAt}}")
        echo "✅ Latest:"
        echo "$LATEST_INFO"
    else
        warning "No se pudo acceder a la imagen latest"
    fi
    
    # Verificar imagen staging
    if docker pull "$REPOSITORY:staging" >/dev/null 2>&1; then
        STAGING_INFO=$(docker images "$REPOSITORY:staging" --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}\t{{.CreatedAt}}")
        echo "✅ Staging:"
        echo "$STAGING_INFO"
    else
        warning "No se pudo acceder a la imagen staging"
    fi
}

# Función para verificar imágenes locales
check_local_images() {
    log "Verificando imágenes locales..."
    
    echo "📋 Imágenes locales de MiConcesionaria:"
    echo "======================================"
    
    LOCAL_IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}\t{{.CreatedAt}}" | grep -E "(miconcesionaria|gmsastre)" || echo "No se encontraron imágenes locales")
    echo "$LOCAL_IMAGES"
}

# Función para verificar uso de espacio
check_disk_usage() {
    log "Verificando uso de espacio en disco..."
    
    echo "💾 Uso de espacio Docker:"
    echo "========================"
    docker system df
    
    echo -e "\n💾 Uso de espacio en disco:"
    echo "=========================="
    df -h | grep -E "(Filesystem|/dev/)"
}

# Función para verificar imágenes huérfanas
check_dangling_images() {
    log "Verificando imágenes huérfanas..."
    
    DANGLING_COUNT=$(docker images -f "dangling=true" -q | wc -l)
    if [ "$DANGLING_COUNT" -gt 0 ]; then
        warning "Se encontraron $DANGLING_COUNT imágenes huérfanas"
        echo "Imágenes huérfanas:"
        docker images -f "dangling=true" --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}"
    else
        echo "✅ No hay imágenes huérfanas"
    fi
}

# Función para mostrar estadísticas de acumulación
show_accumulation_stats() {
    log "Analizando acumulación de imágenes..."
    
    echo "📊 Estadísticas de Acumulación:"
    echo "=============================="
    
    # Contar imágenes por tag
    LATEST_COUNT=$(docker images | grep -E "(miconcesionaria|gmsastre).*latest" | wc -l)
    STAGING_COUNT=$(docker images | grep -E "(miconcesionaria|gmsastre).*staging" | wc -l)
    TIMESTAMP_COUNT=$(docker images | grep -E "(miconcesionaria|gmsastre).*[0-9]\{8\}-[0-9]\{6\}" | wc -l)
    VERSION_COUNT=$(docker images | grep -E "(miconcesionaria|gmsastre).*v[0-9]" | wc -l)
    
    echo "📈 Imágenes por tipo:"
    echo "  - Latest: $LATEST_COUNT"
    echo "  - Staging: $STAGING_COUNT"
    echo "  - Versiones: $VERSION_COUNT"
    echo "  - Con timestamp: $TIMESTAMP_COUNT"
    
    # Calcular espacio total usado
    TOTAL_SIZE=$(docker images | grep -E "(miconcesionaria|gmsastre)" | awk '{sum+=$7} END {print sum "MB"}' 2>/dev/null || echo "No calculable")
    echo "💾 Espacio total usado por MiConcesionaria: $TOTAL_SIZE"
    
    # Mostrar recomendaciones
    echo -e "\n💡 Recomendaciones:"
    echo "=================="
    
    if [ "$TIMESTAMP_COUNT" -gt 5 ]; then
        warning "Tienes muchas imágenes con timestamp ($TIMESTAMP_COUNT). Considera limpiar las antiguas."
        echo "Ejecuta: ./scripts/cleanup-docker-images.sh"
    fi
    
    if [ "$DANGLING_COUNT" -gt 0 ]; then
        warning "Tienes imágenes huérfanas. Puedes eliminarlas con:"
        echo "docker image prune -f"
    fi
    
    echo "Para limpieza completa: ./scripts/cleanup-docker-images.sh"
}

# Función para verificar políticas de retención
check_retention_policy() {
    log "Verificando políticas de retención..."
    
    echo "📋 Política de Retención Actual:"
    echo "==============================="
    echo "✅ Latest: Se mantiene siempre (sobrescribe la anterior)"
    echo "✅ Staging: Se mantiene siempre (sobrescribe la anterior)"
    echo "✅ Dev: Se mantiene siempre (sobrescribe la anterior)"
    echo "⚠️ Timestamp: Se acumulan sin límite (puede causar problemas)"
    
    echo -e "\n💡 Recomendación:"
    echo "Considera implementar una política de retención para imágenes con timestamp:"
    echo "- Mantener solo las últimas 10 imágenes con timestamp"
    echo "- Eliminar automáticamente imágenes más antiguas"
}

# Función principal
main() {
    echo "🚀 Iniciando verificación de imágenes..."
    echo
    
    # Verificar imágenes locales
    check_local_images
    echo
    
    # Verificar imágenes remotas
    check_remote_images
    echo
    
    # Verificar imágenes huérfanas
    check_dangling_images
    echo
    
    # Verificar uso de espacio
    check_disk_usage
    echo
    
    # Mostrar estadísticas de acumulación
    show_accumulation_stats
    echo
    
    # Verificar políticas de retención
    check_retention_policy
    echo
    
    echo "🎉 Verificación completada!"
    echo "💡 Para hacer build y push: ./scripts/dockerhub-build-push.sh [latest|staging|v1.0.0]"
    echo "💡 Para limpiar imágenes antiguas: ./scripts/cleanup-docker-images.sh"
}

# Ejecutar función principal
main "$@"
