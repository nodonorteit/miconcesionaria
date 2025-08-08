#!/bin/bash

echo "🔧 Corrigiendo logo de empresa..."

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ] && [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.yml o docker-compose.prod.yml"
    echo "   Asegúrate de estar en el directorio del proyecto"
    exit 1
fi

# Crear directorio uploads si no existe
if [ ! -d "./uploads" ]; then
    echo "📁 Creando directorio uploads..."
    mkdir -p ./uploads
fi

# Verificar si el archivo del logo existe
LOGO_FILE="company_logo_1754448284279_parana_automotores.jpeg"
if [ -f "./uploads/$LOGO_FILE" ]; then
    echo "✅ Logo encontrado: $LOGO_FILE"
    ls -la "./uploads/$LOGO_FILE"
else
    echo "❌ Logo no encontrado: $LOGO_FILE"
    echo "🔍 Verificando archivos en uploads..."
    ls -la ./uploads/
    
    # Buscar archivos de logo similares
    echo "🔍 Buscando archivos de logo similares..."
    find ./uploads -name "*company_logo*" -o -name "*logo*" 2>/dev/null || echo "No se encontraron archivos de logo"
    
    echo ""
    echo "📋 Opciones para resolver:"
    echo "1. Subir un nuevo logo desde la aplicación"
    echo "2. Crear un logo por defecto"
    echo "3. Limpiar la configuración de la base de datos"
    
    read -p "¿Qué opción prefieres? (1/2/3): " choice
    
    case $choice in
        1)
            echo "✅ Opción seleccionada: Subir nuevo logo desde la aplicación"
            echo "   Ve a /admin/company y sube un nuevo logo"
            ;;
        2)
            echo "✅ Opción seleccionada: Crear logo por defecto"
            # Crear un logo por defecto simple
            echo "📝 Creando logo por defecto..."
            # Aquí podrías crear un logo SVG simple
            cat > "./uploads/default-logo.svg" << 'EOF'
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#3b82f6"/>
  <text x="100" y="100" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">LOGO</text>
</svg>
EOF
            echo "✅ Logo por defecto creado: ./uploads/default-logo.svg"
            ;;
        3)
            echo "✅ Opción seleccionada: Limpiar configuración de BD"
            echo "   Esto eliminará la referencia al logo en la base de datos"
            echo "   Ejecuta: docker-compose exec app npx prisma db execute --file=scripts/clean-company-config.sql"
            ;;
        *)
            echo "❌ Opción no válida"
            ;;
    esac
fi

# Verificar permisos del directorio uploads
echo ""
echo "🔐 Verificando permisos del directorio uploads..."
ls -la ./uploads/

# Verificar si el contenedor puede acceder
echo ""
echo "🐳 Verificando acceso del contenedor..."
if command -v docker-compose &> /dev/null; then
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml exec -T app test -r /app/uploads 2>/dev/null && echo "✅ Contenedor puede leer uploads" || echo "❌ Contenedor NO puede leer uploads"
    else
        docker-compose exec -T app test -r /app/uploads 2>/dev/null && echo "✅ Contenedor puede leer uploads" || echo "❌ Contenedor NO puede leer uploads"
    fi
else
    echo "⚠️ Docker Compose no disponible"
fi

echo ""
echo "🎉 Verificación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Si el logo no existe, súbelo desde /admin/company"
echo "2. Si hay problemas de permisos, ejecuta: ./scripts/fix-uploads-permissions.sh"
echo "3. Reinicia la aplicación: docker-compose restart app" 