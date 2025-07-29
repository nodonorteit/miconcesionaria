#!/bin/bash

# Script de configuración de Plesk para Mi Concesionaria
# Uso: ./scripts/configure-plesk.sh

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

# Función para verificar si Plesk está instalado
check_plesk() {
    if [ ! -f "/usr/local/psa/version" ] && [ ! -f "/opt/psa/version" ]; then
        print_error "Plesk no parece estar instalado en este sistema"
        exit 1
    fi
    print_success "Plesk detectado"
}

# Función para crear dominio en Plesk
create_domain() {
    print_status "Configurando dominio en Plesk..."
    
    read -p "Ingresa el nombre del dominio (ej: miconcesionaria.tudominio.com): " DOMAIN_NAME
    
    if [ -z "$DOMAIN_NAME" ]; then
        print_error "Debes ingresar un nombre de dominio"
        exit 1
    fi
    
    # Crear directorio del dominio
    DOMAIN_DIR="/var/www/vhosts/$DOMAIN_NAME"
    sudo mkdir -p $DOMAIN_DIR
    
    print_success "Dominio configurado: $DOMAIN_NAME"
}

# Función para configurar proxy reverso
configure_proxy() {
    print_status "Configurando proxy reverso..."
    
    # Crear archivo de configuración de Apache
    cat > /tmp/miconcesionaria-proxy.conf <<EOF
<VirtualHost *:80>
    ServerName $DOMAIN_NAME
    ServerAdmin webmaster@$DOMAIN_NAME
    
    # Proxy reverso hacia la aplicación Docker
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Headers adicionales
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
    
    # Logs
    ErrorLog \${APACHE_LOG_DIR}/$DOMAIN_NAME-error.log
    CustomLog \${APACHE_LOG_DIR}/$DOMAIN_NAME-access.log combined
    
    # Configuración de seguridad
    <Location />
        ProxyPass http://localhost:3000/
        ProxyPassReverse http://localhost:3000/
    </Location>
</VirtualHost>
EOF
    
    # Mover archivo a la configuración de Plesk
    sudo mv /tmp/miconcesionaria-proxy.conf /etc/apache2/sites-available/$DOMAIN_NAME.conf
    
    # Habilitar sitio
    sudo a2ensite $DOMAIN_NAME
    
    # Habilitar módulos necesarios
    sudo a2enmod proxy
    sudo a2enmod proxy_http
    sudo a2enmod headers
    
    # Reiniciar Apache
    sudo systemctl reload apache2
    
    print_success "Proxy reverso configurado"
}

# Función para configurar SSL
configure_ssl() {
    print_status "Configurando SSL..."
    
    read -p "¿Quieres configurar SSL con Let's Encrypt? (y/n): " SSL_CHOICE
    
    if [[ $SSL_CHOICE =~ ^[Yy]$ ]]; then
        # Verificar si certbot está instalado
        if ! command -v certbot &> /dev/null; then
            print_status "Instalando certbot..."
            sudo apt-get update
            sudo apt-get install -y certbot python3-certbot-apache
        fi
        
        # Obtener certificado SSL
        sudo certbot --apache -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
        
        # Configurar renovación automática
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_success "SSL configurado con Let's Encrypt"
    else
        print_warning "SSL no configurado. Puedes configurarlo manualmente en Plesk"
    fi
}

# Función para configurar backups automáticos
configure_backups() {
    print_status "Configurando backups automáticos..."
    
    # Crear script de backup automático
    cat > /var/www/miconcesionaria/auto-backup.sh <<'EOF'
#!/bin/bash

# Script de backup automático para Mi Concesionaria
BACKUP_DIR="/var/backups/miconcesionaria"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Backup de la base de datos
cd /var/www/miconcesionaria
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres miconcesionaria > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads/

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup automático completado: $DATE" >> /var/log/miconcesionaria/backup.log
EOF
    
    chmod +x /var/www/miconcesionaria/auto-backup.sh
    
    # Agregar al crontab para backup diario a las 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * /var/www/miconcesionaria/auto-backup.sh") | crontab -
    
    print_success "Backups automáticos configurados (diario a las 2 AM)"
}

# Función para configurar monitoreo avanzado
configure_monitoring() {
    print_status "Configurando monitoreo avanzado..."
    
    # Crear script de monitoreo con notificaciones
    cat > /var/www/miconcesionaria/monitor.sh <<'EOF'
#!/bin/bash

# Script de monitoreo avanzado para Mi Concesionaria
APP_URL="http://localhost:3000/api/health"
LOG_FILE="/var/log/miconcesionaria/monitor.log"
ALERT_FILE="/var/log/miconcesionaria/alerts.log"

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
    
    chmod +x /var/www/miconcesionaria/monitor.sh
    
    # Agregar al crontab para monitoreo cada 2 minutos
    (crontab -l 2>/dev/null; echo "*/2 * * * * /var/www/miconcesionaria/monitor.sh") | crontab -
    
    print_success "Monitoreo avanzado configurado"
}

# Función para crear panel de control
create_control_panel() {
    print_status "Creando panel de control..."
    
    cat > /var/www/miconcesionaria/control-panel.sh <<'EOF'
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
    
    chmod +x /var/www/miconcesionaria/control-panel.sh
    
    print_success "Panel de control creado: ./control-panel.sh"
}

# Función para mostrar información final
show_final_info() {
    echo ""
    echo "=========================================="
    echo "🎉 CONFIGURACIÓN DE PLESK COMPLETADA"
    echo "=========================================="
    echo ""
    echo "🌐 Tu aplicación estará disponible en:"
    echo "   http://$DOMAIN_NAME"
    echo ""
    echo "📋 COMANDOS ÚTILES:"
    echo "• Panel de control: ./control-panel.sh"
    echo "• Ver logs: ./maintenance.sh logs"
    echo "• Crear backup: ./maintenance.sh backup"
    echo "• Actualizar: ./maintenance.sh update"
    echo "• Monitoreo: ./monitor.sh"
    echo ""
    echo "🔧 CONFIGURACIÓN DE PLESK:"
    echo "• Proxy reverso configurado en puerto 3000"
    echo "• Logs en: /var/log/apache2/$DOMAIN_NAME-*.log"
    echo "• Backups automáticos diarios a las 2 AM"
    echo "• Monitoreo cada 2 minutos"
    echo ""
    echo "📊 MONITOREO:"
    echo "• Logs de aplicación: /var/log/miconcesionaria/"
    echo "• Alertas: /var/log/miconcesionaria/alerts.log"
    echo "• Backups: /var/backups/miconcesionaria/"
    echo ""
}

# Función principal
main() {
    echo "🔧 Configurador de Plesk para Mi Concesionaria"
    echo "=============================================="
    echo ""
    
    # Verificar Plesk
    check_plesk
    
    # Cambiar al directorio de la aplicación
    cd /var/www/miconcesionaria
    
    # Configurar dominio
    create_domain
    
    # Configurar proxy reverso
    configure_proxy
    
    # Configurar SSL
    configure_ssl
    
    # Configurar backups
    configure_backups
    
    # Configurar monitoreo
    configure_monitoring
    
    # Crear panel de control
    create_control_panel
    
    # Mostrar información final
    show_final_info
    
    print_success "¡Configuración de Plesk completada! 🎉"
}

# Ejecutar función principal
main "$@" 