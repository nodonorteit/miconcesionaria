-- Script para arreglar el template por defecto del boleto
-- Ejecutar en la base de datos para forzar que el template del boleto sea por defecto

-- 1. Primero, desactivar todos los templates del tipo BOLETO_COMPRA_VENTA
UPDATE document_templates 
SET isDefault = 0 
WHERE type = 'BOLETO_COMPRA_VENTA';

-- 2. Activar el template "Boleto Estándar" como por defecto
UPDATE document_templates 
SET isDefault = 1, isActive = 1 
WHERE name = 'Boleto Estándar' AND type = 'BOLETO_COMPRA_VENTA';

-- 3. Verificar que se aplicó correctamente
SELECT
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length
FROM document_templates
WHERE type = 'BOLETO_COMPRA_VENTA';

-- 4. Si no existe el template, crearlo
INSERT IGNORE INTO document_templates (
    name, 
    type, 
    content, 
    variables, 
    isActive, 
    isDefault
) VALUES (
    'Boleto Estándar',
    'BOLETO_COMPRA_VENTA',
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Boleto de Compra-Venta</title><style>body { font-family: Arial, sans-serif; margin: 20px; } .header { text-align: center; margin-bottom: 30px; } .company-logo { max-width: 200px; height: auto; } .company-name { font-size: 24px; font-weight: bold; margin: 10px 0; } .document-title { font-size: 20px; font-weight: bold; margin: 20px 0; } .section { margin: 20px 0; } .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; } .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .field { margin: 10px 0; } .field-label { font-weight: bold; color: #666; } .field-value { margin-top: 5px; } .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; } .signature-box { text-align: center; border-top: 2px solid #000; padding-top: 10px; } .signature-line { height: 60px; border-bottom: 1px solid #000; margin: 20px 0; } @media print { body { margin: 0; } .no-print { display: none; } }</style></head><body><div class="header"><div class="company-name">{{companyName}}</div><div>{{companyAddress}}</div><div>{{companyCity}} - {{companyState}}</div><div>CUIT: {{companyCuit}}</div></div><div class="document-title">BOLETO DE COMPRA-VENTA N° {{documentNumber}}</div><div style="text-align: right; margin-bottom: 20px;">Fecha: {{saleDate}}</div><div class="section"><div class="section-title">INFORMACIÓN DE LAS PARTES</div><div class="grid"><div><div class="field"><div class="field-label">COMPRADOR:</div><div class="field-value">{{compradorName}}</div><div class="field-value">{{compradorAddress}}</div><div class="field-value">{{compradorCity}} - {{compradorState}}</div><div class="field-value">Doc: {{compradorDocument}}</div></div></div><div><div class="field"><div class="field-label">VENDEDOR:</div><div class="field-value">{{vendedorName}}</div><div class="field-value">{{vendedorAddress}}</div><div class="field-value">{{vendedorCity}} {{vendedorState}}</div><div class="field-value">Doc: {{vendedorDocument}}</div></div></div></div></div><div class="section"><div class="section-title">INFORMACIÓN DEL VEHÍCULO</div><div class="grid"><div class="field"><div class="field-label">Marca:</div><div class="field-value">{{vehicleBrand}}</div></div><div class="field"><div class="field-label">Modelo:</div><div class="field-value">{{vehicleModel}}</div></div><div class="field"><div class="field-label">Año:</div><div class="field-value">{{vehicleYear}}</div></div><div class="field"><div class="field-label">Color:</div><div class="field-value">{{vehicleColor}}</div></div><div class="field"><div class="field-label">VIN:</div><div class="field-value">{{vehicleVin}}</div></div><div class="field"><div class="field-label">Patente:</div><div class="field-value">{{vehicleLicensePlate}}</div></div><div class="field"><div class="field-label">Tipo:</div><div class="field-value">{{vehicleType}}</div></div><div class="field"><div class="field-label">Kilometraje:</div><div class="field-value">{{vehicleMileage}} km</div></div></div></div><div class="section"><div class="section-title">CONDICIONES DE LA VENTA</div><div class="grid"><div><div class="field"><div class="field-label">Precio Total:</div><div class="field-value" style="font-size: 24px; font-weight: bold; color: #059669;">{{saleTotalAmount}}</div></div></div><div><div class="field"><div class="field-label">Forma de Pago:</div><div class="field-value">{{salePaymentMethod}}</div></div><div class="field"><div class="field-label">Fecha de Entrega:</div><div class="field-value">{{saleDate}}</div></div></div></div></div><div class="section"><div class="section-title">CONDICIONES Y RESPONSABILIDADES</div><div style="font-size: 14px; line-height: 1.5;"><p><strong>Responsabilidades del Vendedor:</strong> El vendedor se responsabiliza por lo vendido, declarando que no tiene embargos, prendas agrarias (Ley 12.962), ni impedimentos para la venta.</p><p><strong>Condiciones de Entrega:</strong> La unidad se entrega en el estado en que se encuentra, y el comprador declara conocer sus características.</p><p><strong>Transferencia:</strong> El comprador se compromete a realizar la transferencia de dominio del vehículo dentro de los diez días de la fecha, según la Ley 22.977.</p><p><strong>Gastos:</strong> Todos los gastos de transferencia, trámites y gestiones son a cargo exclusivo del comprador.</p></div></div><div class="signatures"><div class="signature-box"><div style="font-weight: bold;">COMPRADOR</div><div>{{compradorName}}</div><div class="signature-line"></div><div style="font-size: 12px; color: #666;">Firma</div></div><div class="signature-box"><div style="font-weight: bold;">VENDEDOR</div><div>{{vendedorName}}</div><div class="signature-line"></div><div style="font-size: 12px; color: #666;">Firma</div></div></div><div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; font-size: 14px;"><p><strong>Observaciones:</strong> {{saleNotes}}</p><p>Documento generado el {{documentGeneratedAt}}</p></div></body></html>',
    '{"company": ["name", "address", "city", "state", "cuit"], "customer": ["firstName", "lastName", "address", "city", "state", "documentNumber"], "vehicle": ["brand", "model", "year", "color", "vin", "licensePlate", "type", "mileage"], "sale": ["totalAmount", "paymentMethod", "date", "notes"], "document": ["number", "generatedAt"]}',
    1,
    1
);

-- 5. Verificar el estado final
SELECT
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length
FROM document_templates
WHERE type = 'BOLETO_COMPRA_VENTA';
