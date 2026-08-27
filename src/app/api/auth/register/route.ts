import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, isValidEmail, isStrongPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, nombre, apellido, matricula, telefono, institucion, especialidad } = body

    // Validaciones
    if (!email || !password || !nombre) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: email, password, nombre' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existing = await db.profesional.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email' },
        { status: 409 }
      )
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password)

    // Crear profesional
    const profesional = await db.profesional.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        nombre,
        apellido: apellido || null,
        matricula: matricula || null,
        telefono: telefono || null,
        institucion: institucion || null,
        especialidad: especialidad || null,
        plan: 'FREE',
        rol: 'PROFESIONAL',
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        matricula: true,
        plan: true,
        rol: true,
      }
    })

    // Generar token
    const token = await generateToken({
      userId: profesional.id,
      email: profesional.email,
      rol: profesional.rol,
      nombre: profesional.nombre,
    })

    // Crear response con cookie
    const response = NextResponse.json({
      success: true,
      user: profesional,
      message: 'Cuenta creada exitosamente'
    })

    // Setear cookie httpOnly
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Error en registro:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    )
  }
}
