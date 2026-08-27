import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Contar pacientes del profesional
    const totalPacientes = await db.paciente.count({
      where: { profesionalId: user.userId }
    })

    // Contar evaluaciones del profesional
    const totalEvaluaciones = await db.evaluacion.count({
      where: { profesionalId: user.userId }
    })

    // Contar informes MMPI-2 del profesional
    const totalInformes = await db.informeMMPI2.count({
      where: { profesionalId: user.userId }
    })

    // Obtener evaluaciones recientes (últimas 5)
    const evaluacionesRecientes = await db.informeMMPI2.findMany({
      where: { profesionalId: user.userId },
      select: {
        id: true,
        nombreEvaluado: true,
        fechaEvaluacion: true,
        evaluador: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      stats: {
        totalPacientes,
        totalEvaluaciones,
        totalInformes,
        plan: user.nombre,
      },
      evaluacionesRecientes,
    })
  } catch (error) {
    console.error('Error en dashboard:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
