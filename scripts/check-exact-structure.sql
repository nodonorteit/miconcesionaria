-- Script para verificar las estructuras exactas de todas las tablas
-- Ejecutar: mysql -u miconcesionaria -p'!FVsxr?pmm34xm2N' miconcesionaria < check-exact-structure.sql

SELECT 'ESTRUCTURA EXACTA DE TODAS LAS TABLAS:' as info;

SELECT '=== TABLA providers ===' as info;
DESCRIBE providers;

SELECT '=== TABLA workshops ===' as info;
DESCRIBE workshops;

SELECT '=== TABLA sellers ===' as info;
DESCRIBE sellers;

SELECT '=== TABLA Client ===' as info;
DESCRIBE Client;

SELECT '=== TABLA Vehicle ===' as info;
DESCRIBE Vehicle;

SELECT '=== TABLA vehicle_types ===' as info;
DESCRIBE vehicle_types;

SELECT '=== TABLA sales ===' as info;
DESCRIBE sales;

SELECT '=== TABLA cashflow ===' as info;
DESCRIBE cashflow;

SELECT '=== TABLA vehicle_images ===' as info;
DESCRIBE vehicle_images;

SELECT '=== TABLA User ===' as info;
DESCRIBE User; 