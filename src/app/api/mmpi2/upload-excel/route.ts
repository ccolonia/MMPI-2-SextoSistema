import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

/**
 * Lee un archivo Excel de MMPI-2 (formato VS BB terceros) y extrae los puntajes.
 * 
 * Versión TypeScript pura (sin dependencia de Python) para compatibilidad con Vercel.
 * Reemplaza al script Python `scripts/read_mmpi2_excel.py`.
 * 
 * Estructura esperada del Excel (hoja "Puntajes T"):
 *   Fila 0: nombres (L, F, K, validez, F-K)
 *   Fila 1: valores brutos
 *   Fila 2: valores T
 *   Fila 4: nombres escalas clínicas (Hs, D, Hy, Pd, MfM, MfF, Pa, Pt, Sc, Ma, Si)
 *   Fila 5: valores brutos
 *   Fila 6: valores T
 *   Filas 9-17: subescalas Harris-Lingoes
 */

interface EscalaValidez {
  lBruto: number
  lT: number
  fBruto: number
  fT: number
  kBruto: number
  kT: number
  f_K: number
  omisiones: number
  fbT: number
  fpBruto: number
  vrint: number
  trint: number
}

interface EscalaClinica {
  bruto: number
  T: number
}

interface Subescala {
  bruto: number
  T: number
}

interface ResultadoMMPI2 {
  escalasValidez: EscalaValidez
  escalasClinicas: Record<string, EscalaClinica>
  subescalas: Record<string, Subescala>
  sexo: 'masculino' | 'femenino'
  cargado: boolean
}

function safeInt(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  return isNaN(num) ? defaultValue : Math.round(num)
}

function parseExcel(buffer: Buffer): ResultadoMMPI2 {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  
  const result: ResultadoMMPI2 = {
    escalasValidez: {
      lBruto: 0, lT: 50,
      fBruto: 0, fT: 50,
      kBruto: 0, kT: 50,
      f_K: 0,
      omisiones: 0,
      fbT: 50,
      fpBruto: 3,
      vrint: 50,
      trint: 50,
    },
    escalasClinicas: {},
    subescalas: {},
    sexo: 'masculino',
    cargado: true,
  }
  
  // === Hoja "Puntajes T" ===
  const sheetName = workbook.SheetNames.includes('Puntajes T') 
    ? 'Puntajes T' 
    : workbook.SheetNames[0]
  
  const ws = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null })
  
  if (data.length < 7) {
    throw new Error('El archivo no tiene suficientes filas en la hoja Puntajes T')
  }
  
  // === ESCALAS DE VALIDEZ (filas 0-2) ===
  // L (col 0), F (col 1), K (col 2), F-K (col 6)
  result.escalasValidez.lBruto = safeInt(data[1]?.[0], 0)
  result.escalasValidez.lT = safeInt(data[2]?.[0], 50)
  result.escalasValidez.fBruto = safeInt(data[1]?.[1], 0)
  result.escalasValidez.fT = safeInt(data[2]?.[1], 50)
  result.escalasValidez.kBruto = safeInt(data[1]?.[2], 0)
  result.escalasValidez.kT = safeInt(data[2]?.[2], 50)
  result.escalasValidez.f_K = safeInt(data[1]?.[6], 0)
  
  // === ESCALAS CLÍNICAS BÁSICAS (filas 4-6) ===
  // Columnas: 0=Hs, 1=D, 2=Hy, 3=Pd, 4=MfM, 5=MfF, 6=Pa, 7=Pt, 8=Sc, 9=Ma, 10=Si
  const escalasMapping: Array<[number, string]> = [
    [0, 'Hs'], [1, 'D'], [2, 'Hy'], [3, 'Pd'], [4, 'Mf'],
    [6, 'Pa'], [7, 'Pt'], [8, 'Sc'], [9, 'Ma'], [10, 'Si'],
    // Saltamos col 5 (MfF) porque usamos Mf (col 4 = MfM por defecto)
  ]
  
  for (const [col, nombre] of escalasMapping) {
    const bruto = safeInt(data[5]?.[col], 0)
    const t = safeInt(data[6]?.[col], 50)
    result.escalasClinicas[nombre] = { bruto, T: t }
  }
  
  // === SUBESCALAS HARRIS-LINGOES ===
  // Fila 9-11: D1-D5, Pa1-Pa3, Si1-Si3
  const subescalasF9 = ['D1', 'D2', 'D3', 'D4', 'D5', 'Pa1', 'Pa2', 'Pa3', 'Si1', 'Si2', 'Si3']
  for (let i = 0; i < subescalasF9.length; i++) {
    const bruto = safeInt(data[10]?.[i], 0)
    const t = safeInt(data[11]?.[i], 50)
    result.subescalas[subescalasF9[i]] = { bruto, T: t }
  }
  
  // Fila 12-14: Hy1-Hy5, Ma1-Ma4
  const subescalasF12 = ['Hy1', 'Hy2', 'Hy3', 'Hy4', 'Hy5', 'Ma1', 'Ma2', 'Ma3', 'Ma4']
  for (let i = 0; i < subescalasF12.length; i++) {
    const bruto = safeInt(data[13]?.[i], 0)
    const t = safeInt(data[14]?.[i], 50)
    result.subescalas[subescalasF12[i]] = { bruto, T: t }
  }
  
  // Fila 15-17: Pd1-Pd5, Sc1-Sc6
  const subescalasF15 = ['Pd1', 'Pd2', 'Pd3', 'Pd4', 'Pd5', 'Sc1', 'Sc2', 'Sc3', 'Sc4', 'Sc5', 'Sc6']
  for (let i = 0; i < subescalasF15.length; i++) {
    const bruto = safeInt(data[16]?.[i], 0)
    const t = safeInt(data[17]?.[i], 50)
    result.subescalas[subescalasF15[i]] = { bruto, T: t }
  }
  
  return result
}

/**
 * POST: Procesa un archivo Excel subido
 * 
 * Body: FormData con campo 'file' que contiene el .xls/.xlsx
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let buffer: Buffer
    
    if (contentType.includes('multipart/form-data')) {
      // Upload de archivo vía FormData
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { error: 'No se proporcionó archivo. Envíe un archivo .xls o .xlsx en el campo "file".' },
          { status: 400 }
        )
      }
      
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
    } else {
      // Body JSON con filePath (legacy, no funciona en Vercel pero se mantiene para dev local)
      const body = await request.json()
      const filePath = body.filePath
      
      if (!filePath) {
        return NextResponse.json(
          { error: 'Se requiere un archivo en FormData o filePath en JSON.' },
          { status: 400 }
        )
      }
      
      // Solo para desarrollo local - Vercel no permite fs
      const fs = await import('fs')
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `Archivo no encontrado: ${filePath}` },
          { status: 400 }
        )
      }
      buffer = fs.readFileSync(filePath)
    }
    
    // Parsear el Excel
    const resultado = parseExcel(buffer)
    
    return NextResponse.json(resultado)
    
  } catch (error: any) {
    console.error('Error procesando Excel:', error)
    return NextResponse.json(
      { 
        error: 'Error procesando archivo Excel',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET: Endpoint informativo
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/mmpi2/upload-excel',
    method: 'POST',
    description: 'Procesa un archivo Excel de MMPI-2 (formato VS BB terceros) y extrae los puntajes',
    accept: 'multipart/form-data con campo "file" (.xls, .xlsx)',
    format: 'Hoja "Puntajes T" con estructura: L/F/K en filas 0-2, escalas clínicas en filas 4-6, subescalas Harris-Lingoes en filas 9-17',
  })
}
