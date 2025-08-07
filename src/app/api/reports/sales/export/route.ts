import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import puppeteer from 'puppeteer'

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

    // Generar contenido HTML para el PDF
    const htmlContent = generatePDFHTML(sales as any[], statsData, companyName, logoUrl, dateRange)

    // Convertir HTML a PDF usando Puppeteer
    const pdfBuffer = await generatePDF(htmlContent)

    return new NextResponse(pdfBuffer, {
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

function generatePDFHTML(sales: any[], statsData: any, companyName: string, logoUrl: string, dateRange: any) {
  const totalSales = Number(statsData.totalSales)
  const totalRevenue = Number(statsData.totalRevenue)
  const totalCommission = Number(statsData.totalCommission)
  const averageSaleValue = Number(statsData.averageSaleValue)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reporte de Ventas</title>
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
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .amount {
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
        <div class="company-info">
          <h1 class="company-name">${companyName}</h1>
          <p class="report-title">Reporte de Ventas</p>
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
          <div class="stat-value">${totalSales}</div>
          <div class="stat-label">Total Ventas</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${totalRevenue.toLocaleString()}</div>
          <div class="stat-label">Ingresos Totales</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${totalCommission.toLocaleString()}</div>
          <div class="stat-label">Comisiones</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">$${averageSaleValue.toLocaleString()}</div>
          <div class="stat-label">Promedio por Venta</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>N° Venta</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Vendedor</th>
            <th>Monto</th>
            <th>Comisión</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(sale => `
            <tr>
              <td>${sale.saleNumber}</td>
              <td>${new Date(sale.date).toLocaleDateString('es-AR')}</td>
              <td>${sale.customer}</td>
              <td>${sale.vehicle}</td>
              <td>${sale.seller}</td>
              <td class="amount">$${Number(sale.amount).toLocaleString()}</td>
              <td class="amount">$${Number(sale.commission).toLocaleString()}</td>
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
  try {
    // Iniciar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    })
    
    const page = await browser.newPage()
    
    // Configurar el contenido HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })
    
    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    await browser.close()
    
    return Buffer.from(pdf)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback: devolver HTML como texto plano
    return Buffer.from(htmlContent, 'utf-8')
  }
} 