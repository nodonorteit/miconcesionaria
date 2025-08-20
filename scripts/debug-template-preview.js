// Script para debuggear el preview del template
// Ejecutar en el navegador para diagnosticar el problema

console.log('🔍 [Debug] Iniciando diagnóstico del preview del template...');

// 1. Verificar si la función processTemplateWithSampleData existe
if (typeof processTemplateWithSampleData === 'function') {
  console.log('✅ [Debug] Función processTemplateWithSampleData encontrada');
} else {
  console.log('❌ [Debug] Función processTemplateWithSampleData NO encontrada');
}

// 2. Verificar si hay templates en el estado
console.log('🔍 [Debug] Verificando estado de templates...');

// 3. Simular procesamiento de un template simple
const testTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Template</title>
</head>
<body>
    <h1>{{company.name}}</h1>
    <p>Cliente: {{customer.firstName}} {{customer.lastName}}</p>
    <p>Vehículo: {{vehicle.brand}} {{vehicle.model}}</p>
    <p>Precio: {{formatCurrency sale.totalAmount}}</p>
</body>
</html>
`;

console.log('🔍 [Debug] Template de prueba:', testTemplate);

// 4. Procesar el template si la función existe
if (typeof processTemplateWithSampleData === 'function') {
  try {
    const processed = processTemplateWithSampleData(testTemplate);
    console.log('✅ [Debug] Template procesado exitosamente');
    console.log('🔍 [Debug] Longitud del resultado:', processed.length);
    console.log('🔍 [Debug] Primeros 300 caracteres:', processed.substring(0, 300));
  } catch (error) {
    console.error('❌ [Debug] Error al procesar template:', error);
  }
}

// 5. Verificar datos de ejemplo
console.log('🔍 [Debug] Verificando datos de ejemplo...');
console.log('🔍 [Debug] sampleData debería estar definido en la función');

// 6. Verificar si hay errores en la consola
console.log('🔍 [Debug] Revisar si hay errores en la consola del navegador');

// 7. Verificar el DOM del preview
setTimeout(() => {
  const previewContainer = document.querySelector('[data-testid="preview-container"]') || 
                          document.querySelector('.border.rounded-md.p-4.bg-gray-50');
  
  if (previewContainer) {
    console.log('✅ [Debug] Contenedor del preview encontrado');
    console.log('🔍 [Debug] Contenido HTML:', previewContainer.innerHTML);
    console.log('🔍 [Debug] Contenido texto:', previewContainer.textContent);
  } else {
    console.log('❌ [Debug] Contenedor del preview NO encontrado');
  }
}, 1000);

console.log('🔍 [Debug] Diagnóstico completado. Revisar logs arriba.');
