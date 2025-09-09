'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/ui/navigation'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  Copy,
  Star
} from 'lucide-react'
import DocumentTemplateEditor from '@/components/ui/document-template-editor'
import toast from 'react-hot-toast'
import { DocumentTemplate, DocumentTemplateWithTimestamps } from '@/types/document-template'

export default function DocumentTemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplateWithTimestamps[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplateWithTimestamps | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/document-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      } else {
        toast.error('Error al cargar templates')
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Error al cargar templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplate = async (template: DocumentTemplate) => {
    try {
      console.log('💾 [Save] Guardando template desde página:', {
        id: template.id,
        name: template.name,
        type: template.type,
        hasId: !!template.id,
        isEditing: !!template.id,
        templateObject: template
      })
      
      const response = await fetch('/api/admin/document-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      })

      if (response.ok) {
        await loadTemplates()
        setShowEditor(false)
        setEditingTemplate(null)
        toast.success('Template guardado correctamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar template')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Error al guardar template')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/document-templates?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadTemplates()
        toast.success('Template eliminado correctamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Error al eliminar template')
    }
  }

  const handleDuplicateTemplate = async (template: DocumentTemplateWithTimestamps) => {
    const duplicatedTemplate: DocumentTemplate = {
      ...template,
      id: undefined,
      name: `${template.name} (Copia)`,
      isDefault: false
    }
    setEditingTemplate(duplicatedTemplate)
    setShowEditor(true)
  }

  const handleEditTemplate = (template: DocumentTemplateWithTimestamps) => {
    console.log('🔧 [Edit] Iniciando edición del template:', {
      id: template.id,
      name: template.name,
      type: template.type,
      hasId: !!template.id,
      templateObject: template
    })
    
    // Convertir explícitamente a DocumentTemplate manteniendo el ID
    const templateForEdit: DocumentTemplate = {
      id: template.id, // Asegurar que el ID se mantenga
      name: template.name,
      type: template.type,
      content: template.content,
      variables: template.variables,
      isActive: template.isActive,
      isDefault: template.isDefault
    }
    
    console.log('🔧 [Edit] Template convertido para edición:', templateForEdit)
    setEditingTemplate(templateForEdit)
    setShowEditor(true)
  }

  const handleNewTemplate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingTemplate(null)
  }

  const handlePreview = (template: DocumentTemplateWithTimestamps) => {
    console.log('🔍 [Preview] Abriendo preview del template:', template.name);
    console.log('🔍 [Preview] Tipo del template:', template.type);
    console.log('🔍 [Preview] Contenido del template:', template.content.substring(0, 200) + '...');
    console.log('🔍 [Preview] Variables del template:', template.variables);
    setPreviewTemplate(template)
  }

  const processTemplateWithSampleData = (content: string): string => {
    console.log('🔍 [Preview] Procesando template con contenido:', content.substring(0, 200) + '...')
    
    // Datos de ejemplo para el preview
    const sampleData = {
      company: {
        name: 'Mi Concesionaria S.A.',
        logoUrl: '/logo.svg',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        cuit: '30-12345678-9'
      },
      customer: {
        firstName: 'Juan',
        lastName: 'Pérez',
        address: 'Calle Falsa 123',
        city: 'Córdoba',
        state: 'Córdoba',
        documentNumber: '12345678'
      },
      vehicle: {
        brand: 'Toyota',
        model: 'Corolla',
        year: '2020',
        color: 'Blanco',
        vin: '1HGBH41JXMN109186',
        licensePlate: 'ABC123',
        type: 'Sedán',
        mileage: '45000'
      },
      sale: {
        totalAmount: 25000000,
        paymentMethod: 'Transferencia Bancaria',
        deliveryDate: '2025-01-15',
        notes: 'Vehículo en excelente estado, sin accidentes',
        date: '2025-01-10'
      },
      document: {
        number: 'BOL-001',
        generatedAt: '2025-01-10'
      }
    }

    // Funciones de formato
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString('es-AR')
    }

    // Procesar el template con Handlebars-like syntax
    let processedContent = content

    // Reemplazar variables de company
    processedContent = processedContent.replace(/\{\{company\.(\w+)\}\}/g, (match, field) => {
      const value = sampleData.company[field as keyof typeof sampleData.company]
      return value !== undefined ? String(value) : match
    })

    // Reemplazar variables de customer
    processedContent = processedContent.replace(/\{\{customer\.(\w+)\}\}/g, (match, field) => {
      const value = sampleData.customer[field as keyof typeof sampleData.customer]
      return value !== undefined ? String(value) : match
    })

    // Reemplazar variables de vehicle
    processedContent = processedContent.replace(/\{\{vehicle\.(\w+)\}\}/g, (match, field) => {
      const value = sampleData.vehicle[field as keyof typeof sampleData.vehicle]
      return value !== undefined ? String(value) : match
    })

    // Reemplazar variables de sale
    processedContent = processedContent.replace(/\{\{sale\.(\w+)\}\}/g, (match, field) => {
      const value = sampleData.sale[field as keyof typeof sampleData.sale]
      return value !== undefined ? String(value) : match
    })

    // Reemplazar variables de document
    processedContent = processedContent.replace(/\{\{document\.(\w+)\}\}/g, (match, field) => {
      const value = sampleData.document[field as keyof typeof sampleData.document]
      return value !== undefined ? String(value) : match
    })

    // Reemplazar funciones de formato
    processedContent = processedContent.replace(/\{\{formatCurrency\s+sale\.(\w+)\}\}/g, (match, field) => {
      const amount = sampleData.sale[field as keyof typeof sampleData.sale]
      return typeof amount === 'number' ? formatCurrency(amount) : match
    })

    processedContent = processedContent.replace(/\{\{formatDate\s+sale\.(\w+)\}\}/g, (match, field) => {
      const date = sampleData.sale[field as keyof typeof sampleData.sale]
      return typeof date === 'string' ? formatDate(date) : match
    })

    processedContent = processedContent.replace(/\{\{formatDate\s+document\.(\w+)\}\}/g, (match, field) => {
      const date = sampleData.document[field as keyof typeof sampleData.document]
      return typeof date === 'string' ? formatDate(date) : match
    })

    // Procesar condicionales simples
    processedContent = processedContent.replace(/\{\{#if\s+company\.logoUrl\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, content) => {
      return sampleData.company.logoUrl ? content : ''
    })

    console.log('✅ [Preview] Template procesado. Longitud final:', processedContent.length)
    console.log('🔍 [Preview] Primeros 300 caracteres:', processedContent.substring(0, 300))

    return processedContent
  }

  if (showEditor) {
    return (
      <div className="container mx-auto p-6">
        <Navigation 
          title="Editor de Templates" 
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Configuración', href: '/admin/settings' },
            { label: 'Templates de Documentos', href: '/admin/settings/document-templates' },
            { label: editingTemplate ? 'Editar' : 'Nuevo' }
          ]}
        />
        
        <DocumentTemplateEditor
          template={editingTemplate || undefined}
          onSave={handleSaveTemplate}
          onCancel={handleCancel}
          onDelete={editingTemplate?.id ? handleDeleteTemplate : undefined}
        />
      </div>
    )
  }

  if (previewTemplate) {
    return (
      <div className="container mx-auto p-6">
        <Navigation 
          title="Vista Previa del Template" 
          breadcrumbs={[
            { label: 'Admin', href: '/admin' },
            { label: 'Configuración', href: '/admin/settings' },
            { label: 'Templates de Documentos', href: '/admin/settings/document-templates' },
            { label: 'Vista Previa' }
          ]}
        />
        
        <div className="mb-6">
          <Button onClick={() => setPreviewTemplate(null)} variant="outline">
            ← Volver a Templates
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa: {previewTemplate.name}
            </CardTitle>
            <CardDescription>
              Este es cómo se verá el documento generado con este template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 bg-gray-50 max-h-96 overflow-auto" data-testid="preview-container">
              <div dangerouslySetInnerHTML={{ __html: processTemplateWithSampleData(previewTemplate.content) }} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Navigation 
        title="Templates de Documentos" 
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Configuración', href: '/admin/settings' },
          { label: 'Templates de Documentos' }
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Gestiona los templates para generar documentos como boletos de compra-venta</p>
        </div>
        <Button onClick={handleNewTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Template
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay templates</h3>
            <p className="text-gray-600 mb-4">Crea tu primer template para generar documentos personalizados</p>
            <Button onClick={handleNewTemplate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Primer Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative">
              {template.isDefault && (
                <div className="absolute top-2 right-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <CardDescription>
                  Tipo: {template.type}
                  {template.isDefault && (
                    <span className="ml-2 text-yellow-600 font-medium">• Por defecto</span>
                  )}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Creado: {new Date(template.createdAt).toLocaleDateString('es-AR')}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Actualizado: {new Date(template.updatedAt).toLocaleDateString('es-AR')}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(template)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Vista Previa
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditTemplate(template)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateTemplate(template)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>
                    
                    {!template.isDefault && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 