#!/bin/bash

echo "🚀 Configurando Mi Concesionaria..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor revisa y ajusta las configuraciones."
else
    echo "✅ Archivo .env ya existe."
fi

# Create uploads directory if it doesn't exist
if [ ! -d uploads ]; then
    echo "📁 Creando directorio uploads..."
    mkdir -p uploads
    echo "✅ Directorio uploads creado."
else
    echo "✅ Directorio uploads ya existe."
fi

# Build and start containers
echo "🐳 Construyendo y ejecutando contenedores..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Esperando que la base de datos esté lista..."
sleep 10

# Run database migrations
echo "🗄️ Ejecutando migraciones de base de datos..."
docker-compose exec -T app npx prisma migrate dev --name init

# Generate Prisma client
echo "🔧 Generando cliente Prisma..."
docker-compose exec -T app npx prisma generate

# Seed database
echo "🌱 Poblando base de datos con datos iniciales..."
docker-compose exec -T app npx prisma db seed

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📱 Accede a la aplicación en: http://localhost:3000"
echo "📧 MailHog (testing de emails): http://localhost:8025"
echo ""
echo "👤 Usuario administrador:"
echo "   Email: admin@miconcesionaria.com"
echo "   Contraseña: admin123"
echo ""
echo "🔧 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Detener: docker-compose down"
echo "   - Reiniciar: docker-compose restart"
echo "" 