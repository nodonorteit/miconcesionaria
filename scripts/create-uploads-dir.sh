#!/bin/bash

# Script para crear el directorio de uploads con permisos correctos
# Ejecutar: ./scripts/create-uploads-dir.sh

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
APP_DIR="/var/www/vhosts/nodonorte.com/miconcesionaria"
UPLOADS_DIR="$APP_DIR/uploads"

print_status "Creando directorio de uploads..."

# Verificar que existe el directorio de la aplicación
if [ ! -d "$APP_DIR" ]; then
    print_error "Directorio de la aplicación no encontrado: $APP_DIR"
    exit 1
fi

# Crear directorio de uploads si no existe
if [ ! -d "$UPLOADS_DIR" ]; then
    print_status "Creando directorio: $UPLOADS_DIR"
    mkdir -p "$UPLOADS_DIR"
    print_success "Directorio creado"
else
    print_warning "El directorio ya existe: $UPLOADS_DIR"
fi

# Establecer permisos correctos
print_status "Estableciendo permisos..."
chmod 755 "$UPLOADS_DIR"
chown www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown nginx:nginx "$UPLOADS_DIR" 2>/dev/null || print_warning "No se pudo cambiar el propietario"

print_success "Directorio de uploads configurado correctamente"
print_status "Ubicación: $UPLOADS_DIR"
print_status "Permisos: $(ls -ld "$UPLOADS_DIR")" 