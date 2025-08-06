#!/bin/bash

# Script de post-deploy para solucionar problemas comunes después del despliegue
# Este script se ejecuta automáticamente después del despliegue

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[POST-DEPLOY]${NC} $1"
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

print_status "Iniciando post-deploy..."

# 1. Solucionar permisos del directorio uploads
print_status "1. Solucionando permisos del directorio uploads..."

if [ -d "$UPLOADS_DIR" ]; then
    # Establecer permisos correctos
    chmod 755 "$UPLOADS_DIR" 2>/dev/null || print_warning "No se pudieron cambiar permisos del directorio"
    
    # Cambiar propietario si es posible
    chown www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown nginx:nginx "$UPLOADS_DIR" 2>/dev/null || print_warning "No se pudo cambiar propietario del directorio"
    
    print_success "Permisos del directorio uploads actualizados"
else
    print_warning "Directorio uploads no encontrado, creándolo..."
    mkdir -p "$UPLOADS_DIR"
    chmod 755 "$UPLOADS_DIR"
    chown www-data:www-data "$UPLOADS_DIR" 2>/dev/null || chown nginx:nginx "$UPLOADS_DIR" 2>/dev/null || print_warning "No se pudo cambiar propietario"
    print_success "Directorio uploads creado"
fi

# 2. Solucionar permisos del archivo .gitkeep
print_status "2. Solucionando permisos del archivo .gitkeep..."

if [ -f "$GITKEEP_FILE" ]; then
    # Cambiar permisos del archivo
    chmod 644 "$GITKEEP_FILE" 2>/dev/null || print_warning "No se pudieron cambiar permisos del archivo .gitkeep"
    
    # Cambiar propietario del archivo
    chown www-data:www-data "$GITKEEP_FILE" 2>/dev/null || chown nginx:nginx "$GITKEEP_FILE" 2>/dev/null || print_warning "No se pudo cambiar propietario del archivo .gitkeep"
    
    print_success "Permisos del archivo .gitkeep actualizados"
else
    print_warning "Archivo .gitkeep no encontrado, creándolo..."
    echo "# Este archivo asegura que el directorio uploads se incluya en el repositorio" > "$GITKEEP_FILE"
    echo "# Los archivos subidos por los usuarios se guardarán aquí" >> "$GITKEEP_FILE"
    chmod 644 "$GITKEEP_FILE"
    chown www-data:www-data "$GITKEEP_FILE" 2>/dev/null || chown nginx:nginx "$GITKEEP_FILE" 2>/dev/null || print_warning "No se pudo cambiar propietario"
    print_success "Archivo .gitkeep creado"
fi

# 3. Verificar permisos de la aplicación
print_status "3. Verificando permisos de la aplicación..."

if [ -d "$APP_DIR" ]; then
    # Establecer permisos básicos para la aplicación
    find "$APP_DIR" -type f -exec chmod 644 {} \; 2>/dev/null || print_warning "No se pudieron cambiar permisos de archivos"
    find "$APP_DIR" -type d -exec chmod 755 {} \; 2>/dev/null || print_warning "No se pudieron cambiar permisos de directorios"
    
    print_success "Permisos de la aplicación verificados"
else
    print_error "Directorio de la aplicación no encontrado: $APP_DIR"
fi

# 4. Limpiar archivos temporales
print_status "4. Limpiando archivos temporales..."

# Eliminar archivos temporales de Next.js si existen
if [ -d "$APP_DIR/.next" ]; then
    find "$APP_DIR/.next" -name "*.tmp" -delete 2>/dev/null || true
    print_success "Archivos temporales limpiados"
fi

# 5. Verificar servicios
print_status "5. Verificando servicios..."

# Verificar si el servicio web está funcionando
if systemctl is-active --quiet nginx 2>/dev/null || systemctl is-active --quiet apache2 2>/dev/null; then
    print_success "Servicio web está funcionando"
else
    print_warning "Servicio web no está funcionando o no se pudo verificar"
fi

print_success "Post-deploy completado exitosamente"
print_status "Ubicación de la aplicación: $APP_DIR"
print_status "Directorio de uploads: $UPLOADS_DIR" 