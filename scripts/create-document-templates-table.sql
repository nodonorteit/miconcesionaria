-- Crear tabla document_templates
CREATE TABLE IF NOT EXISTS `document_templates` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `variables` JSON NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `isDefault` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `document_templates_name_key` (`name`),
  INDEX `document_templates_type_idx` (`type`),
  INDEX `document_templates_isActive_idx` (`isActive`),
  INDEX `document_templates_isDefault_idx` (`isDefault`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertar template por defecto para boletos de compra-venta
INSERT INTO `document_templates` (
  `id`, 
  `name`, 
  `type`, 
  `content`, 
  `variables`, 
  `isActive`, 
  `isDefault`, 
  `createdAt`, 
  `updatedAt`
) VALUES (
  'default-boleto-template',
  'Boleto Estándar',
  'BOLETO_COMPRA_VENTA',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Boleto de Compra-Venta</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-logo { max-width: 200px; height: auto; }
        .company-name { font-size: 24px; font-weight: bold; margin: 10px 0; }
        .document-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .field { margin: 10px 0; }
        .field-label { font-weight: bold; color: #666; }
        .field-value { margin-top: 5px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .signature-box { text-align: center; border-top: 2px solid #000; padding-top: 10px; }
        .signature-line { height: 60px; border-bottom: 1px solid #000; margin: 20px 0; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        {{#if company.logoUrl}}
        <img src="{{company.logoUrl}}" alt="Logo" class="company-logo">
        {{/if}}
        <div class="company-name">{{company.name}}</div>
        <div>{{company.address}}</div>
        <div>{{company.city}} - {{company.state}}</div>
        <div>CUIT: {{company.cuit}}</div>
    </div>

    <div class="document-title">BOLETO DE COMPRA-VENTA N° {{document.number}}</div>
    <div style="text-align: right; margin-bottom: 20px;">Fecha: {{formatDate sale.date}}</div>

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
                    <div class="field-value" style="font-size: 24px; font-weight: bold; color: #059669;">
                        {{formatCurrency sale.totalAmount}}
                    </div>
                </div>
            </div>
            <div>
                <div class="field">
                    <div class="field-label">Forma de Pago:</div>
                    <div class="field-value">{{sale.paymentMethod}}</div>
                </div>
                <div class="field">
                    <div class="field-label">Fecha de Entrega:</div>
                    <div class="field-value">{{formatDate sale.deliveryDate}}</div>
                </div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">CONDICIONES Y RESPONSABILIDADES</div>
        <div style="font-size: 14px; line-height: 1.5;">
            <p><strong>Responsabilidades del Vendedor:</strong> El vendedor se responsabiliza por lo vendido, declarando que no tiene embargos, prendas agrarias (Ley 12.962), ni impedimentos para la venta.</p>
            <p><strong>Condiciones de Entrega:</strong> La unidad se entrega en el estado en que se encuentra, y el comprador declara conocer sus características.</p>
            <p><strong>Transferencia:</strong> El comprador se compromete a realizar la transferencia de dominio del vehículo dentro de los diez días de la fecha, según la Ley 22.977.</p>
            <p><strong>Gastos:</strong> Todos los gastos de transferencia, trámites y gestiones son a cargo exclusivo del comprador.</p>
        </div>
    </div>

    <div class="signatures">
        <div class="signature-box">
            <div style="font-weight: bold;">COMPRADOR</div>
            <div>{{company.name}}</div>
            <div class="signature-line"></div>
            <div style="font-size: 12px; color: #666;">Firma</div>
        </div>
        <div class="signature-box">
            <div style="font-weight: bold;">VENDEDOR</div>
            <div>{{customer.firstName}} {{customer.lastName}}</div>
            <div class="signature-line"></div>
            <div style="font-size: 12px; color: #666;">Firma</div>
        </div>
    </div>

    <div style="margin-top: 40px; padding: 20px; background-color: #f9fafb; border-radius: 8px; font-size: 14px;">
        <p><strong>Observaciones:</strong> {{sale.notes}}</p>
        <p>Documento generado el {{formatDate document.generatedAt}}</p>
    </div>
</body>
</html>',
  '{"company": ["name", "logoUrl", "address", "city", "state", "cuit"], "customer": ["firstName", "lastName", "address", "city", "state", "documentNumber"], "vehicle": ["brand", "model", "year", "color", "vin", "licensePlate", "type", "mileage"], "sale": ["totalAmount", "paymentMethod", "deliveryDate", "notes"], "document": ["number", "generatedAt"]}',
  TRUE,
  TRUE,
  NOW(),
  NOW()
); 