#!/bin/bash

# Script de limpieza manual de imágenes Docker - Mi Concesionaria
# Uso: ./scripts/cleanup-docker-images.sh [--force] [--all]

set -e

FORCE=false
CLEAN_ALL=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        --all)
            CLEAN_ALL=true
            shift
            ;;
        *)
            echo "❌ Argumento desconocido: $1"
            echo "Uso: $0 [--force] [--all]"
            echo "  --force: Forzar eliminación sin confirmación"
            echo "  --all: Limpiar todas las imágenes (no solo MiConcesionaria)"
            exit 1
            ;;
    esac
done

echo "🧹 Script de Limpieza de Imágenes Docker - Mi Concesionaria"
echo "=========================================================="

# Función para confirmar acción
confirm_action() {
    local message="$1"
    if [ "$FORCE" = true ]; then
        echo "✅ $message (forzado)"
        return 0
    fi
    
    read -p "❓ $message (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Función para limpiar imágenes de MiConcesionaria
cleanup_miconcesionaria_images() {
    echo "🔍 Buscando imágenes de MiConcesionaria..."
    
    # Buscar imágenes por nombre
    MICO_IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}" | grep -i "miconcesionaria" || true)
    
    if [ -n "$MICO_IMAGES" ]; then
        echo "📋 Imágenes de MiConcesionaria encontradas:"
        echo "$MICO_IMAGES"
        echo
        
        if confirm_action "¿Eliminar todas las imágenes de MiConcesionaria?"; then
            echo "🗑️ Eliminando imágenes de MiConcesionaria..."
            
            # Extraer IDs de las imágenes
            MICO_IMAGE_IDS=$(echo "$MICO_IMAGES" | awk '{print $2}')
            
            for IMAGE_ID in $MICO_IMAGE_IDS; do
                echo "🗑️ Eliminando imagen: $IMAGE_ID"
                docker rmi -f "$IMAGE_ID" 2>/dev/null || echo "⚠️ No se pudo eliminar imagen $IMAGE_ID"
            done
            
            echo "✅ Imágenes de MiConcesionaria eliminadas"
        else
            echo "⏭️ Saltando eliminación de imágenes de MiConcesionaria"
        fi
    else
        echo "✅ No se encontraron imágenes de MiConcesionaria"
    fi
}

# Función para limpiar imágenes huérfanas
cleanup_dangling_images() {
    echo "🔍 Buscando imágenes huérfanas (dangling)..."
    
    DANGLING_IMAGES=$(docker images -f "dangling=true" -q)
    
    if [ -n "$DANGLING_IMAGES" ]; then
        DANGLING_COUNT=$(echo "$DANGLING_IMAGES" | wc -l)
        DANGLING_SIZE=$(docker images -f "dangling=true" --format "{{.Size}}" | awk '{sum+=$1} END {print sum "MB"}' 2>/dev/null || echo "desconocido")
        
        echo "📋 Imágenes huérfanas encontradas: $DANGLING_COUNT (Tamaño: $DANGLING_SIZE)"
        
        if confirm_action "¿Eliminar todas las imágenes huérfanas?"; then
            echo "🗑️ Eliminando imágenes huérfanas..."
            docker rmi "$DANGLING_IMAGES" 2>/dev/null || echo "⚠️ No se pudieron eliminar todas las imágenes huérfanas"
            echo "✅ Imágenes huérfanas eliminadas"
        else
            echo "⏭️ Saltando eliminación de imágenes huérfanas"
        fi
    else
        echo "✅ No se encontraron imágenes huérfanas"
    fi
}

# Función para limpiar todas las imágenes (solo con --all)
cleanup_all_images() {
    if [ "$CLEAN_ALL" = true ]; then
        echo "🔍 Buscando todas las imágenes..."
        
        ALL_IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}" | tail -n +2)
        
        if [ -n "$ALL_IMAGES" ]; then
            ALL_COUNT=$(echo "$ALL_IMAGES" | wc -l)
            echo "📋 Total de imágenes encontradas: $ALL_COUNT"
            
            if confirm_action "⚠️ ¿Eliminar TODAS las imágenes? (Esto puede afectar otras aplicaciones)"; then
                echo "🗑️ Eliminando todas las imágenes..."
                docker rmi -f $(docker images -q) 2>/dev/null || echo "⚠️ No se pudieron eliminar todas las imágenes"
                echo "✅ Todas las imágenes eliminadas"
            else
                echo "⏭️ Saltando eliminación de todas las imágenes"
            fi
        else
            echo "✅ No hay imágenes para eliminar"
        fi
    fi
}

# Función para limpieza del sistema Docker
cleanup_docker_system() {
    echo "🧹 Limpieza del sistema Docker..."
    
    if confirm_action "¿Ejecutar limpieza completa del sistema Docker?"; then
        echo "🧹 Ejecutando docker system prune..."
        docker system prune -f
        
        echo "🧹 Ejecutando docker image prune..."
        docker image prune -f
        
        echo "🧹 Ejecutando docker volume prune..."
        docker volume prune -f
        
        echo "🧹 Ejecutando docker network prune..."
        docker network prune -f
        
        echo "✅ Limpieza del sistema Docker completada"
    else
        echo "⏭️ Saltando limpieza del sistema Docker"
    fi
}

# Función para mostrar estadísticas
show_statistics() {
    echo "📊 Estadísticas después de la limpieza:"
    echo "======================================"
    
    echo "🐳 Contenedores:"
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" 2>/dev/null || echo "No se pueden mostrar contenedores"
    
    echo -e "\n🖼️ Imágenes:"
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.Size}}" 2>/dev/null || echo "No se pueden mostrar imágenes"
    
    echo -e "\n💾 Volúmenes:"
    docker volume ls --format "table {{.Name}}\t{{.Driver}}" 2>/dev/null || echo "No se pueden mostrar volúmenes"
    
    echo -e "\n🌐 Redes:"
    docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" 2>/dev/null || echo "No se pueden mostrar redes"
    
    # Mostrar uso de disco
    echo -e "\n💾 Uso de disco:"
    df -h . | tail -1
}

# Función principal
main() {
    echo "🚀 Iniciando proceso de limpieza..."
    echo
    
    # Limpiar imágenes de MiConcesionaria
    cleanup_miconcesionaria_images
    echo
    
    # Limpiar imágenes huérfanas
    cleanup_dangling_images
    echo
    
    # Limpiar todas las imágenes (solo con --all)
    cleanup_all_images
    echo
    
    # Limpieza del sistema Docker
    cleanup_docker_system
    echo
    
    # Mostrar estadísticas finales
    show_statistics
    echo
    
    echo "🎉 Proceso de limpieza completado!"
    echo "💡 Para ver logs detallados, ejecuta: docker system df"
}

# Ejecutar función principal
main "$@"
