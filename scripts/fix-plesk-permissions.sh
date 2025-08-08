#!/bin/bash

echo "🔧 Corrigiendo permisos para Plesk..."

# Corregir permisos del directorio uploads
sudo chown -R nodonorte.com_1noeyciw2jrj:psaserv ./uploads
sudo chmod -R 755 ./uploads

# Corregir permisos específicos del archivo .gitkeep
if [ -f "./uploads/.gitkeep" ]; then
    sudo chown nodonorte.com_1noeyciw2jrj:psaserv ./uploads/.gitkeep
    sudo chmod 644 ./uploads/.gitkeep
fi

echo "✅ Permisos corregidos!"
ls -la uploads/ 