#!/bin/bash

# 🧹 Script de Retención Automática de Imágenes en Huawei Cloud
# Uso: ./scripts/retention-policy.sh [--dry-run] [--keep=10]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración por defecto
DRY_RUN=false
KEEP_COUNT=10
REGISTRY="swr.sa-argentina-1.myhuaweicloud.com"
ORGANIZATION="nodonorteit"
IMAGE_NAME="miconcesionaria"

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

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --keep=*)
            KEEP_COUNT="${1#*=}"
            shift
            ;;
        *)
            echo "❌ Argumento desconocido: $1"
            echo "Uso: $0 [--dry-run] [--keep=N]"
            echo "  --dry-run: Solo mostrar qué se eliminaría"
            echo "  --keep=N: Mantener las últimas N imágenes (default: 10)"
            exit 1
            ;;
    esac
done

echo "🧹 Política de Retención de Imágenes - MiConcesionaria"
echo "====================================================="
echo "📋 Configuración:"
echo "  - Mantener últimas: $KEEP_COUNT imágenes"
echo "  - Modo: $([ "$DRY_RUN" = true ] && echo "SIMULACIÓN" || echo "EJECUCIÓN REAL")"
echo "  - Registro: $REGISTRY/$ORGANIZATION/$IMAGE_NAME"
echo

# Función para obtener imágenes con timestamp
get_timestamp_images() {
    docker images --format "{{.Repository}}:{{.Tag}}\t{{.CreatedAt}}\t{{.ID}}" | \
    grep "$REGISTRY/$ORGANIZATION/$IMAGE_NAME" | \
    grep -E "[0-9]{8}-[0-9]{6}" | \
    sort -k2 -r
}

# Función para eliminar imágenes antiguas
cleanup_old_images() {
    log "Buscando imágenes con timestamp para limpieza..."
    
    TIMESTAMP_IMAGES=$(get_timestamp_images)
    
    if [ -z "$TIMESTAMP_IMAGES" ]; then
        echo "✅ No se encontraron imágenes con timestamp"
        return 0
    fi
    
    TOTAL_COUNT=$(echo "$TIMESTAMP_IMAGES" | wc -l)
    echo "📊 Total de imágenes con timestamp: $TOTAL_COUNT"
    
    if [ "$TOTAL_COUNT" -le "$KEEP_COUNT" ]; then
        echo "✅ No es necesario eliminar imágenes (menos de $KEEP_COUNT)"
        return 0
    fi
    
    IMAGES_TO_DELETE=$((TOTAL_COUNT - KEEP_COUNT))
    echo "🗑️ Imágenes a eliminar: $IMAGES_TO_DELETE"
    echo
    
    # Obtener imágenes a eliminar (las más antiguas)
    IMAGES_TO_REMOVE=$(echo "$TIMESTAMP_IMAGES" | tail -n +$((KEEP_COUNT + 1)))
    
    echo "📋 Imágenes que se eliminarán:"
    echo "============================="
    echo "$IMAGES_TO_REMOVE" | while read -r line; do
        TAG=$(echo "$line" | cut -f1 | cut -d: -f2)
        CREATED=$(echo "$line" | cut -f2)
        ID=$(echo "$line" | cut -f3)
        echo "  - $TAG (Creado: $CREATED, ID: $ID)"
    done
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "\n🔍 MODO SIMULACIÓN - No se eliminarán imágenes"
        return 0
    fi
    
    echo -e "\n⚠️ ¿Estás seguro de que quieres eliminar estas imágenes?"
    read -p "Escribe 'YES' para confirmar: " -r
    if [ "$REPLY" != "YES" ]; then
        echo "❌ Operación cancelada"
        return 1
    fi
    
    # Eliminar imágenes
    echo -e "\n🗑️ Eliminando imágenes antiguas..."
    echo "$IMAGES_TO_REMOVE" | while read -r line; do
        IMAGE_FULL=$(echo "$line" | cut -f1)
        ID=$(echo "$line" | cut -f3)
        
        echo "🗑️ Eliminando: $IMAGE_FULL"
        if docker rmi "$ID" 2>/dev/null; then
            echo "✅ Eliminada: $IMAGE_FULL"
        else
            warning "No se pudo eliminar: $IMAGE_FULL"
        fi
    done
    
    echo -e "\n✅ Limpieza completada"
}

# Función para limpiar imágenes huérfanas
cleanup_dangling_images() {
    log "Limpiando imágenes huérfanas..."
    
    DANGLING_COUNT=$(docker images -f "dangling=true" -q | wc -l)
    
    if [ "$DANGLING_COUNT" -eq 0 ]; then
        echo "✅ No hay imágenes huérfanas"
        return 0
    fi
    
    echo "🗑️ Imágenes huérfanas encontradas: $DANGLING_COUNT"
    
    if [ "$DRY_RUN" = true ]; then
        echo "🔍 MODO SIMULACIÓN - Se eliminarían $DANGLING_COUNT imágenes huérfanas"
        docker images -f "dangling=true" --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}"
        return 0
    fi
    
    echo "🗑️ Eliminando imágenes huérfanas..."
    docker image prune -f
    echo "✅ Imágenes huérfanas eliminadas"
}

# Función para mostrar estadísticas finales
show_final_stats() {
    log "Estadísticas finales..."
    
    echo "📊 Estado después de la limpieza:"
    echo "================================="
    
    TIMESTAMP_COUNT=$(get_timestamp_images | wc -l)
    DANGLING_COUNT=$(docker images -f "dangling=true" -q | wc -l)
    
    echo "📈 Imágenes con timestamp restantes: $TIMESTAMP_COUNT"
    echo "🗑️ Imágenes huérfanas restantes: $DANGLING_COUNT"
    
    # Calcular espacio liberado
    echo -e "\n💾 Uso de espacio Docker:"
    docker system df
}

# Función para configurar limpieza automática
setup_automatic_cleanup() {
    log "Configurando limpieza automática..."
    
    echo "📋 Opciones para limpieza automática:"
    echo "===================================="
    echo "1. Cron job diario (recomendado)"
    echo "2. Cron job semanal"
    echo "3. Manual (sin automatización)"
    
    read -p "Selecciona una opción (1-3): " -r
    case $REPLY in
        1)
            echo "📅 Configurando limpieza diaria..."
            echo "# Limpieza automática de imágenes Docker - MiConcesionaria" >> /tmp/cron_miconcesionaria
            echo "0 2 * * * cd $(pwd) && ./scripts/retention-policy.sh --keep=$KEEP_COUNT >> /var/log/miconcesionaria-cleanup.log 2>&1" >> /tmp/cron_miconcesionaria
            echo "✅ Cron job configurado para ejecutarse diariamente a las 2:00 AM"
            echo "💡 Para activarlo: crontab /tmp/cron_miconcesionaria"
            ;;
        2)
            echo "📅 Configurando limpieza semanal..."
            echo "# Limpieza automática de imágenes Docker - MiConcesionaria" >> /tmp/cron_miconcesionaria
            echo "0 2 * * 0 cd $(pwd) && ./scripts/retention-policy.sh --keep=$KEEP_COUNT >> /var/log/miconcesionaria-cleanup.log 2>&1" >> /tmp/cron_miconcesionaria
            echo "✅ Cron job configurado para ejecutarse semanalmente los domingos a las 2:00 AM"
            echo "💡 Para activarlo: crontab /tmp/cron_miconcesionaria"
            ;;
        3)
            echo "✅ Limpieza manual configurada"
            ;;
        *)
            echo "❌ Opción inválida"
            ;;
    esac
}

# Función principal
main() {
    echo "🚀 Iniciando política de retención..."
    echo
    
    # Limpiar imágenes antiguas
    cleanup_old_images
    echo
    
    # Limpiar imágenes huérfanas
    cleanup_dangling_images
    echo
    
    # Mostrar estadísticas finales
    show_final_stats
    echo
    
    # Configurar limpieza automática
    if [ "$DRY_RUN" = false ]; then
        setup_automatic_cleanup
    fi
    
    echo "🎉 Política de retención completada!"
    echo "💡 Para verificar imágenes: ./scripts/check-huawei-images.sh"
}

# Ejecutar función principal
main "$@"
