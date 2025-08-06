#!/bin/bash

# Script para reparar archivos corruptos en uploads
# Ejecutar: ./scripts/repair-uploads.sh

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

print_status "Reparando archivos en uploads..."

# Verificar si existe el directorio de la aplicación
if [ ! -d "$APP_DIR" ]; then
    print_error "Directorio de la aplicación no encontrado: $APP_DIR"
    exit 1
fi

# Verificar si existe el directorio uploads
if [ ! -d "$UPLOADS_DIR" ]; then
    print_warning "Directorio uploads no encontrado, creándolo..."
    mkdir -p "$UPLOADS_DIR"
    chmod 755 "$UPLOADS_DIR"
    chown www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown nginx:nginx "$UPLOADS_DIR" 2>/dev/null || print_warning "No se pudo cambiar propietario"
    print_success "Directorio uploads creado"
fi

# Verificar archivos en el directorio
print_status "Verificando archivos en uploads..."
if [ "$(ls -A "$UPLOADS_DIR")" ]; then
    echo "Archivos encontrados:"
    ls -la "$UPLOADS_DIR"
    
    # Verificar y reparar archivos específicos
    for file in "$UPLOADS_DIR"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            filesize=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")
            
            echo "  📄 Verificando: $filename"
            echo "     Tamaño: $filesize bytes"
            
            # Verificar si es una imagen válida
            if [[ "$filename" == *.jpg ]] || [[ "$filename" == *.jpeg ]] || [[ "$filename" == *.png ]] || [[ "$filename" == *.gif ]]; then
                if file "$file" | grep -q "image"; then
                    print_success "    ✅ Archivo de imagen válido"
                else
                    print_error "    ❌ Archivo no es una imagen válida - ELIMINANDO"
                    rm -f "$file"
                fi
            fi
            
            # Verificar archivos vacíos o muy pequeños
            if [ "$filesize" -lt 100 ]; then
                print_warning "    ⚠️ Archivo muy pequeño ($filesize bytes) - ELIMINANDO"
                rm -f "$file"
            fi
        fi
    done
else
    print_warning "Directorio uploads está vacío"
fi

# Verificar permisos
print_status "Verificando permisos..."
chmod 755 "$UPLOADS_DIR"
find "$UPLOADS_DIR" -type f -exec chmod 644 {} \;

# Verificar propietario
print_status "Verificando propietario..."
chown www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown nginx:nginx "$UPLOADS_DIR" 2>/dev/null || print_warning "No se pudo cambiar propietario del directorio"
find "$UPLOADS_DIR" -type f -exec chown www-data:www-data {} \; 2>/dev/null || find "$UPLOADS_DIR" -type f -exec chown nginx:nginx {} \; 2>/dev/null || print_warning "No se pudieron cambiar propietarios de archivos"

# Limpiar archivos temporales
print_status "Limpiando archivos temporales..."
find "$UPLOADS_DIR" -name "*.tmp" -delete 2>/dev/null || true
find "$UPLOADS_DIR" -name "*.temp" -delete 2>/dev/null || true

print_success "Reparación completada"
print_status "Ubicación: $UPLOADS_DIR" 