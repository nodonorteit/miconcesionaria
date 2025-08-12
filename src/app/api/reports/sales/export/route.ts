import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// POST - Exportar reporte de ventas a PDF
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const body = await request.json()
    const { companyName, logoUrl, dateRange } = body

    // Obtener datos de ventas con filtros
    let dateCondition = ''
    let dateParams: any[] = []

    if (startDate && endDate) {
      dateCondition = 'AND s.createdAt >= ? AND s.createdAt <= ?'
      dateParams = [new Date(startDate), new Date(endDate + 'T23:59:59')]
    } else if (startDate) {
      dateCondition = 'AND s.createdAt >= ?'
      dateParams = [new Date(startDate)]
    } else if (endDate) {
      dateCondition = 'AND s.createdAt <= ?'
      dateParams = [new Date(endDate + 'T23:59:59')]
    }

    // Obtener estadísticas
    const statsQuery = `
      SELECT 
        COUNT(s.id) as totalSales,
        COALESCE(SUM(s.totalAmount), 0) as totalRevenue,
        COALESCE(SUM(s.commission), 0) as totalCommission,
        COALESCE(AVG(s.totalAmount), 0) as averageSaleValue
      FROM sales s
      WHERE s.status = 'COMPLETED' ${dateCondition}
    `

    const stats = await prisma.$queryRawUnsafe(statsQuery, ...dateParams)
    const statsData = (stats as any[])[0] as any

    // Obtener ventas detalladas
    const salesQuery = `
      SELECT 
        s.id,
        s.saleNumber,
        s.createdAt as date,
        s.totalAmount as amount,
        CONCAT(c.firstName, ' ', c.lastName) as customer,
        CONCAT(v.brand, ' ', v.model, ' ', v.year) as vehicle,
        CONCAT(sel.firstName, ' ', sel.lastName) as seller,
        s.commission
      FROM sales s
      JOIN Client c ON s.customerId = c.id
      JOIN Vehicle v ON s.vehicleId = v.id
      JOIN sellers sel ON s.sellerId = sel.id
      WHERE s.status = 'COMPLETED' ${dateCondition}
      ORDER BY s.createdAt DESC
    `

    const sales = await prisma.$queryRawUnsafe(salesQuery, ...dateParams)

    // Generar PDF usando jsPDF
    const pdfBuffer = await generatePDF(sales as any[], statsData, companyName, dateRange)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-ventas-${startDate || 'todo'}-${endDate || 'todo'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting sales PDF:', error)
    return NextResponse.json(
      { error: 'Error exporting PDF' },
      { status: 500 }
    )
  }
}

async function generatePDF(sales: any[], statsData: any, companyName: string, dateRange: any): Promise<Buffer> {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF()
    
    // Configurar fuente y tamaño
    doc.setFont('helvetica')
    doc.setFontSize(20)
    
    // Título del documento
    doc.text('Reporte de Ventas', 20, 30)
    
    // Información de la empresa
    doc.setFontSize(14)
    doc.text(companyName, 20, 45)
    
    // Período
    doc.setFontSize(12)
    const periodText = dateRange?.startDate && dateRange?.endDate 
      ? `Período: ${new Date(dateRange.startDate).toLocaleDateString('es-AR')} - ${new Date(dateRange.endDate).toLocaleDateString('es-AR')}`
      : 'Período: Todo el tiempo'
    doc.text(periodText, 20, 55)
    
    // Estadísticas
    const totalSales = Number(statsData.totalSales)
    const totalRevenue = Number(statsData.totalRevenue)
    const totalCommission = Number(statsData.totalCommission)
    const averageSaleValue = Number(statsData.averageSaleValue)
    
    doc.setFontSize(12)
    doc.text(`Total Ventas: ${totalSales}`, 20, 70)
    doc.text(`Ingresos Totales: $${totalRevenue.toLocaleString()}`, 20, 80)
    doc.text(`Comisiones: $${totalCommission.toLocaleString()}`, 20, 90)
    doc.text(`Promedio por Venta: $${averageSaleValue.toLocaleString()}`, 20, 100)
    
    // Tabla de ventas
    const tableData = sales.map(sale => [
      sale.saleNumber,
      new Date(sale.date).toLocaleDateString('es-AR'),
      sale.customer,
      sale.vehicle,
      sale.seller,
      `$${Number(sale.amount).toLocaleString()}`,
      `$${Number(sale.commission).toLocaleString()}`
    ])
    
    autoTable(doc, {
      head: [['N° Venta', 'Fecha', 'Cliente', 'Vehículo', 'Vendedor', 'Monto', 'Comisión']],
      body: tableData,
      startY: 120,
      styles: {
        fontSize: 9,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      )
      doc.text(
        `Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`,
        20,
        doc.internal.pageSize.height - 10
      )
    }
    
    // Convertir a Buffer
    const pdfBytes = doc.output('arraybuffer')
    return Buffer.from(pdfBytes)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
} 