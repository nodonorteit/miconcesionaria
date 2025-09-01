-- Script para arreglar fechas inválidas en document_templates
-- Error: "Value out of range for the type. The column `updatedAt` contained an invalid datetime value"

-- 1. Verificar la estructura de la tabla
DESCRIBE document_templates;

-- 2. Verificar registros con fechas inválidas
SELECT 
    id,
    name,
    type,
    isActive,
    isDefault,
    createdAt,
    updatedAt,
    CASE 
        WHEN YEAR(createdAt) = 0 OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 THEN 'INVALID_CREATED'
        WHEN YEAR(updatedAt) = 0 OR MONTH(updatedAt) = 0 OR DAY(updatedAt) = 0 THEN 'INVALID_UPDATED'
        ELSE 'VALID'
    END as date_status
FROM document_templates
WHERE 
    YEAR(createdAt) = 0 OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 OR
    YEAR(updatedAt) = 0 OR MONTH(updatedAt) = 0 OR DAY(updatedAt) = 0;

-- 3. Verificar todos los registros para contexto
SELECT 
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length,
    SUBSTRING(content, 1, 100) as content_preview,
    createdAt,
    updatedAt
FROM document_templates
ORDER BY createdAt DESC;

-- 4. Arreglar fechas inválidas
UPDATE document_templates 
SET 
    createdAt = NOW(),
    updatedAt = NOW()
WHERE 
    YEAR(createdAt) = 0 OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 OR
    YEAR(updatedAt) = 0 OR MONTH(updatedAt) = 0 OR DAY(updatedAt) = 0;

-- 5. Verificar que se arreglaron
SELECT 
    id,
    name,
    type,
    isActive,
    isDefault,
    createdAt,
    updatedAt,
    CASE 
        WHEN YEAR(createdAt) = 0 OR MONTH(createdAt) = 0 OR DAY(createdAt) = 0 THEN 'INVALID_CREATED'
        WHEN YEAR(updatedAt) = 0 OR MONTH(updatedAt) = 0 OR DAY(updatedAt) = 0 THEN 'INVALID_UPDATED'
        ELSE 'VALID'
    END as date_status
FROM document_templates;

-- 6. Si no hay templates, crear uno por defecto
INSERT INTO document_templates (
    name, 
    type, 
    content, 
    variables, 
    isActive, 
    isDefault,
    createdAt,
    updatedAt
) 
SELECT 
    'Boleto Estándar',
    'BOLETO_COMPRA_VENTA',
    '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Boleto de Compra-Venta</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin: 10px 0; 
            color: #2563eb;
        }
        .document-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 20px 0; 
            text-align: center;
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
        }
        .section { 
            margin: 25px 0; 
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .section-title { 
            font-weight: bold; 
            border-bottom: 1px solid #d1d5db; 
            padding-bottom: 10px; 
            margin-bottom: 15px;
            color: #374151;
            font-size: 16px;
        }
        .grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
        }
        .field { 
            margin: 15px 0; 
        }
        .field-label { 
            font-weight: bold; 
            color: #6b7280; 
            margin-bottom: 5px;
            font-size: 14px;
        }
        .field-value { 
            margin-top: 5px; 
            padding: 8px;
            background-color: white;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }
        .signatures { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 40px; 
            margin-top: 40px; 
        }
        .signature-box { 
            text-align: center; 
            border-top: 2px solid #000; 
            padding-top: 15px; 
        }
        .signature-line { 
            height: 60px; 
            border-bottom: 1px solid #000; 
            margin: 20px 0; 
        }
        .price-highlight {
            font-size: 24px; 
            font-weight: bold; 
            color: #059669;
            text-align: center;
            padding: 15px;
            background-color: #ecfdf5;
            border-radius: 8px;
            border: 2px solid #10b981;
        }
        .conditions {
            font-size: 14px; 
            line-height: 1.6;
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        @media print { 
            body { margin: 0; } 
            .no-print { display: none; } 
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{company.name}}</div>
        <div>{{company.address}}</div>
        <div>{{company.city}} - {{company.state}}</div>
        <div>CUIT: {{company.cuit}}</div>
    </div>

    <div class="document-title">BOLETO DE COMPRA-VENTA N° {{document.number}}</div>
    <div style="text-align: right; margin-bottom: 20px; font-weight: bold;">
        Fecha: {{sale.date}}
    </div>

    <div class="section">
        <div class="section-title">INFORMACIÓN DE LAS PARTES</div>
        <div class="grid">
            <div>
                <div class="field">
                    <div class="field-label">COMPRADOR:</div>
                    <div class="field-value">{{company.name}}</div>
                    <div class="field-value">{{company.address}}</div>
                    <div class="field-value">{{company.city}} - {{company.state}}</div>
                    <div class="field-value">CUIT: {{company.cuit}}</div>
                </div>
            </div>
            <div>
                <div class="field">
                    <div class="field-label">VENDEDOR:</div>
                    <div class="field-value">{{customer.firstName}} {{customer.lastName}}</div>
                    <div class="field-value">{{customer.address}}</div>
                    <div class="field-value">{{customer.city}} {{customer.state}}</div>
                    <div class="field-value">Doc: {{customer.documentNumber}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">INFORMACIÓN DEL VEHÍCULO</div>
        <div class="grid">
            <div class="field">
                <div class="field-label">Marca:</div>
                <div class="field-value">{{vehicle.brand}}</div>
            </div>
            <div class="field">
                <div class="field-label">Modelo:</div>
                <div class="field-value">{{vehicle.model}}</div>
            </div>
            <div class="field">
                <div class="field-label">Año:</div>
                <div class="field-value">{{vehicle.year}}</div>
            </div>
            <div class="field">
                <div class="field-label">Color:</div>
                <div class="field-value">{{vehicle.color}}</div>
            </div>
            <div class="field">
                <div class="field-label">VIN:</div>
                <div class="field-value">{{vehicle.vin}}</div>
            </div>
            <div class="field">
                <div class="field-label">Patente:</div>
                <div class="field-value">{{vehicle.licensePlate}}</div>
            </div>
            <div class="field">
                <div class="field-label">Tipo:</div>
                <div class="field-value">{{vehicle.type}}</div>
            </div>
            <div class="field">
                <div class="field-label">Kilometraje:</div>
                <div class="field-value">{{vehicle.mileage}} km</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CONDICIONES DE LA VENTA</div>
        <div class="grid">
            <div>
                <div class="field">
                    <div class="field-label">Precio Total:</div>
                    <div class="price-highlight">{{sale.totalAmount}}</div>
                </div>
            </div>
            <div>
                <div class="field">
                    <div class="field-label">Forma de Pago:</div>
                    <div class="field-value">{{sale.paymentMethod}}</div>
                </div>
                <div class="field">
                    <div class="field-label">Fecha de Entrega:</div>
                    <div class="field-value">{{sale.deliveryDate}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CONDICIONES Y RESPONSABILIDADES</div>
        <div class="conditions">
            <p><strong>Responsabilidades del Vendedor:</strong> El vendedor se responsabiliza por lo vendido, declarando que no tiene embargos, prendas agrarias (Ley 12.962), ni impedimentos para la venta.</p>
            <p><strong>Condiciones de Entrega:</strong> La unidad se entrega en el estado en que se encuentra, y el comprador declara conocer sus características.</p>
            <p><strong>Transferencia:</strong> El comprador se compromete a realizar la transferencia de dominio del vehículo dentro de los diez días de la fecha, según la Ley 22.977.</p>
            <p><strong>Gastos:</strong> Todos los gastos de transferencia, trámites y gestiones son a cargo exclusivo del comprador.</p>
        </div>
    </div>

    <div class="signatures">
        <div class="signature-box">
            <div style="font-weight: bold; margin-bottom: 10px;">COMPRADOR</div>
            <div>{{company.name}}</div>
            <div class="signature-line"></div>
            <div style="font-size: 12px; color: #6b7280;">Firma</div>
        </div>
        <div class="signature-box">
            <div style="font-weight: bold; margin-bottom: 10px;">VENDEDOR</div>
            <div>{{customer.firstName}} {{customer.lastName}}</div>
            <div class="signature-line"></div>
            <div style="font-size: 12px; color: #6b7280;">Firma</div>
        </div>
    </div>

    <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; font-size: 14px; border: 1px solid #e5e7eb;">
        <p><strong>Observaciones:</strong> {{sale.notes}}</p>
        <p>Documento generado el {{document.generatedAt}}</p>
    </div>
</body>
</html>',
    '{"company": ["name", "address", "city", "state", "cuit"], "customer": ["firstName", "lastName", "address", "city", "state", "documentNumber"], "vehicle": ["brand", "model", "year", "color", "vin", "licensePlate", "type", "mileage"], "sale": ["totalAmount", "paymentMethod", "date", "notes"], "document": ["number", "generatedAt"]}',
    1,
    1,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM document_templates WHERE type = 'BOLETO_COMPRA_VENTA'
);

-- 7. Verificar resultado final
SELECT 
    id,
    name,
    type,
    isActive,
    isDefault,
    LENGTH(content) as content_length,
    createdAt,
    updatedAt
FROM document_templates
ORDER BY createdAt DESC;
