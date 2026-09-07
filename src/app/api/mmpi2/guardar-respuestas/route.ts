import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { respuestas, demograficos } = body

    if (!respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
      return NextResponse.json({ error: 'No se enviaron respuestas' }, { status: 400 })
    }

    // Crear o buscar evaluado
    let evaluadoId: string | null = null
    if (demograficos?.nombreEvaluado) {
      const evaluado = await db.evaluado.create({
        data: {
          nombre: demograficos.nombreEvaluado,
          edad: demograficos.edad || null,
          sexo: demograficos.sexo || null,
          motivoConsulta: demograficos.motivoConsulta || null,
          contextoEval: demograficos.contextoEvaluacion || null,
          evaluador: demograficos.evaluador || null,
          institucion: demograficos.institucion || null,
        }
      })
      evaluadoId = evaluado.id
    }

    // Crear protocolo
    const protocolo = await db.protocoloMMPI2.create({
      data: {
        evaluadoId: evaluadoId,
        completado: true,
        fechaEvaluacion: new Date(),
      }
    })

    // Guardar respuestas (batch)
    const respuestasData = respuestas.map((r: { numero: number; verdadero: boolean | null }) => ({
      protocoloId: protocolo.id,
      preguntaId: r.numero,
      verdadero: r.verdadero,
    }))

    await db.respuesta.createMany({
      data: respuestasData,
      skipDuplicates: true,
    })

    return NextResponse.json({
      success: true,
      protocoloId: protocolo.id,
      totalRespuestas: respuestas.length,
      message: 'Respuestas guardadas en la base de datos'
    })
  } catch (error: any) {
    console.error('Error guardando respuestas:', error)
    return NextResponse.json({
      error: 'Error al guardar las respuestas',
      details: error.message
    }, { status: 500 })
  }
}
