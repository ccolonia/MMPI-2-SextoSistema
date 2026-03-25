import { NextRequest, NextResponse } from 'next/server';

// Esta API devuelve los datos del informe para que el cliente genere el PDF
// Evitamos usar Python que no está disponible en Vercel

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Los datos ya vienen listos desde el cliente
    // Solo validamos y devolvemos para confirmar
    const {
      demograficos,
      omisiones,
      vrint,
      trint,
      fBruto,
      fT,
      fbT,
      fpBruto,
      f_K,
      lBruto,
      kBruto,
      escalasClinicas,
      escalasSuplementarias,
      escalasContenido,
      analysisResult
    } = body;

    // Validar datos mínimos
    if (!escalasClinicas) {
      return NextResponse.json({
        error: 'Faltan datos de escalas clínicas'
      }, { status: 400 });
    }

    // Devolver los datos confirmados con instrucciones
    return NextResponse.json({
      success: true,
      message: 'Datos validados correctamente. El PDF se generará en el navegador.',
      data: {
        demograficos,
        omisiones,
        vrint,
        trint,
        fBruto,
        fT,
        fbT,
        fpBruto,
        f_K,
        lBruto,
        kBruto,
        escalasClinicas,
        escalasSuplementarias,
        escalasContenido,
        analysisResult,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error en API de reporte:', error);
    return NextResponse.json({
      error: 'Error al procesar el informe',
      details: error.message
    }, { status: 500 });
  }
}

// GET para descargar PDF - genera un PDF simple
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataParam = searchParams.get('data');

    if (!dataParam) {
      return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 });
    }

    const data = JSON.parse(decodeURIComponent(dataParam));

    // Generar PDF con jsPDF (ejecutado en servidor)
    // Nota: jsPDF está diseñado para navegador, usaremos una alternativa
    // Por ahora devolvemos los datos para generación en cliente

    return NextResponse.json({
      success: true,
      message: 'Use los datos para generar PDF en el cliente',
      data
    });

  } catch (error: any) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({
      error: 'Error al generar PDF',
      details: error.message
    }, { status: 500 });
  }
}
