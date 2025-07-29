#!/bin/bash

# Script de instalación genérico para Mi Concesionaria en Plesk
# Uso: ./scripts/install-plesk.sh

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

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para instalar Docker
install_docker() {
    print_status "Instalando Docker..."
    
    if command_exists docker; then
        print_warning "Docker ya está instalado"
        return 0
    fi
    
    # Actualizar repositorios
    sudo apt-get update
    
    # Instalar dependencias
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Agregar GPG key oficial de Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Agregar repositorio de Docker
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Agregar usuario actual al grupo docker
    sudo usermod -aG docker $USER
    
    # Habilitar Docker para iniciar con el sistema
    sudo systemctl enable docker
    sudo systemctl start docker
    
    print_success "Docker instalado correctamente"
}

# Función para instalar Docker Compose
install_docker_compose() {
    print_status "Instalando Docker Compose..."
    
    if command_exists docker-compose; then
        print_warning "Docker Compose ya está instalado"
        return 0
    fi
    
    # Descargar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Hacer ejecutable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Crear enlace simbólico
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    print_success "Docker Compose instalado correctamente"
}

# Función para instalar Git
install_git() {
    print_status "Instalando Git..."
    
    if command_exists git; then
        print_warning "Git ya está instalado"
        return 0
    fi
    
    sudo apt-get update
    sudo apt-get install -y git
    
    print_success "Git instalado correctamente"
}

# Función para obtener configuración del usuario
get_configuration() {
    echo ""
    echo "🔧 CONFIGURACIÓN DE LA INSTALACIÓN"
    echo "=================================="
    echo ""
    
    # Solicitar información del usuario
    read -p "Ingresa el directorio de la aplicación (ej: /var/www/vhosts/tudominio.com/miconcesionaria): " APP_DIR
    read -p "Ingresa el dominio (ej: miconcesionaria.tudominio.com): " DOMAIN
    read -p "Ingresa el host de la base de datos (ej: localhost): " DB_HOST
    read -p "Ingresa el nombre de la base de datos: " DB_NAME
    read -p "Ingresa el usuario de la base de datos: " DB_USER
    read -s -p "Ingresa la contraseña de la base de datos: " DB_PASSWORD
    echo ""
    read -p "Ingresa el host SMTP: " SMTP_HOST
    read -p "Ingresa el puerto SMTP: " SMTP_PORT
    read -p "Ingresa el usuario SMTP: " SMTP_USER
    read -s -p "Ingresa la contraseña SMTP: " SMTP_PASS
    echo ""
    read -p "Ingresa el directorio de backups (ej: /var/www/vhosts/tudominio.com/backups): " BACKUP_DIR
    read -p "Ingresa el directorio de logs (ej: /var/www/vhosts/tudominio.com/logs): " LOG_DIR
    
    echo ""
    print_success "Configuración capturada"
}

# Función para crear directorios necesarios
create_directories() {
    print_status "Creando directorios necesarios..."
    
    # Crear directorio de la aplicación
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Crear directorio de backups
    sudo mkdir -p $BACKUP_DIR
    sudo chown $USER:$USER $BACKUP_DIR
    
    # Crear directorio de logs
    sudo mkdir -p $LOG_DIR
    sudo chown $USER:$USER $LOG_DIR
    
    # Crear directorio de uploads
    sudo mkdir -p $APP_DIR/uploads
    sudo chown $USER:$USER $APP_DIR/uploads
    
    print_success "Directorios creados correctamente"
}

# Función para configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    # Crear archivo .env.production con la configuración específica
    cat > $APP_DIR/.env.production <<EOF
# Database Configuration
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:3306/${DB_NAME}

# NextAuth Configuration
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# SMTP Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# Application Configuration
NODE_ENV=production
EOF
    
    print_success "Variables de entorno configuradas"
}

# Función para mostrar instrucciones de proxy reverso
show_proxy_instructions() {
    print_status "Configuración de proxy reverso en Plesk con Nginx..."
    echo ""
    echo "📋 INSTRUCCIONES PARA CONFIGURAR PROXY REVERSO EN PLESK (NGINX):"
    echo "1. Ve al panel de Plesk"
    echo "2. Selecciona el dominio: ${DOMAIN}"
    echo "3. Ve a 'Apache & nginx Settings'"
    echo "4. En la sección 'Nginx Settings', agrega en 'Additional nginx directives':"
    echo ""
    echo "   location / {"
    echo "       proxy_pass http://localhost:3000;"
    echo "       proxy_http_version 1.1;"
    echo "       proxy_set_header Upgrade \$http_upgrade;"
    echo "       proxy_set_header Connection 'upgrade';"
    echo "       proxy_set_header Host \$host;"
    echo "       proxy_set_header X-Real-IP \$remote_addr;"
    echo "       proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "       proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "       proxy_cache_bypass \$http_upgrade;"
    echo "   }"
    echo ""
    echo "5. Guarda los cambios"
    echo "6. Reinicia el servicio web si es necesario"
    echo ""
}

# Función para configurar SSL
configure_ssl() {
    print_status "Configurando SSL con Let's Encrypt..."
    
    # Verificar si certbot está instalado
    if ! command -v certbot &> /dev/null; then
        print_status "Instalando certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-apache
    fi
    
    # Obtener certificado SSL
    sudo certbot --apache -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    
    # Configurar renovación automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL configurado con Let's Encrypt"
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo "=========================================="
    echo "🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE"
    echo "=========================================="
    echo ""
    echo "📁 Directorio de la aplicación: $APP_DIR"
    echo "🌐 URL de la aplicación: https://${DOMAIN}"
    echo "🔧 Script de despliegue: $APP_DIR/scripts/deploy.sh"
    echo "📊 Logs: $LOG_DIR"
    echo "💾 Backups: $BACKUP_DIR"
    echo ""
    echo "🚀 PRÓXIMOS PASOS:"
    echo "1. cd $APP_DIR"
    echo "2. ./scripts/deploy.sh"
    echo "3. Configurar proxy reverso en Plesk (ver instrucciones arriba)"
    echo "4. Acceder a https://${DOMAIN}"
    echo ""
    echo "📋 COMANDOS ÚTILES:"
    echo "• Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "• Estado: docker-compose -f docker-compose.prod.yml ps"
    echo "• Reiniciar: docker-compose -f docker-compose.prod.yml restart"
    echo ""
    echo "🔐 CREDENCIALES POR DEFECTO:"
    echo "• Email: admin@miconcesionaria.com"
    echo "• Contraseña: admin123"
    echo ""
}

# Función principal
main() {
    echo "🚀 Instalador de Mi Concesionaria para Plesk"
    echo "============================================="
    echo ""
    
    # Verificar si se ejecuta como root
    if [ "$EUID" -eq 0 ]; then
        print_error "No ejecutes este script como root. Usa tu usuario normal."
        exit 1
    fi
    
    # Obtener configuración del usuario
    get_configuration
    
    # Instalar dependencias
    install_git
    install_docker
    install_docker_compose
    
    # Configurar directorios
    create_directories
    
    # Cambiar al directorio de la aplicación
    cd $APP_DIR
    
    # Clonar repositorio si no existe
    if [ ! -d ".git" ]; then
        print_status "Clonando repositorio..."
        git clone https://github.com/nodonorteit/miconcesionaria.git .
    fi
    
    # Configurar aplicación
    setup_environment
    show_proxy_instructions
    configure_ssl
    
    # Hacer scripts ejecutables
    chmod +x scripts/*.sh
    
    # Mostrar información final
    show_final_info
    
    print_success "¡Instalación completada! 🎉"
}

# Ejecutar función principal
main "$@" 