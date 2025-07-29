#!/bin/bash

# Script de despliegue simplificado usando imágenes de Huawei Cloud
# Uso: ./scripts/deploy-huawei.sh

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
    REGISTRY="swr.sa-argentina-1.myhuaweicloud.com"
    ORGANIZATION="nodonorteit"

# Función para verificar Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
}

# Función para hacer login a Huawei Cloud
login_huawei() {
    print_status "Haciendo login a Huawei Cloud SWR..."
    
    # Necesitarás configurar estas variables de entorno
    if [ -z "$HUAWEI_ACCESS_KEY_ID" ] || [ -z "$HUAWEI_SECRET_ACCESS_KEY" ]; then
        print_error "Variables de entorno HUAWEI_ACCESS_KEY_ID y HUAWEI_SECRET_ACCESS_KEY no configuradas"
        print_warning "Configúralas con: export HUAWEI_ACCESS_KEY_ID=tu-key"
        print_warning "Configúralas con: export HUAWEI_SECRET_ACCESS_KEY=tu-secret"
        exit 1
    fi
    
    echo "$HUAWEI_SECRET_ACCESS_KEY" | docker login -u "$HUAWEI_ACCESS_KEY_ID" --password-stdin $REGISTRY
    
    print_success "Login exitoso a Huawei Cloud SWR"
}

# Función para descargar imágenes
pull_images() {
    print_status "Descargando imágenes de Huawei Cloud..."
    
                    # Descargar imagen de la aplicación
                docker pull $REGISTRY/$ORGANIZATION/miconcesionaria:latest
                
                # MariaDB image removed - using native MariaDB on server
    
    print_success "Imágenes descargadas correctamente"
}

# Función para detener servicios existentes
stop_services() {
    print_status "Deteniendo servicios existentes..."
    
    cd $APP_DIR
    
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down
    fi
    
    print_success "Servicios detenidos"
}

# Función para iniciar servicios
start_services() {
    print_status "Iniciando servicios..."
    
    cd $APP_DIR
    
    # Verificar que existe el archivo de configuración
    if [ ! -f ".env.production" ]; then
        print_error "Archivo .env.production no encontrado"
        print_warning "Ejecuta primero el script de instalación"
        exit 1
    fi
    
    # Iniciar servicios
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Servicios iniciados"
}

# Función para verificar estado
check_status() {
    print_status "Verificando estado de los servicios..."
    
    cd $APP_DIR
    
    # Mostrar estado de los contenedores
    docker-compose -f docker-compose.prod.yml ps
    
    # Verificar health check
    sleep 10
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Aplicación funcionando correctamente"
    else
        print_warning "Aplicación aún iniciando..."
    fi
}

# Función para mostrar información
show_info() {
    echo ""
    echo "=========================================="
    echo "🚀 DESPLIEGUE COMPLETADO"
    echo "=========================================="
    echo ""
    echo "📁 Directorio: $APP_DIR"
    echo "🌐 URL: https://miconcesionaria.nodonorte.com"
    echo "📊 Estado: docker-compose -f docker-compose.prod.yml ps"
    echo "📋 Logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo ""
    echo "🔐 Credenciales:"
    echo "• Email: admin@miconcesionaria.com"
    echo "• Contraseña: admin123"
    echo ""
}

# Función principal
main() {
    echo "🚀 Desplegando Mi Concesionaria desde Huawei Cloud"
    echo "=================================================="
    echo ""
    
    # Verificar prerrequisitos
    check_docker
    
    # Cambiar al directorio de la aplicación
    if [ ! -d "$APP_DIR" ]; then
        print_error "Directorio de la aplicación no encontrado: $APP_DIR"
        print_warning "Ejecuta primero el script de instalación"
        exit 1
    fi
    
    cd $APP_DIR
    
    # Login a Huawei Cloud
    login_huawei
    
    # Detener servicios existentes
    stop_services
    
    # Descargar imágenes
    pull_images
    
    # Iniciar servicios
    start_services
    
    # Verificar estado
    check_status
    
    # Mostrar información
    show_info
    
    print_success "¡Despliegue completado! 🎉"
}

# Ejecutar función principal
main "$@" 