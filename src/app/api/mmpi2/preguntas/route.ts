import { NextResponse } from 'next/server'
import preguntasData from '@/lib/mmpi2/preguntas.json'

export async function GET() {
  try {
    // Devolver las 567 preguntas del MMPI-2
    return NextResponse.json(preguntasData)
  } catch (error) {
    console.error('Error al obtener preguntas:', error)
    return NextResponse.json(
      { error: 'Error al obtener las preguntas' },
      { status: 500 }
    )
  }
}
