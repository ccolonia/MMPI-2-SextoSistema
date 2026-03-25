import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    // Leer el archivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parsear Excel/CSV con xlsx
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (rawData.length < 2) {
      return NextResponse.json({ error: 'El archivo está vacío o no tiene datos' }, { status: 400 });
    }

    // Obtener encabezados
    const headers = (rawData[0] as string[]).map(h =>
      String(h || '').toLowerCase().replace(/[\s-]/g, '_')
    );

    // Buscar columnas
    const preguntaIdx = headers.findIndex(h =>
      h.includes('pregunta') || h.includes('numero') || h.includes('num') || h === 'n'
    );
    const verdaderoIdx = headers.findIndex(h =>
      h.includes('verdadero') || h === 'v' || h === 'true'
    );
    const falsoIdx = headers.findIndex(h =>
      h.includes('falso') || h === 'f' || h === 'false'
    );
    const noContestaIdx = headers.findIndex(h =>
      h.includes('no_contesta') || h.includes('nocontesta') || h.includes('nc')
    );

    const respuestas: Array<{ numero: number; valor: boolean | null }> = [];

    // Procesar filas (empezando desde la fila 1, saltando encabezados)
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i] as any[];

      if (!row || row.length === 0) continue;

      try {
        // Obtener número de pregunta
        const num = preguntaIdx >= 0 ? parseInt(row[preguntaIdx]) : i;

        if (isNaN(num) || num < 1 || num > 567) continue;

        // Obtener valores
        const verdaderoVal = verdaderoIdx >= 0 ? parseInt(row[verdaderoIdx]) || 0 : 0;
        const falsoVal = falsoIdx >= 0 ? parseInt(row[falsoIdx]) || 0 : 0;
        const noContestaVal = noContestaIdx >= 0 ? parseInt(row[noContestaIdx]) || 0 : 0;

        // Determinar respuesta
        let valor: boolean | null;

        if (noContestaVal === 1) {
          valor = null; // No contesta
        } else if (verdaderoVal === 1 && falsoVal !== 1) {
          valor = true;
        } else if (falsoVal === 1 && verdaderoVal !== 1) {
          valor = false;
        } else if (verdaderoVal === 1 && falsoVal === 1) {
          continue; // Ambos marcados, inválido
        } else {
          // Intentar parsear formato antiguo (solo valor en columna)
          const valorRaw = String(row[verdaderoIdx >= 0 ? verdaderoIdx : 1] || '').toUpperCase();

          if (['V', 'VERDADERO', 'TRUE', '1', 'S', 'SI', 'SÍ', 'T'].includes(valorRaw)) {
            valor = true;
          } else if (['F', 'FALSO', 'FALSE', '0', 'N', 'NO'].includes(valorRaw)) {
            valor = false;
          } else if (['NC', 'NO CONTESTA', 'NO RESPONDE', '-', ''].includes(valorRaw)) {
            valor = null;
          } else {
            continue;
          }
        }

        respuestas.push({ numero: num, valor });

      } catch (e) {
        continue;
      }
    }

    if (respuestas.length === 0) {
      return NextResponse.json({
        error: 'No se encontraron respuestas válidas en el archivo. Verifique el formato.\n\nFormato esperado:\n- Columna "Pregunta" con números del 1 al 567\n- Columna "Verdadero" con 1 o 0\n- Columna "Falso" con 1 o 0\n- Columna "No_Contesta" con 1 o 0 (opcional)'
      }, { status: 400 });
    }

    // Ordenar por número de pregunta
    respuestas.sort((a, b) => a.numero - b.numero);

    // Calcular estadísticas
    const total = respuestas.length;
    const verdaderas = respuestas.filter(r => r.valor === true).length;
    const falsas = respuestas.filter(r => r.valor === false).length;
    const noContesta = respuestas.filter(r => r.valor === null).length;

    return NextResponse.json({
      respuestas,
      total,
      verdaderas,
      falsas,
      no_contesta: noContesta
    });

  } catch (error: any) {
    console.error('Error procesando archivo:', error);
    return NextResponse.json({
      error: `Error al procesar el archivo: ${error.message}`
    }, { status: 500 });
  }
}
