#!/bin/bash

# Script para verificar el estado del directorio uploads
# Ejecutar: ./scripts/check-uploads.sh

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

print_status "Verificando directorio uploads..."

# Verificar si existe el directorio de la aplicación
if [ ! -d "$APP_DIR" ]; then
    print_error "Directorio de la aplicación no encontrado: $APP_DIR"
    exit 1
fi

# Verificar si existe el directorio uploads
if [ ! -d "$UPLOADS_DIR" ]; then
    print_warning "Directorio uploads no encontrado, creándolo..."
    mkdir -p "$UPLOADS_DIR"
    print_success "Directorio uploads creado"
else
    print_success "Directorio uploads existe"
fi

# Verificar permisos del directorio
print_status "Verificando permisos del directorio uploads..."
ls -la "$UPLOADS_DIR"

# Verificar archivos en el directorio
print_status "Verificando archivos en uploads..."
if [ "$(ls -A "$UPLOADS_DIR")" ]; then
    echo "Archivos encontrados:"
    ls -la "$UPLOADS_DIR"
    
    # Verificar archivos específicos
    for file in "$UPLOADS_DIR"/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            filesize=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "unknown")
            filetype=$(file -b "$file" 2>/dev/null || echo "unknown")
            
            echo "  📄 $filename"
            echo "     Tamaño: $filesize bytes"
            echo "     Tipo: $filetype"
            
            # Verificar si es una imagen válida
            if [[ "$filename" == *.jpg ]] || [[ "$filename" == *.jpeg ]] || [[ "$filename" == *.png ]] || [[ "$filename" == *.gif ]]; then
                if file "$file" | grep -q "image"; then
                    print_success "    ✅ Archivo de imagen válido"
                else
                    print_error "    ❌ Archivo no es una imagen válida"
                fi
            fi
        fi
    done
else
    print_warning "Directorio uploads está vacío"
fi

# Verificar permisos de escritura
print_status "Verificando permisos de escritura..."
if [ -w "$UPLOADS_DIR" ]; then
    print_success "Directorio uploads es escribible"
else
    print_error "Directorio uploads NO es escribible"
fi

# Verificar propietario
print_status "Verificando propietario del directorio..."
owner=$(stat -c%U "$UPLOADS_DIR" 2>/dev/null || stat -f%Su "$UPLOADS_DIR" 2>/dev/null || echo "unknown")
echo "Propietario: $owner"

# Verificar configuración de nginx/apache
print_status "Verificando configuración del servidor web..."

# Verificar si nginx está configurado para servir archivos estáticos
if [ -f "/etc/nginx/sites-available/nodonorte.com" ]; then
    print_status "Configuración de nginx encontrada"
    if grep -q "uploads" "/etc/nginx/sites-available/nodonorte.com"; then
        print_success "Directorio uploads configurado en nginx"
    else
        print_warning "Directorio uploads NO configurado en nginx"
    fi
elif [ -f "/etc/apache2/sites-available/nodonorte.com.conf" ]; then
    print_status "Configuración de apache encontrada"
    if grep -q "uploads" "/etc/apache2/sites-available/nodonorte.com.conf"; then
        print_success "Directorio uploads configurado en apache"
    else
        print_warning "Directorio uploads NO configurado en apache"
    fi
else
    print_warning "No se encontró configuración de servidor web"
fi

print_success "Verificación completada"
print_status "Ubicación: $UPLOADS_DIR" 