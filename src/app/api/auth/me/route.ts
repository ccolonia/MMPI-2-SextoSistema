import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser(request)
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const profesional = await db.profesional.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        matricula: true,
        telefono: true,
        institucion: true,
        especialidad: true,
        plan: true,
        rol: true,
        emailVerificado: true,
        createdAt: true,
        ultimoLogin: true,
      }
    })

    if (!profesional) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user: profesional })
  } catch (error) {
    console.error('Error en /me:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
