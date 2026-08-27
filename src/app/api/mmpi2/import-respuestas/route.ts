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

    // Convertir a JSON - usar raw:true para preservar valores originales
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, blankrows: true, raw: true }) as any[][];

    if (rawData.length < 2) {
      return NextResponse.json({ error: 'El archivo está vacío o no tiene datos' }, { status: 400 });
    }

    // Debug: ver qué tiene la primera fila
    console.log('Primera fila:', JSON.stringify(rawData[0]));
    console.log('Segunda fila:', JSON.stringify(rawData[1]));

    // Detectar si la primera fila tiene headers (texto) o son datos (números)
    const primeraFila = rawData[0] || [];
    const tieneHeaders = primeraFila.some(celda =>
      typeof celda === 'string' && celda.length > 0 &&
      (celda.toLowerCase().includes('pregunta') ||
       celda.toLowerCase().includes('verdadero') ||
       celda.toLowerCase().includes('falso') ||
       celda.toLowerCase().includes('numero') ||
       celda.toLowerCase().includes('respuesta'))
    );

    // Si no tiene headers, verificar si es formato binario
    // Formato binario: 2 columnas, valores 1 o null/undefined
    const esFormatoBinario = !tieneHeaders && primeraFila.length <= 3;

    let headers: string[] = [];
    let filaInicio = 0;

    if (tieneHeaders) {
      headers = primeraFila.map(h => String(h || '').toLowerCase().replace(/[\s-]/g, '_'));
      filaInicio = 1;
    }

    // Buscar columnas por header (solo si hay headers)
    const preguntaIdx = tieneHeaders ? headers.findIndex(h =>
      h.includes('pregunta') || h.includes('numero') || h.includes('num') || h === 'n'
    ) : -1;

    const verdaderoIdx = tieneHeaders ? headers.findIndex(h =>
      h.includes('verdadero') || h === 'v' || h === 'true'
    ) : -1;

    const falsoIdx = tieneHeaders ? headers.findIndex(h =>
      h.includes('falso') || h === 'f' || h === 'false'
    ) : -1;

    const noContestaIdx = tieneHeaders ? headers.findIndex(h =>
      h.includes('no_contesta') || h.includes('nocontesta') || h.includes('nc')
    ) : -1;

    const respuestas: Array<{ numero: number; valor: boolean | null }> = [];

    for (let i = filaInicio; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      try {
        // Determinar número de pregunta
        const num = preguntaIdx >= 0 ? parseInt(row[preguntaIdx]) : (i + 1 - filaInicio);

        if (isNaN(num) || num < 1 || num > 567) continue;

        let valor: boolean | null;

        if (esFormatoBinario) {
          // Formato binario: Col 0 = V (1=sí), Col 1 = F (1=sí)
          // Las celdas vacías son null/undefined, NO 0
          const vRaw = row[0];
          const fRaw = row[1];
          const vVal = (vRaw === 1 || vRaw === '1' || vRaw === true) ? 1 : 0;
          const fVal = (fRaw === 1 || fRaw === '1' || fRaw === true) ? 1 : 0;

          if (vVal === 1 && fVal !== 1) {
            valor = true;
          } else if (fVal === 1 && vVal !== 1) {
            valor = false;
          } else if (vVal === 1 && fVal === 1) {
            continue; // Ambos marcados, inválido
          } else {
            valor = null; // Ninguno marcado = No contesta
          }
        } else if (verdaderoIdx >= 0 || falsoIdx >= 0) {
          // Formato con headers
          const verdaderoVal = verdaderoIdx >= 0 ? Number(row[verdaderoIdx]) || 0 : 0;
          const falsoVal = falsoIdx >= 0 ? Number(row[falsoIdx]) || 0 : 0;
          const noContestaVal = noContestaIdx >= 0 ? Number(row[noContestaIdx]) || 0 : 0;

          if (noContestaVal === 1) {
            valor = null;
          } else if (verdaderoVal === 1 && falsoVal !== 1) {
            valor = true;
          } else if (falsoVal === 1 && verdaderoVal !== 1) {
            valor = false;
          } else if (verdaderoVal === 1 && falsoVal === 1) {
            continue;
          } else {
            continue;
          }
        } else {
          // Formato de valor único en columna
          const valorRaw = String(row[0] || '').toUpperCase().trim();

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
        error: 'No se encontraron respuestas válidas en el archivo. Formatos aceptados:\n\n1. Binario: Col A=Verdadero(1), Col B=Falso(1)\n2. Con headers: Pregunta, Verdadero, Falso, No_Contesta\n3. Valor único: V/F o Verdadero/Falso'
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
