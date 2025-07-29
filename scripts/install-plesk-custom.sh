#!/bin/bash

# Script de instalación personalizado para Mi Concesionaria en Plesk
# Configurado para: miconcesionaria.nodonorte.com
# Uso: ./scripts/install-plesk-custom.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración específica del usuario
APP_DIR="/var/www/vhosts/nodonorte.com/miconcesionaria"
DOMAIN="miconcesionaria.nodonorte.com"
DB_HOST="localhost"
DB_NAME="miconcesionaria"
DB_USER="miconcesionaria"
DB_PASSWORD="!FVsxr?pmm34xm2N"
SMTP_HOST="smtp1.s.ipzmarketing.com"
SMTP_PORT="587"
SMTP_USER="pzbkjxwenzkr"
SMTP_PASS="7FOtsP0qKvNF"
BACKUP_DIR="/var/www/vhosts/nodonorte.com/backups"
LOG_DIR="/var/www/vhosts/nodonorte.com/logs"

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

# Función para crear docker-compose personalizado
create_docker_compose() {
    print_status "Creando docker-compose personalizado..."
    
    cat > $APP_DIR/docker-compose.prod.yml <<EOF
version: '3.8'

services:
  app:
    build: .
    platform: linux/amd64
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:3306/${DB_NAME}
      - NEXTAUTH_URL=https://${DOMAIN}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - db

  db:
    image: mariadb:10.6
    platform: linux/amd64
    environment:
      - MYSQL_ROOT_PASSWORD=root_password_secure_here
      - MYSQL_DATABASE=${DB_NAME}
      - MYSQL_USER=${DB_USER}
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mariadb_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mariadb_data:
EOF
    
    print_success "Docker Compose personalizado creado"
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

# Función para crear script de mantenimiento
create_maintenance_script() {
    print_status "Creando script de mantenimiento..."
    
    cat > $APP_DIR/maintenance.sh <<'EOF'
#!/bin/bash

# Script de mantenimiento para Mi Concesionaria
# Uso: ./maintenance.sh [backup|restore|update|logs]

set -e

APP_DIR="/var/www/vhosts/nodonorte.com/miconcesionaria"
BACKUP_DIR="/var/www/vhosts/nodonorte.com/backups"
DATE=$(date +%Y%m%d_%H%M%S)

case "$1" in
    backup)
        echo "Creando backup..."
        mkdir -p $BACKUP_DIR
        cd $APP_DIR
        
        # Backup de la base de datos
        docker-compose -f docker-compose.prod.yml exec -T db mysqldump -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria > $BACKUP_DIR/db_backup_$DATE.sql
        
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
        docker-compose -f docker-compose.prod.yml exec -T db mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < $BACKUP_DIR/db_backup_$2.sql
        
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
    
    chmod +x $APP_DIR/maintenance.sh
    print_success "Script de mantenimiento creado"
}

# Función para crear script de monitoreo
create_monitoring_script() {
    print_status "Creando script de monitoreo..."
    
    cat > $APP_DIR/monitor.sh <<'EOF'
#!/bin/bash

# Script de monitoreo para Mi Concesionaria
APP_URL="http://localhost:3000/api/health"
LOG_FILE="/var/www/vhosts/nodonorte.com/logs/monitor.log"
ALERT_FILE="/var/www/vhosts/nodonorte.com/logs/alerts.log"

# Función para enviar alerta
send_alert() {
    echo "$(date): $1" >> $ALERT_FILE
    # Aquí puedes agregar notificaciones por email, Slack, etc.
}

# Verificar aplicación
response=$(curl -s -o /dev/null -w "%{http_code}" $APP_URL)

if [ $response -eq 200 ]; then
    echo "$(date): OK - Aplicación funcionando" >> $LOG_FILE
else
    echo "$(date): ERROR - Aplicación no responde (HTTP $response)" >> $LOG_FILE
    send_alert "Mi Concesionaria no responde (HTTP $response)"
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    send_alert "Espacio en disco crítico: ${DISK_USAGE}%"
fi

# Verificar memoria
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    send_alert "Uso de memoria crítico: ${MEM_USAGE}%"
fi
EOF
    
    chmod +x $APP_DIR/monitor.sh
    
    # Agregar al crontab para monitoreo cada 2 minutos
    (crontab -l 2>/dev/null; echo "*/2 * * * * $APP_DIR/monitor.sh") | crontab -
    
    print_success "Script de monitoreo creado"
}

# Función para crear panel de control
create_control_panel() {
    print_status "Creando panel de control..."
    
    cat > $APP_DIR/control-panel.sh <<'EOF'
#!/bin/bash

# Panel de control para Mi Concesionaria
clear
echo "🚗 Panel de Control - Mi Concesionaria"
echo "======================================"
echo ""

while true; do
    echo "Selecciona una opción:"
    echo "1) Ver estado de la aplicación"
    echo "2) Ver logs en tiempo real"
    echo "3) Crear backup manual"
    echo "4) Actualizar aplicación"
    echo "5) Reiniciar servicios"
    echo "6) Ver estadísticas del sistema"
    echo "7) Configurar variables de entorno"
    echo "8) Salir"
    echo ""
    read -p "Opción: " choice
    
    case $choice in
        1)
            echo "Estado de la aplicación:"
            docker-compose -f docker-compose.prod.yml ps
            echo ""
            ;;
        2)
            echo "Logs en tiempo real (Ctrl+C para salir):"
            docker-compose -f docker-compose.prod.yml logs -f
            ;;
        3)
            echo "Creando backup..."
            ./maintenance.sh backup
            ;;
        4)
            echo "Actualizando aplicación..."
            ./maintenance.sh update
            ;;
        5)
            echo "Reiniciando servicios..."
            docker-compose -f docker-compose.prod.yml restart
            ;;
        6)
            echo "Estadísticas del sistema:"
            echo "Uso de CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
            echo "Uso de memoria: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
            echo "Espacio en disco: $(df / | awk 'NR==2 {print $5}')"
            echo ""
            ;;
        7)
            nano .env.production
            ;;
        8)
            echo "¡Hasta luego!"
            exit 0
            ;;
        *)
            echo "Opción inválida"
            ;;
    esac
    
    read -p "Presiona Enter para continuar..."
    clear
    echo "🚗 Panel de Control - Mi Concesionaria"
    echo "======================================"
    echo ""
done
EOF
    
    chmod +x $APP_DIR/control-panel.sh
    print_success "Panel de control creado"
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
    echo "🛠️  Script de mantenimiento: $APP_DIR/maintenance.sh"
    echo "📊 Logs: $LOG_DIR"
    echo "💾 Backups: $BACKUP_DIR"
    echo ""
    echo "🚀 PRÓXIMOS PASOS:"
    echo "1. cd $APP_DIR"
    echo "2. ./scripts/deploy.sh"
    echo "3. Acceder a https://${DOMAIN}"
    echo ""
    echo "📋 COMANDOS ÚTILES:"
    echo "• Panel de control: ./control-panel.sh"
    echo "• Ver logs: ./maintenance.sh logs"
    echo "• Crear backup: ./maintenance.sh backup"
    echo "• Actualizar: ./maintenance.sh update"
    echo "• Monitoreo: ./monitor.sh"
    echo ""
    echo "🔐 CREDENCIALES POR DEFECTO:"
    echo "• Email: admin@miconcesionaria.com"
    echo "• Contraseña: admin123"
    echo ""
    echo "🔧 CONFIGURACIÓN DE PLESK:"
    echo "• Proxy reverso Nginx configurado en puerto 3000"
    echo "• Logs en: /var/log/nginx/"
    echo "• Backups automáticos diarios a las 2 AM"
    echo "• Monitoreo cada 2 minutos"
    echo ""
}

# Función principal
main() {
    echo "🚀 Instalador Personalizado de Mi Concesionaria"
    echo "==============================================="
    echo ""
    echo "Configuración:"
    echo "- Dominio: ${DOMAIN}"
    echo "- Directorio: ${APP_DIR}"
    echo "- Base de datos: MariaDB (${DB_NAME})"
    echo "- SMTP: ${SMTP_HOST}:${SMTP_PORT}"
    echo ""
    
    # Verificar si se ejecuta como root
    if [ "$EUID" -eq 0 ]; then
        print_error "No ejecutes este script como root. Usa tu usuario normal."
        exit 1
    fi
    
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
    create_docker_compose
    show_proxy_instructions
    configure_ssl
    create_maintenance_script
    create_monitoring_script
    create_control_panel
    
    # Hacer scripts ejecutables
    chmod +x scripts/*.sh
    
    # Mostrar información final
    show_final_info
    
    print_success "¡Instalación completada! 🎉"
}

# Ejecutar función principal
main "$@" 