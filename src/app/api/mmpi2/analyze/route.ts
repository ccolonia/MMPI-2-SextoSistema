import { NextRequest, NextResponse } from 'next/server';
import { analizarMMPI2 } from '@/lib/mmpi2/analyzer';
import { MMPI2Protocol } from '@/lib/mmpi2/types';

export async function POST(request: NextRequest) {
  try {
    const protocol: MMPI2Protocol = await request.json();

    // Validar datos mínimos requeridos
    if (!protocol.demograficos || !protocol.escalasClinicas) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos del protocolo' },
        { status: 400 }
      );
    }

    // Realizar análisis
    const resultado = analizarMMPI2(protocol);

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error en análisis MMPI-2:', error);
    return NextResponse.json(
      { error: 'Error interno en el análisis del protocolo' },
      { status: 500 }
    );
  }
}
