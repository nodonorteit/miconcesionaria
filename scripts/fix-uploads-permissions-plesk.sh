#!/bin/bash

echo "🔧 Corrigiendo permisos de uploads para Plesk..."

# Verificar si estamos en el directorio correcto
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: No se encontró docker-compose.prod.yml"
    echo "   Asegúrate de estar en el directorio del proyecto en producción"
    exit 1
fi

# Obtener usuario y grupo de Plesk (propietario del directorio actual)
PLESK_USER=$(stat -c '%U' . 2>/dev/null || stat -f '%Su' . 2>/dev/null || echo "nodonorte.com_1noeyciw2jrj")
PLESK_GROUP=$(stat -c '%G' . 2>/dev/null || stat -f '%Sg' . 2>/dev/null || echo "psacln")

echo "🔍 Usuario/Grupo de Plesk detectado: $PLESK_USER:$PLESK_GROUP"

# Verificar estado actual del directorio uploads
echo ""
echo "📁 Estado actual del directorio uploads:"
ls -la ./uploads/

# Crear directorio uploads si no existe
if [ ! -d "./uploads" ]; then
    echo "📁 Creando directorio uploads..."
    mkdir -p ./uploads
fi

# Cambiar propietario y permisos del directorio uploads
echo ""
echo "🔐 Configurando permisos para ./uploads..."
echo "   Cambiando propietario a: $PLESK_USER:$PLESK_GROUP"

# Intentar con sudo primero
if sudo chown -R $PLESK_USER:$PLESK_GROUP ./uploads 2>/dev/null; then
    echo "✅ Propietario cambiado con sudo"
else
    echo "⚠️ No se pudo cambiar propietario con sudo"
    # Intentar sin sudo (si el usuario tiene permisos)
    if chown -R $PLESK_USER:$PLESK_GROUP ./uploads 2>/dev/null; then
        echo "✅ Propietario cambiado sin sudo"
    else
        echo "❌ No se pudo cambiar propietario"
    fi
fi

# Configurar permisos
echo "   Configurando permisos 755..."
if sudo chmod -R 755 ./uploads 2>/dev/null; then
    echo "✅ Permisos cambiados con sudo"
else
    echo "⚠️ No se pudieron cambiar permisos con sudo"
    # Intentar sin sudo
    if chmod -R 755 ./uploads 2>/dev/null; then
        echo "✅ Permisos cambiados sin sudo"
    else
        echo "❌ No se pudieron cambiar permisos"
    fi
fi

# Verificar resultado
echo ""
echo "📁 Estado final del directorio uploads:"
ls -la ./uploads/

# Verificar si el contenedor puede acceder
echo ""
echo "🐳 Verificando acceso del contenedor..."
if docker-compose -f docker-compose.prod.yml exec -T app test -r /app/uploads 2>/dev/null; then
    echo "✅ Contenedor puede leer uploads"
else
    echo "❌ Contenedor NO puede leer uploads"
    echo ""
    echo "🔧 Intentando configuración alternativa..."
    
    # Intentar con permisos más permisivos para el contenedor
    if sudo chmod -R 777 ./uploads 2>/dev/null; then
        echo "✅ Permisos 777 aplicados (temporal)"
    else
        echo "❌ No se pudieron aplicar permisos 777"
    fi
fi

# Verificar archivos específicos
echo ""
echo "🔍 Verificando archivos específicos..."
if [ -f "./uploads/.gitkeep" ]; then
    echo "📄 Archivo .gitkeep encontrado"
    ls -la "./uploads/.gitkeep"
    
    # Corregir permisos del .gitkeep si es necesario
    if sudo chown $PLESK_USER:$PLESK_GROUP "./uploads/.gitkeep" 2>/dev/null; then
        echo "✅ Permisos de .gitkeep corregidos"
    fi
fi

# Buscar archivos de logo
echo ""
echo "🔍 Buscando archivos de logo..."
find ./uploads -name "*company_logo*" -o -name "*logo*" 2>/dev/null || echo "No se encontraron archivos de logo"

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Reinicia la aplicación: docker-compose -f docker-compose.prod.yml restart app"
echo "2. Verifica logs: docker-compose -f docker-compose.prod.yml logs -f app"
echo "3. Prueba subir un logo desde /admin/company"
echo ""
echo "🔍 Si persisten problemas:"
echo "- Verifica que el usuario $PLESK_USER tenga permisos de escritura"
echo "- Revisa los logs del contenedor para errores específicos" 