import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const commissionists = await prisma.commissionist.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    return NextResponse.json(commissionists)
  } catch (error) {
    console.error('Error fetching commissionists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commissionists' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, commissionRate } = body

    const commissionist = await prisma.commissionist.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        commissionRate: commissionRate || 0.05
      }
    })

    return NextResponse.json(commissionist)
  } catch (error) {
    console.error('Error creating commissionist:', error)
    return NextResponse.json(
      { error: 'Failed to create commissionist' },
      { status: 500 }
    )
  }
}
