#!/bin/bash

# Script para migrar archivos de uploads al volumen de Docker
# Ejecutar: ./scripts/migrate-uploads-to-docker.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuración
LOCAL_UPLOADS_DIR="./uploads"
CONTAINER_NAME="miconcesionaria-app-1"

print_status "Migrando archivos de uploads al volumen de Docker..."

# Verificar si existe el directorio local de uploads
if [ ! -d "$LOCAL_UPLOADS_DIR" ]; then
    print_warning "Directorio local uploads no encontrado, creándolo..."
    mkdir -p "$LOCAL_UPLOADS_DIR"
fi

# Verificar si hay archivos en el directorio local
if [ "$(ls -A "$LOCAL_UPLOADS_DIR" 2>/dev/null)" ]; then
    print_status "Archivos encontrados en uploads local:"
    ls -la "$LOCAL_UPLOADS_DIR"
    
    # Verificar si el contenedor está ejecutándose
    if docker ps | grep -q "$CONTAINER_NAME"; then
        print_status "Contenedor encontrado, migrando archivos..."
        
        # Crear backup de los archivos existentes
        BACKUP_DIR="./uploads_backup_$(date +%Y%m%d_%H%M%S)"
        print_status "Creando backup en: $BACKUP_DIR"
        cp -r "$LOCAL_UPLOADS_DIR" "$BACKUP_DIR"
        
        # Copiar archivos al contenedor
        for file in "$LOCAL_UPLOADS_DIR"/*; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                print_status "Copiando: $filename"
                docker cp "$file" "$CONTAINER_NAME:/app/uploads/"
            fi
        done
        
        # Establecer permisos correctos en el contenedor
        print_status "Estableciendo permisos en el contenedor..."
        docker exec "$CONTAINER_NAME" chown -R nextjs:nodejs /app/uploads
        docker exec "$CONTAINER_NAME" chmod -R 755 /app/uploads
        
        print_success "Migración completada"
        print_status "Backup creado en: $BACKUP_DIR"
    else
        print_warning "Contenedor no está ejecutándose"
        print_status "Para migrar archivos, ejecuta:"
        echo "1. docker-compose up -d"
        echo "2. ./scripts/migrate-uploads-to-docker.sh"
    fi
else
    print_warning "Directorio uploads local está vacío"
fi

# Verificar estado del volumen
print_status "Verificando estado del volumen..."
if docker volume ls | grep -q "miconcesionaria_uploads_data"; then
    print_success "Volumen uploads_data encontrado"
    VOLUME_PATH=$(docker volume inspect miconcesionaria_uploads_data | grep -o '"/var/lib/docker/volumes/[^"]*"' | tr -d '"')
    print_status "Ubicación del volumen: $VOLUME_PATH"
else
    print_warning "Volumen uploads_data no encontrado"
    print_status "Se creará automáticamente al ejecutar docker-compose up"
fi

print_success "Proceso completado"
print_status "Para verificar archivos en el contenedor:"
echo "docker exec $CONTAINER_NAME ls -la /app/uploads" 