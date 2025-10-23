# 🚀 Guía de Instalación para Nuevos Clientes

## 📋 Resumen del Proceso

Esta guía detalla los pasos para instalar el sistema de gestión de concesionarias en un nuevo dominio de cliente.

**Tiempo estimado**: 2-4 horas (dependiendo de la complejidad del servidor)

## 🎯 Prerrequisitos

### Del Cliente
- ✅ **Dominio configurado** (ej: `concesionaria-cliente.com`)
- ✅ **Servidor con Docker** (Ubuntu 20.04+ recomendado)
- ✅ **Acceso SSH** al servidor
- ✅ **Base de datos MySQL/MariaDB** (o permisos para crear una)
- ✅ **Certificado SSL** (Let's Encrypt recomendado)

### Del Proveedor (Tú)
- ✅ **Repositorio del código** actualizado
- ✅ **Scripts de instalación** preparados
- ✅ **Configuración de cliente** personalizada
- ✅ **Documentación de usuario** básica

## 🚀 Proceso de Instalación

### 1. **📋 Preparación Pre-Instalación**

#### 1.1 Crear Configuración del Cliente
```bash
# Crear directorio de configuración específico
mkdir -p src/config/clients/[NOMBRE_CLIENTE]
```

#### 1.2 Archivo de Configuración
```json
// src/config/clients/[NOMBRE_CLIENTE]/config.json
{
  "clientName": "Concesionaria del Cliente",
  "domain": "concesionaria-cliente.com",
  "logo": "/logo-cliente.svg",
  "primaryColor": "#1e40af",
  "secondaryColor": "#3b82f6",
  "features": {
    "auditLogs": true,
    "emailNotifications": true,
    "pdfGeneration": false,
    "advancedReports": true
  },
  "database": {
    "host": "localhost",
    "port": 3306,
    "name": "concesionaria_cliente",
    "user": "concesionaria_user",
    "password": "PASSWORD_SEGURA"
  }
}
```

#### 1.3 Variables de Entorno
```bash
# .env.production
NEXTAUTH_URL=https://concesionaria-cliente.com
NEXTAUTH_SECRET=SECRET_SUPER_SEGURO_CLIENTE
DATABASE_URL=mysql://concesionaria_user:PASSWORD_SEGURA@localhost:3306/concesionaria_cliente
NODE_ENV=production
```

### 2. **🖥️ Configuración del Servidor**

#### 2.1 Conectar al Servidor
```bash
ssh usuario@concesionaria-cliente.com
```

#### 2.2 Instalar Dependencias
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar MySQL (si no está instalado)
sudo apt install mysql-server -y
```

#### 2.3 Configurar Base de Datos
```bash
# Crear base de datos
sudo mysql -e "CREATE DATABASE concesionaria_cliente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'concesionaria_user'@'localhost' IDENTIFIED BY 'PASSWORD_SEGURA';"
sudo mysql -e "GRANT ALL PRIVILEGES ON concesionaria_cliente.* TO 'concesionaria_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 3. **📦 Despliegue de la Aplicación**

#### 3.1 Clonar Repositorio
```bash
# En el servidor
git clone https://github.com/tu-usuario/miconcesionaria.git
cd miconcesionaria
```

#### 3.2 Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp env.production.example .env.production

# Editar con datos del cliente
nano .env.production
```

#### 3.3 Construir y Desplegar
```bash
# Construir imagen Docker
docker build -t miconcesionaria-cliente .

# Crear docker-compose personalizado
cp docker-compose.prod.yml docker-compose.cliente.yml
nano docker-compose.cliente.yml

# Desplegar
docker-compose -f docker-compose.cliente.yml up -d
```

### 4. **🔧 Configuración Post-Instalación**

#### 4.1 Ejecutar Migraciones
```bash
# Ejecutar migraciones de Prisma
docker-compose -f docker-compose.cliente.yml exec app npx prisma migrate deploy

# Generar cliente Prisma
docker-compose -f docker-compose.cliente.yml exec app npx prisma generate

# Ejecutar seed inicial
docker-compose -f docker-compose.cliente.yml exec app npx prisma db seed
```

#### 4.2 Configurar SSL
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d concesionaria-cliente.com
```

#### 4.3 Configurar Nginx (si es necesario)
```nginx
# /etc/nginx/sites-available/concesionaria-cliente.com
server {
    listen 80;
    server_name concesionaria-cliente.com www.concesionaria-cliente.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name concesionaria-cliente.com www.concesionaria-cliente.com;

    ssl_certificate /etc/letsencrypt/live/concesionaria-cliente.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/concesionaria-cliente.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. **👥 Configuración de Usuarios**

#### 5.1 Crear Usuario Administrador
```bash
# Acceder al contenedor
docker-compose -f docker-compose.cliente.yml exec app bash

# Crear usuario admin
npx prisma studio
# O usar script personalizado
node scripts/create-admin-user.js
```

#### 5.2 Datos Iniciales
```bash
# Ejecutar seed con datos del cliente
npx prisma db seed --preview-feature
```

### 6. **✅ Verificación y Testing**

#### 6.1 Verificar Funcionamiento
```bash
# Verificar que la aplicación responde
curl -I https://concesionaria-cliente.com

# Verificar logs
docker-compose -f docker-compose.cliente.yml logs -f app
```

#### 6.2 Testing Básico
- ✅ Login con usuario admin
- ✅ Crear vehículo de prueba
- ✅ Crear cliente de prueba
- ✅ Realizar venta de prueba
- ✅ Verificar reportes

## 🔧 Scripts de Automatización

### Script Principal de Instalación
```bash
#!/bin/bash
# install-client.sh

CLIENT_NAME=$1
DOMAIN=$2
DB_PASSWORD=$3

if [ -z "$CLIENT_NAME" ] || [ -z "$DOMAIN" ] || [ -z "$DB_PASSWORD" ]; then
    echo "Uso: ./install-client.sh [NOMBRE_CLIENTE] [DOMINIO] [PASSWORD_DB]"
    exit 1
fi

echo "🚀 Instalando sistema para cliente: $CLIENT_NAME"
echo "🌐 Dominio: $DOMAIN"

# Crear configuración del cliente
mkdir -p src/config/clients/$CLIENT_NAME
cat > src/config/clients/$CLIENT_NAME/config.json << EOF
{
  "clientName": "$CLIENT_NAME",
  "domain": "$DOMAIN",
  "logo": "/logo-$CLIENT_NAME.svg",
  "primaryColor": "#1e40af",
  "secondaryColor": "#3b82f6"
}
EOF

# Crear variables de entorno
cat > .env.production << EOF
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$(openssl rand -base64 32)
DATABASE_URL=mysql://concesionaria_user:$DB_PASSWORD@localhost:3306/concesionaria_${CLIENT_NAME,,}
NODE_ENV=production
EOF

# Continuar con instalación...
```

## 📋 Checklist de Instalación

### Pre-Instalación
- [ ] Dominio configurado y apuntando al servidor
- [ ] Servidor con Docker instalado
- [ ] Base de datos MySQL/MariaDB disponible
- [ ] Acceso SSH al servidor
- [ ] Configuración del cliente preparada

### Instalación
- [ ] Repositorio clonado en servidor
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y configurada
- [ ] Aplicación construida y desplegada
- [ ] Migraciones ejecutadas
- [ ] SSL configurado

### Post-Instalación
- [ ] Usuario administrador creado
- [ ] Datos iniciales cargados
- [ ] Aplicación responde correctamente
- [ ] Testing básico completado
- [ ] Documentación entregada al cliente

## 🆘 Troubleshooting Común

### Error: "Database connection failed"
```bash
# Verificar conexión a BD
mysql -u concesionaria_user -p concesionaria_cliente
# Verificar variables de entorno
docker-compose -f docker-compose.cliente.yml exec app env | grep DATABASE
```

### Error: "SSL certificate issues"
```bash
# Renovar certificado
sudo certbot renew --dry-run
# Verificar configuración Nginx
sudo nginx -t
```

### Error: "Application not responding"
```bash
# Verificar contenedores
docker ps
# Verificar logs
docker-compose -f docker-compose.cliente.yml logs app
# Reiniciar aplicación
docker-compose -f docker-compose.cliente.yml restart app
```

## 📞 Soporte Post-Instalación

### Mantenimiento Básico
- **Backups**: Configurar backups automáticos de BD
- **Updates**: Proceso para actualizaciones
- **Monitoring**: Configurar monitoreo básico
- **Support**: Canal de comunicación con cliente

### Documentación para Cliente
- Manual de usuario básico
- Credenciales de acceso
- Información de contacto para soporte
- Política de respaldos y actualizaciones

---

## 💰 Consideraciones Comerciales

### Pricing Sugerido
- **Instalación inicial**: $500-1000 USD
- **Mantenimiento mensual**: $50-100 USD
- **Soporte técnico**: $100/hora
- **Actualizaciones**: $200-500 USD

### Contratos Recomendados
- Acuerdo de nivel de servicio (SLA)
- Política de respaldos
- Términos de soporte técnico
- Acuerdo de confidencialidad

---

**🎯 Tiempo total de instalación: 2-4 horas**
**💰 Valor de instalación: $500-1000 USD**
**🔄 Proceso escalable para múltiples clientes**
