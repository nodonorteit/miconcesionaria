-- Script para verificar usuarios existentes
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < check-users.sql

SELECT 'USUARIOS EXISTENTES:' as info;
SELECT id, email, name, role FROM User;

SELECT 'ESTRUCTURA DE LA TABLA USER:' as info;
DESCRIBE User; 