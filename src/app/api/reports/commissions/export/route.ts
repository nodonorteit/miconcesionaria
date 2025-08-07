import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Generar contenido HTML para el PDF
    const htmlContent = generatePDFHTML(sellers as any[], companyName, logoUrl, dateRange)

    // Convertir HTML a PDF (usando una librería como puppeteer o similar)
    const pdfBuffer = await generatePDF(htmlContent)

    return new NextResponse(pdfBuffer, {
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

function generatePDFHTML(sellers: any[], companyName: string, logoUrl: string, dateRange: any) {
  const totalCommission = sellers.reduce((sum, seller) => sum + Number(seller.totalCommission), 0)
  const totalSales = sellers.reduce((sum, seller) => sum + Number(seller.totalSales), 0)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte de Comisiones</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
        }
        .logo {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-right: 20px;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: #1f2937;
        }
        .report-title {
          font-size: 18px;
          color: #6b7280;
          margin: 5px 0 0 0;
        }
        .date-range {
          font-size: 14px;
          color: #9ca3af;
          margin: 5px 0 0 0;
        }
        .stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .commission-amount {
          color: #059669;
          font-weight: bold;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoUrl}" alt="Logo" class="logo" onerror="this.style.display='none'">
        <div class="company-info">
          <h1 class="company-name">${companyName}</h1>
          <p class="report-title">Reporte de Comisiones</p>
          <p class="date-range">
            ${dateRange?.startDate && dateRange?.endDate 
              ? `Período: ${new Date(dateRange.startDate).toLocaleDateString('es-AR')} - ${new Date(dateRange.endDate).toLocaleDateString('es-AR')}`
              : 'Período: Todo el tiempo'
            }
          </p>
        </div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${sellers.length}</div>
          <div class="stat-label">Total Vendedores</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${totalSales.toLocaleString()}</div>
          <div class="stat-label">Total Ventas</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${totalCommission.toLocaleString()}</div>
          <div class="stat-label">Total Comisiones</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${sellers.length > 0 ? (totalCommission / sellers.length).toLocaleString() : '0'}</div>
          <div class="stat-label">Promedio por Vendedor</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Vendedor</th>
            <th>Email</th>
            <th>Ventas</th>
            <th>Comisión Total</th>
            <th>Tasa</th>
          </tr>
        </thead>
        <tbody>
          ${sellers.map(seller => `
            <tr>
              <td>${seller.firstName} ${seller.lastName}</td>
              <td>${seller.email}</td>
              <td>${seller.totalSales}</td>
              <td class="commission-amount">$${Number(seller.totalCommission).toLocaleString()}</td>
              <td>${(Number(seller.commissionRate) * 100).toFixed(1)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Reporte generado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}</p>
        <p>${companyName} - Sistema de Gestión</p>
      </div>
    </body>
    </html>
  `
}

async function generatePDF(htmlContent: string): Promise<Buffer> {
  // Por ahora, vamos a devolver un HTML simple
  // En producción, deberías usar una librería como puppeteer o similar
  return Buffer.from(htmlContent, 'utf-8')
} 