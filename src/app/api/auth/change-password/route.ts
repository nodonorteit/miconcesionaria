import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token?.sub) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { newPassword } = await req.json()

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: token.sub },
      data: {
        password: hashed,
        mustChangePassword: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    return NextResponse.json(
      { error: 'Error al cambiar la contraseña' },
      { status: 500 }
    )
  }
}

