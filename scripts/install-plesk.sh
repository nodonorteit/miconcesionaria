#!/bin/bash

# Script de instalación para Mi Concesionaria en Plesk
# Uso: ./scripts/install-plesk.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
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

# Función para detectar el sistema operativo
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "No se pudo detectar el sistema operativo"
        exit 1
    fi
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

# Función para configurar firewall
configure_firewall() {
    print_status "Configurando firewall..."
    
    if command_exists ufw; then
        # Permitir SSH
        sudo ufw allow ssh
        
        # Permitir HTTP y HTTPS
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        
        # Permitir puerto de la aplicación (si es necesario)
        sudo ufw allow 3000/tcp
        
        # Habilitar firewall
        echo "y" | sudo ufw enable
        
        print_success "Firewall configurado correctamente"
    else
        print_warning "UFW no está instalado, saltando configuración de firewall"
    fi
}

# Función para crear directorio de la aplicación
setup_app_directory() {
    print_status "Configurando directorio de la aplicación..."
    
    # Crear directorio si no existe
    sudo mkdir -p /var/www/miconcesionaria
    
    # Cambiar propietario al usuario actual
    sudo chown $USER:$USER /var/www/miconcesionaria
    
    print_success "Directorio configurado: /var/www/miconcesionaria"
}

# Función para configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f .env.production ]; then
        cp env.production.example .env.production
        print_warning "Archivo .env.production creado. Por favor edítalo con tus configuraciones:"
        print_warning "nano .env.production"
    else
        print_warning "Archivo .env.production ya existe"
    fi
}

# Función para configurar logs
setup_logs() {
    print_status "Configurando sistema de logs..."
    
    # Crear directorio de logs
    sudo mkdir -p /var/log/miconcesionaria
    sudo chown $USER:$USER /var/log/miconcesionaria
    
    # Crear archivo de configuración para logrotate
    sudo tee /etc/logrotate.d/miconcesionaria > /dev/null <<EOF
/var/log/miconcesionaria/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF
    
    print_success "Sistema de logs configurado"
}

# Función para crear script de mantenimiento
create_maintenance_script() {
    print_status "Creando script de mantenimiento..."
    
    cat > /var/www/miconcesionaria/maintenance.sh <<'EOF'
#!/bin/bash

# Script de mantenimiento para Mi Concesionaria
# Uso: ./maintenance.sh [backup|restore|update|logs]

set -e

APP_DIR="/var/www/miconcesionaria"
BACKUP_DIR="/var/backups/miconcesionaria"
DATE=$(date +%Y%m%d_%H%M%S)

case "$1" in
    backup)
        echo "Creando backup..."
        mkdir -p $BACKUP_DIR
        cd $APP_DIR
        
        # Backup de la base de datos
        docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres miconcesionaria > $BACKUP_DIR/db_backup_$DATE.sql
        
        # Backup de archivos
        tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads/
        
        echo "Backup completado: $BACKUP_DIR/"
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "Uso: $0 restore <fecha_backup>"
            exit 1
        fi
        echo "Restaurando backup del $2..."
        cd $APP_DIR
        
        # Restaurar base de datos
        docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres miconcesionaria < $BACKUP_DIR/db_backup_$2.sql
        
        # Restaurar archivos
        tar -xzf $BACKUP_DIR/files_backup_$2.tar.gz
        
        echo "Restauración completada"
        ;;
    update)
        echo "Actualizando aplicación..."
        cd $APP_DIR
        
        # Backup antes de actualizar
        ./maintenance.sh backup
        
        # Actualizar código
        git pull origin master
        
        # Reconstruir y reiniciar
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up --build -d
        
        echo "Actualización completada"
        ;;
    logs)
        cd $APP_DIR
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    *)
        echo "Uso: $0 {backup|restore|update|logs}"
        exit 1
        ;;
esac
EOF
    
    chmod +x /var/www/miconcesionaria/maintenance.sh
    print_success "Script de mantenimiento creado: /var/www/miconcesionaria/maintenance.sh"
}

# Función para crear servicio systemd
create_systemd_service() {
    print_status "Creando servicio systemd..."
    
    sudo tee /etc/systemd/system/miconcesionaria.service > /dev/null <<EOF
[Unit]
Description=Mi Concesionaria Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/miconcesionaria
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # Recargar systemd y habilitar servicio
    sudo systemctl daemon-reload
    sudo systemctl enable miconcesionaria.service
    
    print_success "Servicio systemd creado y habilitado"
}

# Función para configurar monitoreo
setup_monitoring() {
    print_status "Configurando monitoreo básico..."
    
    # Crear script de health check
    cat > /var/www/miconcesionaria/health-check.sh <<'EOF'
#!/bin/bash

# Health check para Mi Concesionaria
APP_URL="http://localhost:3000/api/health"

response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $response -eq 200 ]; then
    echo "OK - Aplicación funcionando correctamente"
    exit 0
else
    echo "ERROR - Aplicación no responde (HTTP $response)"
    exit 1
fi
EOF
    
    chmod +x /var/www/miconcesionaria/health-check.sh
    
    # Agregar al crontab para monitoreo cada 5 minutos
    (crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/miconcesionaria/health-check.sh >> /var/log/miconcesionaria/health.log 2>&1") | crontab -
    
    print_success "Monitoreo configurado"
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo "=========================================="
    echo "🎉 INSTALACIÓN COMPLETADA EXITOSAMENTE"
    echo "=========================================="
    echo ""
    echo "📁 Directorio de la aplicación: /var/www/miconcesionaria"
    echo "🔧 Script de despliegue: /var/www/miconcesionaria/scripts/deploy.sh"
    echo "🛠️  Script de mantenimiento: /var/www/miconcesionaria/maintenance.sh"
    echo "📊 Logs: /var/log/miconcesionaria/"
    echo "💾 Backups: /var/backups/miconcesionaria/"
    echo ""
    echo "🚀 PRÓXIMOS PASOS:"
    echo "1. cd /var/www/miconcesionaria"
    echo "2. nano .env.production (configurar variables)"
    echo "3. ./scripts/deploy.sh"
    echo "4. Configurar proxy reverso en Plesk"
    echo ""
    echo "📋 COMANDOS ÚTILES:"
    echo "• Ver logs: ./maintenance.sh logs"
    echo "• Crear backup: ./maintenance.sh backup"
    echo "• Actualizar: ./maintenance.sh update"
    echo "• Estado del servicio: sudo systemctl status miconcesionaria"
    echo ""
    echo "🌐 La aplicación estará disponible en: http://localhost:3000"
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
    
    # Detectar sistema operativo
    detect_os
    print_status "Sistema operativo detectado: $OS $VER"
    
    # Verificar que sea Ubuntu
    if [[ ! "$OS" =~ "Ubuntu" ]]; then
        print_warning "Este script está optimizado para Ubuntu. Otros sistemas pueden requerir ajustes."
    fi
    
    # Instalar dependencias
    install_git
    install_docker
    install_docker_compose
    
    # Configurar sistema
    configure_firewall
    setup_app_directory
    setup_logs
    create_maintenance_script
    create_systemd_service
    setup_monitoring
    
    # Cambiar al directorio de la aplicación
    cd /var/www/miconcesionaria
    
    # Clonar repositorio si no existe
    if [ ! -d ".git" ]; then
        print_status "Clonando repositorio..."
        git clone https://github.com/nodonorteit/miconcesionaria.git .
    fi
    
    # Configurar variables de entorno
    setup_environment
    
    # Hacer scripts ejecutables
    chmod +x scripts/*.sh
    
    # Mostrar información final
    show_final_info
    
    print_success "¡Instalación completada! 🎉"
}

# Ejecutar función principal
main "$@" 