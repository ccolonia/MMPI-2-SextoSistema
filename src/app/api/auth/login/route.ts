import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Buscar profesional por email
    const profesional = await db.profesional.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!profesional) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    if (!profesional.activo) {
      return NextResponse.json(
        { error: 'Tu cuenta está desactivada. Contactá al administrador.' },
        { status: 403 }
      )
    }

    // Verificar contraseña
    const validPassword = await verifyPassword(password, profesional.passwordHash)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Actualizar último login
    await db.profesional.update({
      where: { id: profesional.id },
      data: { ultimoLogin: new Date() }
    })

    // Generar token
    const token = await generateToken({
      userId: profesional.id,
      email: profesional.email,
      rol: profesional.rol,
      nombre: profesional.nombre,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: profesional.id,
        email: profesional.email,
        nombre: profesional.nombre,
        apellido: profesional.apellido,
        matricula: profesional.matricula,
        plan: profesional.plan,
        rol: profesional.rol,
      },
      message: 'Login exitoso'
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
