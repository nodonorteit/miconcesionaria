#!/bin/bash

# Script para crear un usuario por defecto si no existe ninguno
# Ejecutar: ./scripts/create-default-user.sh

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

print_status "Verificando usuarios en la base de datos..."

# Verificar si existe el directorio de la aplicación
APP_DIR="/var/www/vhosts/nodonorte.com/miconcesionaria"
if [ ! -d "$APP_DIR" ]; then
    print_error "Directorio de la aplicación no encontrado: $APP_DIR"
    exit 1
fi

# Navegar al directorio de la aplicación
cd "$APP_DIR"

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado"
    exit 1
fi

# Verificar si Prisma está configurado
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Schema de Prisma no encontrado"
    exit 1
fi

# Verificar si existe el cliente de Prisma
if [ ! -d "node_modules/.prisma" ]; then
    print_warning "Cliente de Prisma no encontrado, generando..."
    npx prisma generate
fi

# Crear script temporal para verificar usuarios
cat > /tmp/check-users.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndCreateUser() {
  try {
    // Verificar si existe algún usuario
    const existingUser = await prisma.user.findFirst({
      where: { isActive: true },
      select: { id: true, email: true, name: true }
    });

    if (existingUser) {
      console.log(`✅ Usuario encontrado: ${existingUser.name} (${existingUser.email})`);
      return;
    }

    console.log('⚠️  No se encontraron usuarios, creando usuario por defecto...');

    // Crear usuario por defecto
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const defaultUser = await prisma.user.create({
      data: {
        email: 'admin@miconcesionaria.com',
        name: 'Administrador',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log(`✅ Usuario por defecto creado: ${defaultUser.name} (${defaultUser.email})`);
    console.log('🔑 Contraseña por defecto: admin123');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateUser();
EOF

# Ejecutar el script
print_status "Ejecutando verificación de usuarios..."
node /tmp/check-users.js

# Limpiar archivo temporal
rm -f /tmp/check-users.js

print_success "Verificación de usuarios completada" 