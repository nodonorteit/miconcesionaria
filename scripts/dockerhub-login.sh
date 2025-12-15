#!/bin/bash

# 🔐 Script de Login a Docker Hub
# Uso: ./scripts/dockerhub-login.sh

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

echo "🔐 Login a Docker Hub"
echo "===================="

# Configuración
DOCKERHUB_USERNAME="gmsastre"
DOCKERHUB_TOKEN="${DOCKERHUB_TOKEN:-}"  # Leer desde variable de entorno
IMAGE_NAME="miconcesionaria"
REPOSITORY="gmsastre/miconcesionaria"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
fi

# Verificar que el token esté configurado
if [ -z "$DOCKERHUB_TOKEN" ]; then
    error "DOCKERHUB_TOKEN no está configurado. Por favor, configúralo como variable de entorno o edita este script."
    echo "Ejemplo: export DOCKERHUB_TOKEN='tu-token-aqui'"
    exit 1
fi

log "Iniciando login a Docker Hub..."

# Hacer login a Docker Hub
echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin docker.io

if [ $? -eq 0 ]; then
    log "✅ Login exitoso a Docker Hub"
    log "Usuario: $DOCKERHUB_USERNAME"
    log "Repositorio: $REPOSITORY"
    echo ""
    info "Ahora puedes hacer push/pull de imágenes:"
    echo "  - Producción: $REPOSITORY:latest"
    echo "  - Staging: $REPOSITORY:staging"
    echo ""
    info "Para hacer push de una imagen:"
    echo "  docker tag miconcesionaria:latest $REPOSITORY:latest"
    echo "  docker push $REPOSITORY:latest"
else
    error "Error al hacer login a Docker Hub"
fi

