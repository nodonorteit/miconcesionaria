#!/bin/bash

# Script para verificar la estructura actual de la base de datos
echo "🔍 Verificando estructura actual de la base de datos..."
echo "======================================================"

# Verificar qué tablas existen
echo "📋 Tablas existentes:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "SHOW TABLES;"

echo ""
echo "📊 Estructura de tablas principales:"

# Verificar estructura de User
echo "👤 Estructura de User:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE User;" 2>/dev/null || echo "❌ Tabla User no existe"

# Verificar estructura de Client
echo ""
echo "👥 Estructura de Client:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE Client;" 2>/dev/null || echo "❌ Tabla Client no existe"

# Verificar estructura de Vehicle
echo ""
echo "🚗 Estructura de Vehicle:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE Vehicle;" 2>/dev/null || echo "❌ Tabla Vehicle no existe"

# Verificar estructura de vehicle_types
echo ""
echo "🏷️ Estructura de vehicle_types:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE vehicle_types;" 2>/dev/null || echo "❌ Tabla vehicle_types no existe"

# Verificar estructura de sales
echo ""
echo "💰 Estructura de sales:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE sales;" 2>/dev/null || echo "❌ Tabla sales no existe"

# Verificar estructura de cashflow
echo ""
echo "💵 Estructura de cashflow:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE cashflow;" 2>/dev/null || echo "❌ Tabla cashflow no existe"

# Verificar estructura de vehicle_images
echo ""
echo "🖼️ Estructura de vehicle_images:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE vehicle_images;" 2>/dev/null || echo "❌ Tabla vehicle_images no existe"

# Verificar estructura de Seller
echo ""
echo "👨‍💼 Estructura de Seller:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE Seller;" 2>/dev/null || echo "❌ Tabla Seller no existe"

# Verificar estructura de Provider
echo ""
echo "🏢 Estructura de Provider:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE Provider;" 2>/dev/null || echo "❌ Tabla Provider no existe"

# Verificar estructura de Workshop
echo ""
echo "🔧 Estructura de Workshop:"
mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria -e "DESCRIBE Workshop;" 2>/dev/null || echo "❌ Tabla Workshop no existe"

echo ""
echo "✅ Verificación completada" 