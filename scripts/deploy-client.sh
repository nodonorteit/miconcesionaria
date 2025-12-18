#!/bin/bash

# Script de despliegue automático para nuevos clientes (multitenant)
# Uso: ./scripts/deploy-client.sh <nombre-cliente> <subdominio>
# Ejemplo: ./scripts/deploy-client.sh "Cliente Ejemplo" cliente1

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Verificar parámetros
if [ "$#" -lt 2 ]; then
    error "Uso: $0 <nombre-cliente> <subdominio> [puerto]"
    echo "Ejemplo: $0 'Cliente Ejemplo' cliente1"
    exit 1
fi

CLIENT_NAME="$1"
CLIENT_SLUG="$2"
DOMAIN="${CLIENT_SLUG}.autovista.ar"
BASE_DIR="/var/www/vhosts/autovista.ar"
CLIENT_DIR="${BASE_DIR}/${CLIENT_SLUG}"

# Si se proporciona puerto, usarlo; si no, generar uno automáticamente
if [ -n "$3" ]; then
    APP_PORT="$3"
else
    # Generar puerto basado en el hash del subdominio (3021-3999)
    PORT_HASH=$(echo -n "$CLIENT_SLUG" | md5sum | cut -c1-3 | tr '[:lower:]' '[:upper:]' | awk '{print "ibase=16;" $1}' | bc)
    APP_PORT=$((3021 + (PORT_HASH % 978)))
fi

log "🚀 Iniciando despliegue para cliente: ${CLIENT_NAME}"
log "📋 Subdominio: ${DOMAIN}"
log "🔌 Puerto: ${APP_PORT}"
log "📁 Directorio: ${CLIENT_DIR}"

# Verificar si el cliente ya existe
if [ -d "$CLIENT_DIR" ]; then
    error "El cliente ${CLIENT_SLUG} ya existe en ${CLIENT_DIR}"
fi

# Verificar si el puerto está en uso
if netstat -tuln 2>/dev/null | grep -q ":${APP_PORT} " || ss -tuln 2>/dev/null | grep -q ":${APP_PORT} "; then
    error "El puerto ${APP_PORT} ya está en uso"
fi

# Crear directorio del cliente
log "📁 Creando directorio del cliente..."
mkdir -p "$CLIENT_DIR"
cd "$CLIENT_DIR"

# Generar contraseñas seguras
DB_ROOT_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
DB_NAME="${CLIENT_SLUG}_db"
DB_USER="${CLIENT_SLUG}_user"
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Codificar contraseña para URL (reemplazar caracteres especiales)
DB_PASSWORD_ENCODED=$(echo -n "$DB_PASSWORD" | sed 's/!/%21/g; s/?/%3F/g; s/#/%23/g; s/\[/%5B/g; s/\]/%5D/g; s/@/%40/g')

log "🔐 Contraseñas generadas"

# Configuración SMTP (puedes personalizar estos valores)
SMTP_HOST="${SMTP_HOST:-smtp1.s.ipzmarketing.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:-pzbkjxwenzkr}"
SMTP_PASS="${SMTP_PASS:-7FOtsP0qKvNF}"

# Copiar template y reemplazar variables
log "📝 Generando docker-compose.yml..."
TEMPLATE_FILE="${BASE_DIR}/sistema.autovista.ar/docker-compose.client.yml.template"

if [ ! -f "$TEMPLATE_FILE" ]; then
    error "Template no encontrado: ${TEMPLATE_FILE}"
fi

# Reemplazar variables en el template usando sed
sed -e "s|\${CLIENT_SLUG}|${CLIENT_SLUG}|g" \
    -e "s|\${APP_PORT}|${APP_PORT}|g" \
    -e "s|\${DB_NAME}|${DB_NAME}|g" \
    -e "s|\${DB_USER}|${DB_USER}|g" \
    -e "s|\${DB_PASSWORD}|${DB_PASSWORD}|g" \
    -e "s|\${DB_PASSWORD_ENCODED}|${DB_PASSWORD_ENCODED}|g" \
    -e "s|\${DB_ROOT_PASSWORD}|${DB_ROOT_PASSWORD}|g" \
    -e "s|\${DOMAIN}|${DOMAIN}|g" \
    -e "s|\${NEXTAUTH_SECRET}|${NEXTAUTH_SECRET}|g" \
    -e "s|\${SMTP_HOST}|${SMTP_HOST}|g" \
    -e "s|\${SMTP_PORT}|${SMTP_PORT}|g" \
    -e "s|\${SMTP_USER}|${SMTP_USER}|g" \
    -e "s|\${SMTP_PASS}|${SMTP_PASS}|g" \
    "$TEMPLATE_FILE" > "${CLIENT_DIR}/docker-compose.yml"

# Crear archivo .env para referencia
cat > "${CLIENT_DIR}/.env" <<EOF
# Configuración del cliente: ${CLIENT_NAME}
CLIENT_NAME=${CLIENT_NAME}
CLIENT_SLUG=${CLIENT_SLUG}
DOMAIN=${DOMAIN}
APP_PORT=${APP_PORT}

# Base de datos
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}
DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD_ENCODED}@db:3306/${DB_NAME}

# NextAuth
NEXTAUTH_URL=https://${DOMAIN}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# SMTP
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EOF

log "✅ docker-compose.yml creado"

# Crear configuración de nginx
log "🌐 Creando configuración de nginx..."
NGINX_CONFIG="/etc/nginx/conf.d/${CLIENT_SLUG}.conf"

cat > "$NGINX_CONFIG" <<EOF
server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    # Certificados SSL (ajustar rutas según tu configuración)
    ssl_certificate /etc/letsencrypt/live/autovista.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/autovista.ar/privkey.pem;

    # Redirección HTTP a HTTPS
    if (\$scheme != "https") {
        return 301 https://\$host\$request_uri;
    }

    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
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

server {
    listen 80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}
EOF

log "✅ Configuración de nginx creada: ${NGINX_CONFIG}"

# Recargar nginx
log "🔄 Recargando nginx..."
if nginx -t 2>/dev/null; then
    systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || warn "No se pudo recargar nginx automáticamente"
    log "✅ Nginx recargado"
else
    warn "La configuración de nginx tiene errores. Revisa: ${NGINX_CONFIG}"
fi

# Pull de la imagen
log "📥 Descargando imagen de Docker..."
cd "$CLIENT_DIR"
docker-compose pull app db || warn "Error al descargar imágenes"

# Levantar contenedores
log "🚀 Levantando contenedores..."
docker-compose up -d

# Esperar a que la DB esté lista
log "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Ejecutar setup automáticamente
log "🔧 Ejecutando setup automático..."

# Crear tablas
log "📊 Creando tablas..."
docker-compose exec -T app npx prisma db push --accept-data-loss <<EOF || warn "Error al crear tablas"
EOF

# Ejecutar seed directamente
log "🌱 Creando datos iniciales..."
docker-compose exec -T app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@miconcesionaria.com' },
      update: { mustChangePassword: true },
      create: {
        email: 'admin@miconcesionaria.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
        mustChangePassword: true,
      },
    });
    
    await Promise.all([
      prisma.vehicleType.upsert({
        where: { name: 'Automóvil' },
        update: {},
        create: { name: 'Automóvil', description: 'Vehículos de pasajeros' },
      }),
      prisma.vehicleType.upsert({
        where: { name: 'Camioneta' },
        update: {},
        create: { name: 'Camioneta', description: 'Vehículos utilitarios' },
      }),
      prisma.vehicleType.upsert({
        where: { name: 'Camión' },
        update: {},
        create: { name: 'Camión', description: 'Vehículos de carga' },
      }),
      prisma.vehicleType.upsert({
        where: { name: 'Moto' },
        update: {},
        create: { name: 'Moto', description: 'Motocicletas' },
      }),
    ]);
    
    console.log('✅ Seed completado');
    await prisma.\$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
" || warn "Error al ejecutar seed (puedes ejecutarlo manualmente desde el navegador en /setup)"

log "✅ Despliegue completado!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Cliente desplegado exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Cliente: ${CLIENT_NAME}"
echo "🌐 URL: https://${DOMAIN}"
echo "🔌 Puerto: ${APP_PORT}"
echo "📁 Directorio: ${CLIENT_DIR}"
echo ""
echo "🔐 Credenciales de acceso:"
echo "   Email: admin@miconcesionaria.com"
echo "   Contraseña: admin123"
echo "   (Se pedirá cambiar la contraseña en el primer login)"
echo ""
echo "📝 Configuración guardada en: ${CLIENT_DIR}/.env"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

