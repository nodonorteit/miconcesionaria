#!/bin/bash

# 🚀 Script para Build y Push de Imágenes a Docker Hub
# Uso: ./scripts/dockerhub-build-push.sh [latest|staging|version]

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
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Configuración
DOCKERHUB_USERNAME="gmsastre"
REPOSITORY="gmsastre/miconcesionaria"

# Verificar parámetro
if [ $# -eq 0 ]; then
    error "Uso: $0 [latest|staging|v1.0.0]"
    echo "  latest: Build y push de imagen de producción"
    echo "  staging: Build y push de imagen de staging"
    echo "  v1.0.0: Build y push de versión específica"
fi

TAG=$1

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
fi

# Verificar login a Docker Hub
log "Verificando login a Docker Hub..."
if ! docker info | grep -q "Username"; then
    warning "No estás logueado en Docker Hub"
    log "Ejecutando login..."
    ./scripts/dockerhub-login.sh
fi

# Build de la imagen
log "🔨 Construyendo imagen con tag: $TAG"
docker build -t "$REPOSITORY:$TAG" .

if [ $? -eq 0 ]; then
    log "✅ Build exitoso"
else
    error "Error en el build"
fi

# Push de la imagen
log "📤 Subiendo imagen a Docker Hub..."
docker push "$REPOSITORY:$TAG"

if [ $? -eq 0 ]; then
    log "✅ Push exitoso"
    log "Imagen disponible en: $REPOSITORY:$TAG"
    echo ""
    info "Para usar esta imagen en producción/staging:"
    echo "  docker pull $REPOSITORY:$TAG"
    echo "  docker-compose -f docker-compose.prod.yml pull"
else
    error "Error en el push"
fi

