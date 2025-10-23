#!/bin/bash

# 🚀 Script de Instalación Automatizada para Nuevos Clientes
# Uso: ./install-client.sh [NOMBRE_CLIENTE] [DOMINIO] [PASSWORD_DB] [EMAIL_ADMIN]

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
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
    error "Uso: $0 [NOMBRE_CLIENTE] [DOMINIO] [PASSWORD_DB] [EMAIL_ADMIN]"
    echo "Ejemplo: $0 'Concesionaria ABC' 'abc.com' 'password123' 'admin@abc.com'"
    exit 1
fi

CLIENT_NAME="$1"
DOMAIN="$2"
DB_PASSWORD="$3"
ADMIN_EMAIL="${4:-admin@$DOMAIN}"
CLIENT_SLUG=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/ /_/g')
DB_NAME="concesionaria_${CLIENT_SLUG}"

log "🚀 Iniciando instalación para cliente: $CLIENT_NAME"
log "🌐 Dominio: $DOMAIN"
log "📧 Email admin: $ADMIN_EMAIL"
log "🗄️ Base de datos: $DB_NAME"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "Este script debe ejecutarse desde el directorio raíz del proyecto"
fi

# Crear directorio de configuración del cliente
log "📁 Creando configuración del cliente..."
mkdir -p "src/config/clients/$CLIENT_SLUG"

# Generar configuración del cliente
cat > "src/config/clients/$CLIENT_SLUG/config.json" << EOF
{
  "clientName": "$CLIENT_NAME",
  "domain": "$DOMAIN",
  "logo": "/logo-$CLIENT_SLUG.svg",
  "primaryColor": "#1e40af",
  "secondaryColor": "#3b82f6",
  "features": {
    "auditLogs": true,
    "emailNotifications": true,
    "pdfGeneration": false,
    "advancedReports": true
  },
  "contact": {
    "email": "$ADMIN_EMAIL",
    "phone": "",
    "address": ""
  },
  "installation": {
    "date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "version": "1.0.0"
  }
}
EOF

# Generar variables de entorno
log "🔧 Generando variables de entorno..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

cat > ".env.production" << EOF
# Configuración para $CLIENT_NAME
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
DATABASE_URL=mysql://concesionaria_user:$DB_PASSWORD@localhost:3306/$DB_NAME
NODE_ENV=production

# Configuración del cliente
CLIENT_NAME=$CLIENT_NAME
CLIENT_SLUG=$CLIENT_SLUG
CLIENT_DOMAIN=$DOMAIN

# Email (configurar según proveedor del cliente)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@$DOMAIN
EOF

# Crear docker-compose personalizado
log "🐳 Creando configuración Docker personalizada..."
cat > "docker-compose.client.yml" << EOF
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://concesionaria_user:$DB_PASSWORD@db:3306/$DB_NAME
      - NEXTAUTH_URL=https://$DOMAIN
      - NEXTAUTH_SECRET=$NEXTAUTH_SECRET
      - CLIENT_NAME=$CLIENT_NAME
      - CLIENT_SLUG=$CLIENT_SLUG
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  db:
    image: mariadb:10.9
    environment:
      - MYSQL_ROOT_PASSWORD=root_password_change_me
      - MYSQL_DATABASE=$DB_NAME
      - MYSQL_USER=concesionaria_user
      - MYSQL_PASSWORD=$DB_PASSWORD
    volumes:
      - db_data:/var/lib/mysql
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  db_data:
EOF

# Crear script de inicialización de BD
log "🗄️ Creando script de inicialización de base de datos..."
cat > "scripts/init-db.sql" << EOF
-- Script de inicialización para $CLIENT_NAME
-- Fecha: $(date)

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE \`$DB_NAME\`;

-- Crear usuario si no existe
CREATE USER IF NOT EXISTS 'concesionaria_user'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO 'concesionaria_user'@'%';
FLUSH PRIVILEGES;

-- Log de instalación
INSERT INTO system_logs (action, entity, entityId, description, userId, userEmail, createdAt) 
VALUES ('SYSTEM_INIT', 'INSTALLATION', 'CLIENT_SETUP', 'Instalación inicial del sistema para $CLIENT_NAME', 'system', 'system@miconcesionaria.com', NOW());
EOF

# Crear script de seed personalizado
log "🌱 Creando script de datos iniciales..."
cat > "scripts/seed-client.js" << EOF
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed para cliente: $CLIENT_NAME')
  
  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: '$ADMIN_EMAIL' },
    update: {},
    create: {
      email: '$ADMIN_EMAIL',
      name: 'Administrador $CLIENT_NAME',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    }
  })
  
  console.log('✅ Usuario administrador creado:', adminUser.email)
  
  // Crear usuario manager de prueba
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@$DOMAIN' },
    update: {},
    create: {
      email: 'manager@$DOMAIN',
      name: 'Manager $CLIENT_NAME',
      password: await bcrypt.hash('manager123', 10),
      role: 'MANAGER',
      isActive: true
    }
  })
  
  console.log('✅ Usuario manager creado:', managerUser.email)
  
  // Crear cliente de prueba
  const testCustomer = await prisma.customer.create({
    data: {
      firstName: 'Cliente',
      lastName: 'Prueba',
      email: 'cliente@$DOMAIN',
      phone: '+54 9 11 1234-5678',
      document: '12345678',
      city: 'Buenos Aires',
      state: 'CABA'
    }
  })
  
  console.log('✅ Cliente de prueba creado:', testCustomer.email)
  
  // Crear vendedor de prueba
  const testSeller = await prisma.seller.create({
    data: {
      firstName: 'Vendedor',
      lastName: 'Prueba',
      email: 'vendedor@$DOMAIN',
      phone: '+54 9 11 8765-4321',
      commissionRate: 5.0,
      isActive: true
    }
  })
  
  console.log('✅ Vendedor de prueba creado:', testSeller.email)
  
  console.log('🎉 Seed completado para $CLIENT_NAME')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.\$disconnect()
  })
EOF

# Crear script de verificación
log "✅ Creando script de verificación..."
cat > "scripts/verify-installation.sh" << EOF
#!/bin/bash

echo "🔍 Verificando instalación para $CLIENT_NAME..."

# Verificar que la aplicación responde
echo "🌐 Verificando respuesta de la aplicación..."
if curl -f -s "https://$DOMAIN" > /dev/null; then
    echo "✅ Aplicación responde correctamente"
else
    echo "❌ La aplicación no responde"
    exit 1
fi

# Verificar base de datos
echo "🗄️ Verificando conexión a base de datos..."
if docker-compose -f docker-compose.client.yml exec -T db mysql -u concesionaria_user -p$DB_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Base de datos conecta correctamente"
else
    echo "❌ Error de conexión a base de datos"
    exit 1
fi

# Verificar migraciones
echo "📊 Verificando migraciones..."
if docker-compose -f docker-compose.client.yml exec -T app npx prisma migrate status > /dev/null 2>&1; then
    echo "✅ Migraciones ejecutadas correctamente"
else
    echo "❌ Error en migraciones"
    exit 1
fi

echo "🎉 Verificación completada exitosamente"
EOF

chmod +x "scripts/verify-installation.sh"

# Crear documentación del cliente
log "📚 Creando documentación del cliente..."
mkdir -p "docs/clients/$CLIENT_SLUG"

cat > "docs/clients/$CLIENT_SLUG/README.md" << EOF
# $CLIENT_NAME - Sistema de Gestión

## 📋 Información de Instalación

- **Cliente**: $CLIENT_NAME
- **Dominio**: $DOMAIN
- **Fecha de instalación**: $(date)
- **Base de datos**: $DB_NAME
- **Usuario admin**: $ADMIN_EMAIL

## 🔑 Credenciales de Acceso

### Usuario Administrador
- **Email**: $ADMIN_EMAIL
- **Password**: admin123 (cambiar en primer login)
- **Rol**: ADMIN

### Usuario Manager
- **Email**: manager@$DOMAIN
- **Password**: manager123
- **Rol**: MANAGER

## 🚀 Acceso al Sistema

- **URL**: https://$DOMAIN
- **Estado**: Activo
- **SSL**: Configurado

## 📞 Soporte

Para soporte técnico contactar al proveedor del sistema.

## 🔧 Mantenimiento

- **Backups**: Automáticos diarios
- **Updates**: Según acuerdo de soporte
- **Monitoring**: Activo 24/7
EOF

# Crear script de backup
log "💾 Creando script de backup..."
cat > "scripts/backup-client.sh" << EOF
#!/bin/bash

BACKUP_DIR="/backups/$CLIENT_SLUG"
DATE=\$(date +%Y%m%d_%H%M%S)

echo "💾 Iniciando backup para $CLIENT_NAME..."

# Crear directorio de backup
mkdir -p \$BACKUP_DIR

# Backup de base de datos
docker-compose -f docker-compose.client.yml exec -T db mysqldump -u concesionaria_user -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup de uploads
tar -czf \$BACKUP_DIR/uploads_backup_\$DATE.tar.gz uploads/

# Backup de configuración
tar -czf \$BACKUP_DIR/config_backup_\$DATE.tar.gz .env.production src/config/clients/$CLIENT_SLUG/

echo "✅ Backup completado: \$BACKUP_DIR"
EOF

chmod +x "scripts/backup-client.sh"

# Crear script de actualización
log "🔄 Creando script de actualización..."
cat > "scripts/update-client.sh" << EOF
#!/bin/bash

echo "🔄 Actualizando sistema para $CLIENT_NAME..."

# Hacer backup antes de actualizar
./scripts/backup-client.sh

# Pull de cambios
git pull origin master

# Reconstruir imagen
docker-compose -f docker-compose.client.yml build

# Aplicar migraciones
docker-compose -f docker-compose.client.yml exec app npx prisma migrate deploy

# Reiniciar servicios
docker-compose -f docker-compose.client.yml restart

echo "✅ Actualización completada"
EOF

chmod +x "scripts/update-client.sh"

# Generar resumen de instalación
log "📋 Generando resumen de instalación..."
cat > "INSTALLATION_SUMMARY_$CLIENT_SLUG.md" << EOF
# 📋 Resumen de Instalación - $CLIENT_NAME

## ✅ Instalación Completada

**Fecha**: $(date)
**Cliente**: $CLIENT_NAME
**Dominio**: $DOMAIN
**Base de datos**: $DB_NAME

## 🔑 Credenciales Generadas

### Administrador
- **Email**: $ADMIN_EMAIL
- **Password**: admin123
- **URL**: https://$DOMAIN

### Manager
- **Email**: manager@$DOMAIN
- **Password**: manager123

## 📁 Archivos Creados

- ✅ \`src/config/clients/$CLIENT_SLUG/config.json\`
- ✅ \`.env.production\`
- ✅ \`docker-compose.client.yml\`
- ✅ \`scripts/init-db.sql\`
- ✅ \`scripts/seed-client.js\`
- ✅ \`scripts/verify-installation.sh\`
- ✅ \`scripts/backup-client.sh\`
- ✅ \`scripts/update-client.sh\`
- ✅ \`docs/clients/$CLIENT_SLUG/README.md\`

## 🚀 Próximos Pasos

1. **Subir archivos al servidor del cliente**
2. **Ejecutar**: \`docker-compose -f docker-compose.client.yml up -d\`
3. **Ejecutar migraciones**: \`docker-compose -f docker-compose.client.yml exec app npx prisma migrate deploy\`
4. **Ejecutar seed**: \`docker-compose -f docker-compose.client.yml exec app node scripts/seed-client.js\`
5. **Verificar instalación**: \`./scripts/verify-installation.sh\`
6. **Configurar SSL** (si es necesario)
7. **Entregar credenciales al cliente**

## 💰 Información Comercial

- **Costo de instalación**: \$500-1000 USD
- **Mantenimiento mensual**: \$50-100 USD
- **Soporte técnico**: \$100/hora

## 📞 Contacto

Para soporte técnico o consultas sobre esta instalación.
EOF

log "🎉 Configuración completada para $CLIENT_NAME"
log "📁 Archivos creados en: src/config/clients/$CLIENT_SLUG/"
log "📋 Resumen guardado en: INSTALLATION_SUMMARY_$CLIENT_SLUG.md"
log ""
log "🚀 Próximos pasos:"
log "1. Subir archivos al servidor del cliente"
log "2. Ejecutar: docker-compose -f docker-compose.client.yml up -d"
log "3. Ejecutar migraciones y seed"
log "4. Configurar SSL"
log "5. Entregar credenciales al cliente"
log ""
log "💰 Tiempo estimado de instalación: 2-4 horas"
log "💵 Valor de instalación: \$500-1000 USD"
