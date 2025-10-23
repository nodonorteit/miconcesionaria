#!/bin/bash

# 🚀 Script de Despliegue Rápido en Servidor del Cliente
# Uso: ./deploy-to-server.sh [IP_SERVIDOR] [USUARIO] [CLIENT_SLUG]

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

# Verificar parámetros
if [ $# -lt 3 ]; then
    error "Uso: $0 [IP_SERVIDOR] [USUARIO] [CLIENT_SLUG]"
    echo "Ejemplo: $0 192.168.1.100 ubuntu concesionaria_abc"
    exit 1
fi

SERVER_IP="$1"
SERVER_USER="$2"
CLIENT_SLUG="$3"
SERVER_PATH="/opt/miconcesionaria-$CLIENT_SLUG"

log "🚀 Desplegando sistema en servidor: $SERVER_IP"
log "👤 Usuario: $SERVER_USER"
log "📁 Cliente: $CLIENT_SLUG"

# Verificar conexión SSH
log "🔌 Verificando conexión SSH..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    error "No se puede conectar al servidor. Verificar:"
    echo "1. IP del servidor: $SERVER_IP"
    echo "2. Usuario: $SERVER_USER"
    echo "3. Clave SSH configurada"
    echo "4. Servidor accesible desde esta máquina"
fi

# Crear directorio en servidor
log "📁 Creando directorio en servidor..."
ssh $SERVER_USER@$SERVER_IP "sudo mkdir -p $SERVER_PATH && sudo chown $SERVER_USER:$SERVER_USER $SERVER_PATH"

# Copiar archivos necesarios
log "📦 Copiando archivos al servidor..."

# Archivos esenciales
scp -r src/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp -r prisma/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp -r scripts/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp -r docs/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp package.json package-lock.json $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp Dockerfile docker-compose.client.yml $SERVER_USER@$SERVER_IP:$SERVER_PATH/
scp .env.production $SERVER_USER@$SERVER_IP:$SERVER_PATH/.env

# Instalar Docker en servidor si no está
log "🐳 Verificando Docker en servidor..."
ssh $SERVER_USER@$SERVER_IP "
if ! command -v docker &> /dev/null; then
    echo 'Instalando Docker...'
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $SERVER_USER
    echo 'Docker instalado. Reiniciar sesión SSH para aplicar cambios.'
fi
"

# Instalar Docker Compose si no está
ssh $SERVER_USER@$SERVER_IP "
if ! command -v docker-compose &> /dev/null; then
    echo 'Instalando Docker Compose...'
    sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi
"

# Construir y desplegar aplicación
log "🔨 Construyendo y desplegando aplicación..."
ssh $SERVER_USER@$SERVER_IP "
cd $SERVER_PATH
docker-compose -f docker-compose.client.yml down || true
docker-compose -f docker-compose.client.yml build
docker-compose -f docker-compose.client.yml up -d
"

# Esperar a que la aplicación esté lista
log "⏳ Esperando a que la aplicación esté lista..."
sleep 30

# Ejecutar migraciones
log "📊 Ejecutando migraciones..."
ssh $SERVER_USER@$SERVER_IP "
cd $SERVER_PATH
docker-compose -f docker-compose.client.yml exec -T app npx prisma migrate deploy
docker-compose -f docker-compose.client.yml exec -T app npx prisma generate
"

# Ejecutar seed
log "🌱 Ejecutando datos iniciales..."
ssh $SERVER_USER@$SERVER_IP "
cd $SERVER_PATH
docker-compose -f docker-compose.client.yml exec -T app node scripts/seed-client.js
"

# Verificar instalación
log "✅ Verificando instalación..."
ssh $SERVER_USER@$SERVER_IP "
cd $SERVER_PATH
./scripts/verify-installation.sh
"

# Configurar SSL con Let's Encrypt
log "🔒 Configurando SSL..."
ssh $SERVER_USER@$SERVER_IP "
if ! command -v certbot &> /dev/null; then
    echo 'Instalando Certbot...'
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi
"

# Crear script de configuración SSL
ssh $SERVER_USER@$SERVER_IP "
cat > $SERVER_PATH/configure-ssl.sh << 'EOF'
#!/bin/bash
DOMAIN=\$1
if [ -z \"\$DOMAIN\" ]; then
    echo 'Uso: ./configure-ssl.sh [DOMINIO]'
    exit 1
fi

echo \"Configurando SSL para \$DOMAIN...\"

# Crear configuración Nginx básica
sudo tee /etc/nginx/sites-available/\$DOMAIN > /dev/null << 'NGINX'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER www.DOMAIN_PLACEHOLDER;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX

# Reemplazar placeholder con dominio real
sudo sed -i \"s/DOMAIN_PLACEHOLDER/\$DOMAIN/g\" /etc/nginx/sites-available/\$DOMAIN

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/\$DOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Obtener certificado SSL
sudo certbot --nginx -d \$DOMAIN -d www.\$DOMAIN --non-interactive --agree-tos --email admin@\$DOMAIN

echo \"SSL configurado para \$DOMAIN\"
EOF

chmod +x $SERVER_PATH/configure-ssl.sh
"

# Crear script de mantenimiento
ssh $SERVER_USER@$SERVER_IP "
cat > $SERVER_PATH/maintenance.sh << 'EOF'
#!/bin/bash

case \"\$1\" in
    start)
        echo \"Iniciando servicios...\"
        docker-compose -f docker-compose.client.yml up -d
        ;;
    stop)
        echo \"Deteniendo servicios...\"
        docker-compose -f docker-compose.client.yml down
        ;;
    restart)
        echo \"Reiniciando servicios...\"
        docker-compose -f docker-compose.client.yml restart
        ;;
    logs)
        docker-compose -f docker-compose.client.yml logs -f
        ;;
    update)
        echo \"Actualizando sistema...\"
        git pull origin master
        docker-compose -f docker-compose.client.yml build
        docker-compose -f docker-compose.client.yml exec app npx prisma migrate deploy
        docker-compose -f docker-compose.client.yml restart
        ;;
    backup)
        echo \"Creando backup...\"
        ./scripts/backup-client.sh
        ;;
    status)
        echo \"Estado de servicios:\"
        docker-compose -f docker-compose.client.yml ps
        ;;
    *)
        echo \"Uso: \$0 {start|stop|restart|logs|update|backup|status}\"
        exit 1
        ;;
esac
EOF

chmod +x $SERVER_PATH/maintenance.sh
"

# Crear crontab para backups automáticos
ssh $SERVER_USER@$SERVER_IP "
(crontab -l 2>/dev/null; echo \"0 2 * * * cd $SERVER_PATH && ./scripts/backup-client.sh\") | crontab -
"

# Mostrar información final
log "🎉 Despliegue completado exitosamente!"
log ""
log "📋 Información del despliegue:"
log "   Servidor: $SERVER_IP"
log "   Directorio: $SERVER_PATH"
log "   Cliente: $CLIENT_SLUG"
log ""
log "🔧 Comandos útiles en el servidor:"
log "   cd $SERVER_PATH"
log "   ./maintenance.sh status    # Ver estado"
log "   ./maintenance.sh logs      # Ver logs"
log "   ./maintenance.sh restart   # Reiniciar"
log "   ./configure-ssl.sh [DOMINIO] # Configurar SSL"
log ""
log "📞 Próximos pasos:"
log "1. Configurar DNS del dominio para apuntar a $SERVER_IP"
log "2. Ejecutar: ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && ./configure-ssl.sh [DOMINIO]'"
log "3. Verificar que la aplicación responde en https://[DOMINIO]"
log "4. Entregar credenciales al cliente"
log ""
log "💰 Instalación completada - Listo para facturar!"
