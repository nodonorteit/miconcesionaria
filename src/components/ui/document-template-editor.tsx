'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Save, 
  Eye, 
  Code, 
  Trash2, 
  Plus,
  FileText,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import { DocumentTemplate } from '@/types/document-template'

interface DocumentTemplateEditorProps {
  template?: DocumentTemplate
  onSave: (template: DocumentTemplate) => Promise<void>
  onCancel: () => void
  onDelete?: (id: string) => void
}

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
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
</html>`



const DEFAULT_VARIABLES = {
  company: ['name', 'logoUrl', 'address', 'city', 'state', 'cuit'],
  customer: ['firstName', 'lastName', 'address', 'city', 'state', 'documentNumber'],
  vehicle: ['brand', 'model', 'year', 'color', 'vin', 'licensePlate', 'type', 'mileage'],
  sale: ['totalAmount', 'paymentMethod', 'deliveryDate', 'notes'],
  document: ['number', 'generatedAt']
}

export default function DocumentTemplateEditor({ 
  template, 
  onSave, 
  onCancel, 
  onDelete 
}: DocumentTemplateEditorProps) {
  const [formData, setFormData] = useState<DocumentTemplate>({
    name: '',
    type: 'BOLETO_COMPRA_VENTA',
    content: '',
    variables: {},
    isActive: true,
    isDefault: false,
    id: undefined
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('🎯 [Editor] useEffect ejecutado con template:', {
      template: template,
      hasTemplate: !!template,
      templateId: template?.id,
      templateName: template?.name,
      templateIdType: typeof template?.id,
      templateIdValue: template?.id
    })
    
    if (template) {
      console.log('🎯 [Editor] Configurando formData con template existente:', {
        ...template,
        hasId: !!template.id,
        idType: typeof template.id,
        idValue: template.id
      })
      
      // Asegurar que el ID se mantenga explícitamente
      const templateWithId = {
        ...template,
        id: template.id // Forzar que el ID se mantenga
      }
      
      console.log('🎯 [Editor] Template con ID forzado:', {
        ...templateWithId,
        hasId: !!templateWithId.id,
        idType: typeof templateWithId.id,
        idValue: templateWithId.id
      })
      
      setFormData(templateWithId)
    } else {
      console.log('🎯 [Editor] Configurando formData con valores por defecto')
      setFormData({
        name: '',
        type: 'BOLETO_COMPRA_VENTA',
        content: DEFAULT_TEMPLATE,
        variables: DEFAULT_VARIABLES,
        isActive: true,
        isDefault: false
      })
    }
  }, [template])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del template es requerido')
      return
    }

    if (!formData.content.trim()) {
      toast.error('El contenido del template es requerido')
      return
    }

    setLoading(true)
    try {
      // Asegurar que el ID se mantenga si existe (limpiar strings vacíos)
      const cleanFormDataId = (formData.id && typeof formData.id === 'string' && formData.id.trim() !== '') ? formData.id.trim() : undefined
      const cleanTemplateId = (template?.id && typeof template.id === 'string' && template.id.trim() !== '') ? template.id.trim() : undefined
      
      // Priorizar el ID del template original si existe, sino usar el del formData
      const finalId = cleanTemplateId || cleanFormDataId || undefined
      
      // Si estamos editando un template existente, FORZAR que tenga ID
      const isEditingExistingTemplate = !!template && !!template.id
      const forcedId = isEditingExistingTemplate ? template.id : finalId
      
      console.log('🔍 [Save] IDs disponibles:', {
        formDataId: formData.id,
        formDataIdType: typeof formData.id,
        templateId: template?.id,
        templateIdType: typeof template?.id,
        cleanFormDataId: cleanFormDataId,
        cleanTemplateId: cleanTemplateId,
        finalId: finalId,
        finalIdType: typeof finalId,
        isEditingExistingTemplate: isEditingExistingTemplate,
        forcedId: forcedId,
        forcedIdType: typeof forcedId
      })
      
      // Crear el template asegurando que el ID esté presente
      const templateToSave = {
        name: formData.name,
        type: formData.type,
        content: formData.content,
        variables: formData.variables,
        isActive: formData.isActive,
        isDefault: formData.isDefault,
        id: forcedId, // Asegurar que el ID esté presente
        ...(formData.createdAt && { createdAt: formData.createdAt }),
        ...(formData.updatedAt && { updatedAt: formData.updatedAt })
      }
      
      console.log('💾 [Save] Template final a enviar:', {
        originalFormDataId: formData.id,
        originalTemplateId: template?.id,
        cleanFormDataId: cleanFormDataId,
        cleanTemplateId: cleanTemplateId,
        finalId: finalId,
        forcedId: forcedId,
        templateToSave: templateToSave,
        hasId: !!forcedId,
        idValue: forcedId,
        idType: typeof forcedId,
        isEditing: !!forcedId,
        templateToSaveKeys: Object.keys(templateToSave),
        templateToSaveStringified: JSON.stringify(templateToSave)
      })
      
      console.log('💾 [Save] Guardando template:', {
        isEditing: !!template?.id,
        templateId: template?.id,
        templateIdType: typeof template?.id,
        formDataId: formData.id,
        formDataIdType: typeof formData.id,
        templateName: formData.name,
        templateType: formData.type,
        templateObject: template,
        formDataObject: formData
      })
      
      await onSave(templateToSave)
      
      const action = template?.id ? 'actualizado' : 'creado'
      toast.success(`Template ${action} correctamente`)
    } catch (error) {
      console.error('❌ [Save] Error al guardar template:', error)
      toast.error('Error al guardar el template')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!template?.id || !onDelete) return
    
    if (confirm('¿Estás seguro de que quieres eliminar este template?')) {
      try {
        await onDelete(template.id)
        toast.success('Template eliminado correctamente')
      } catch (error) {
        toast.error('Error al eliminar el template')
      }
    }
  }

  const handleLoadDefault = () => {
    if (confirm('¿Quieres cargar el template por defecto? Se perderán los cambios actuales.')) {
      setFormData(prev => ({
        ...prev,
        content: DEFAULT_TEMPLATE,
        variables: DEFAULT_VARIABLES,
        id: prev.id // Mantener el ID al cargar el template por defecto
      }))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {template?.id ? `Editar Template: ${template.name}` : 'Nuevo Template'}
        </CardTitle>
        <CardDescription>
          {template?.id 
            ? `Modificando el template existente. Los cambios se aplicarán al template actual.`
            : 'Configura el template del documento. Usa variables como {company.name} para datos dinámicos.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información básica */}
        {template?.id && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <div className="flex items-center gap-2 text-blue-800">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                Editando template existente (ID: {template.id})
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Los cambios se aplicarán al template actual, no se creará uno nuevo.
            </p>
            {/* Campo oculto para mantener el ID */}
            <input 
              type="hidden" 
              value={template.id} 
              onChange={() => {}} 
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Template *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                name: e.target.value,
                id: prev.id // Mantener el ID en todas las actualizaciones
              }))}
              placeholder="Ej: Boleto Estándar"
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo de Documento</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value,
                id: prev.id // Mantener el ID en todas las actualizaciones
              }))}
              placeholder="BOLETO_COMPRA_VENTA"
            />
          </div>
        </div>

        {/* Opciones */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isActive: checked,
                id: prev.id // Mantener el ID en todas las actualizaciones
              }))}
            />
            <Label htmlFor="active">Template Activo</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="default"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isDefault: checked,
                id: prev.id // Mantener el ID en todas las actualizaciones
              }))}
            />
            <Label htmlFor="default">Template por Defecto</Label>
          </div>
        </div>

        {/* Variables disponibles */}
        <div>
          <Label>Variables Disponibles</Label>
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(formData.variables).map(([category, fields]) => (
                <div key={category}>
                  <strong className="text-gray-700">{category}:</strong>
                  <div className="text-gray-600">
                    {Array.isArray(fields) && fields.map(field => (
                      <div key={field} className="ml-2">• {'{'+category+'.'+field+'}'}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor de contenido */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Contenido HTML del Template</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadDefault}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Cargar Default
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                {previewMode ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewMode ? 'Código' : 'Vista Previa'}
              </Button>
            </div>
          </div>
          
          {previewMode ? (
            <div className="border rounded-md p-4 bg-gray-50 max-h-96 overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          ) : (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                content: e.target.value,
                id: prev.id // Mantener el ID en todas las actualizaciones
              }))}
              className="w-full h-96 p-3 border rounded-md font-mono text-sm resize-none"
              placeholder="Ingresa el HTML del template..."
            />
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            {template?.id && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 