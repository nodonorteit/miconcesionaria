#!/bin/bash

# Script para solucionar problemas de permisos en el directorio uploads
# Ejecutar: ./scripts/fix-uploads-permissions.sh

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
GITKEEP_FILE="$UPLOADS_DIR/.gitkeep"

print_status "Solucionando problemas de permisos en uploads..."

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

# Verificar si existe el archivo .gitkeep
if [ -f "$GITKEEP_FILE" ]; then
    print_status "Archivo .gitkeep encontrado, verificando permisos..."
    
    # Intentar cambiar permisos del archivo
    if chmod 644 "$GITKEEP_FILE" 2>/dev/null; then
        print_success "Permisos del archivo .gitkeep actualizados"
    else
        print_warning "No se pudieron cambiar los permisos del archivo .gitkeep"
    fi
    
    # Intentar cambiar el propietario
    if chown www-data:www-data "$GITKEEP_FILE" 2>/dev/null || chown nginx:nginx "$GITKEEP_FILE" 2>/dev/null; then
        print_success "Propietario del archivo .gitkeep actualizado"
    else
        print_warning "No se pudo cambiar el propietario del archivo .gitkeep"
    fi
else
    print_status "Archivo .gitkeep no encontrado, creándolo..."
    echo "# Este archivo asegura que el directorio uploads se incluya en el repositorio" > "$GITKEEP_FILE"
    echo "# Los archivos subidos por los usuarios se guardarán aquí" >> "$GITKEEP_FILE"
    print_success "Archivo .gitkeep creado"
fi

# Establecer permisos correctos en el directorio
print_status "Estableciendo permisos del directorio..."
chmod 755 "$UPLOADS_DIR"

# Intentar cambiar el propietario del directorio
if chown www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown nginx:nginx "$UPLOADS_DIR" 2>/dev/null; then
    print_success "Propietario del directorio actualizado"
else
    print_warning "No se pudo cambiar el propietario del directorio"
fi

# Verificar permisos finales
print_status "Verificando permisos finales..."
ls -la "$UPLOADS_DIR"

print_success "Problemas de permisos solucionados"
print_status "Ubicación: $UPLOADS_DIR"
print_status "Archivo .gitkeep: $GITKEEP_FILE" 