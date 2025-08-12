import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// POST - Exportar reporte de comisiones a PDF
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const body = await request.json()
    const { companyName, logoUrl, dateRange } = body

    // Obtener datos de comisiones con filtros
    let dateCondition = ''
    let dateParams: any[] = []

    if (startDate && endDate) {
      dateCondition = 'AND sa.createdAt >= ? AND sa.createdAt <= ?'
      dateParams = [new Date(startDate), new Date(endDate + 'T23:59:59')]
    } else if (startDate) {
      dateCondition = 'AND sa.createdAt >= ?'
      dateParams = [new Date(startDate)]
    } else if (endDate) {
      dateCondition = 'AND sa.createdAt <= ?'
      dateParams = [new Date(endDate + 'T23:59:59')]
    }

    const sellersQuery = `
      SELECT 
        s.id,
        s.firstName,
        s.lastName,
        s.email,
        s.commissionRate,
        COALESCE(COUNT(sa.id), 0) as totalSales,
        COALESCE(SUM(sa.totalAmount * s.commissionRate), 0) as totalCommission
      FROM sellers s
      LEFT JOIN sales sa ON s.id = sa.sellerId ${dateCondition ? `AND sa.createdAt IS NOT NULL ${dateCondition}` : ''}
      WHERE s.isActive = 1
      GROUP BY s.id, s.firstName, s.lastName, s.email, s.commissionRate
      ORDER BY totalCommission DESC
    `

    const sellers = await prisma.$queryRawUnsafe(sellersQuery, ...dateParams)

    // Generar PDF usando jsPDF
    const pdfBuffer = await generatePDF(sellers as any[], companyName, dateRange)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-comisiones-${startDate || 'todo'}-${endDate || 'todo'}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting commissions PDF:', error)
    return NextResponse.json(
      { error: 'Error exporting PDF' },
      { status: 500 }
    )
  }
}

async function generatePDF(sellers: any[], companyName: string, dateRange: any): Promise<Buffer> {
  try {
    // Crear nuevo documento PDF
    const doc = new jsPDF()
    
    // Configurar fuente y tamaño
    doc.setFont('helvetica')
    doc.setFontSize(20)
    
    // Título del documento
    doc.text('Reporte de Comisiones', 20, 30)
    
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
    const totalCommission = sellers.reduce((sum, seller) => sum + Number(seller.totalCommission), 0)
    const totalSales = sellers.reduce((sum, seller) => sum + Number(seller.totalSales), 0)
    const averageCommission = sellers.length > 0 ? totalCommission / sellers.length : 0
    
    doc.setFontSize(12)
    doc.text(`Total Vendedores: ${sellers.length}`, 20, 70)
    doc.text(`Total Ventas: ${totalSales.toLocaleString()}`, 20, 80)
    doc.text(`Total Comisiones: $${totalCommission.toLocaleString()}`, 20, 90)
    doc.text(`Promedio por Vendedor: $${averageCommission.toLocaleString()}`, 20, 100)
    
    // Tabla de comisiones
    const tableData = sellers.map(seller => [
      `${seller.firstName} ${seller.lastName}`,
      seller.email,
      seller.totalSales.toString(),
      `$${Number(seller.totalCommission).toLocaleString()}`
    ])
    
    autoTable(doc, {
      head: [['Vendedor', 'Email', 'Ventas', 'Comisión Total']],
      body: tableData,
      startY: 120,
      styles: {
        fontSize: 10,
        cellPadding: 3
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