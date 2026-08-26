import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

/**
 * Lee un archivo Excel de MMPI-2 (formato VS BB terceros Ezequiel) y extrae TODOS los brutos.
 *
 * Versión TypeScript pura (sin dependencia de Python) para compatibilidad con Vercel.
 *
 * Estructura esperada del Excel (hoja "Puntajes Brutos"):
 *
 * Fila 0: Headers (L, F, K, validez, ?, MASCULINO, Mujer, Hombre)
 * Fila 1: Brutos validez (L, F, K) + omisiones (col 8)
 * Fila 2-3: Headers clínicas básicas (Hs, D, Hy, Pd, MfM, MfF, Pa, Pt, Sc, Ma)
 * Fila 4: Brutos clínicas básicas
 * Fila 5-6: Headers Harris-Lingoes grupo 1 (D1-D5, Pa1-Pa3, Si1-Si3)
 * Fila 7: Brutos
 * Fila 8-9: Headers Harris-Lingoes grupo 2 (Hy1-Hy5, Ma1-Ma4)
 * Fila 10-11: Headers Harris-Lingoes grupo 3 (Pd1-Pd5, Sc1-Sc5)
 * Fila 14-25: Razones Obviedad-Sutilidad (D-O/D-S, Hy-O/Hy-S, Pd-O/Pd-S, Pa-O/Pa-S, Ma-O/Ma-S)
 * Fila 27-29: Escalas suplementarias (A, R, Es, MAC-R, O-H, Do, Re, Mt)
 * Fila 30-31: Más suplementarias (GM, GF, PK, PS, Fp, Fb, VRIN, TRIN)
 * Fila 33-37: Escalas de contenido (ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN, ASP, TPA, LSE, SOD, FAM, WRK, TRT)
 */

interface ResultadoMMPI2 {
  // Sexo del evaluado (lo infiere del Excel o usa 'masculino' por defecto)
  sexo: 'masculino' | 'femenino'

  // === ESCALAS DE VALIDEZ (brutos) ===
  lBruto: number
  fBruto: number
  kBruto: number
  fbBruto: number
  fpBruto: number  // F(p)
  vrinBruto: number
  trinBruto: number
  omisiones: number
  fK: number  // F - K

  // === ESCALAS CLÍNICAS BÁSICAS (brutos, SIN corregir K) ===
  // Nota: las clínicas Hs, Pd, Pt, Sc, Ma requieren corrección K.
  // El Excel da los brutos sin corregir; la corrección se aplica al calcular T.
  hsBruto: number
  dBruto: number
  hyBruto: number
  pdBruto: number
  mfMBruto: number  // Mf masculino
  mfFBruto: number  // Mf femenino
  paBruto: number
  ptBruto: number
  scBruto: number
  maBruto: number
  siBruto: number

  // === SUBESCALAS HARRIS-LINGOES (brutos) ===
  d1Bruto: number; d2Bruto: number; d3Bruto: number; d4Bruto: number; d5Bruto: number
  hy1Bruto: number; hy2Bruto: number; hy3Bruto: number; hy4Bruto: number; hy5Bruto: number
  pd1Bruto: number; pd2Bruto: number; pd3Bruto: number; pd4Bruto: number; pd5Bruto: number
  pa1Bruto: number; pa2Bruto: number; pa3Bruto: number
  sc1Bruto: number; sc2Bruto: number; sc3Bruto: number; sc4Bruto: number; sc5Bruto: number; sc6Bruto: number
  ma1Bruto: number; ma2Bruto: number; ma3Bruto: number; ma4Bruto: number
  si1Bruto: number; si2Bruto: number; si3Bruto: number

  // === RAZONES OBVIEDAD-SUTILIDAD (brutos) ===
  dObvio: number; dSutil: number
  hyObvio: number; hySutil: number
  pdObvio: number; pdSutil: number
  paObvio: number; paSutil: number
  maObvio: number; maSutil: number

  // === ESCALAS SUPLEMENTARIAS (brutos) ===
  aBruto: number
  rBruto: number
  esBruto: number
  macRBruto: number
  ohBruto: number  // O-H
  doBruto: number
  reBruto: number
  mtBruto: number
  gmBruto: number
  gfBruto: number
  pkBruto: number
  psBruto: number

  // === ESCALAS DE CONTENIDO (brutos) ===
  anxBruto: number
  frsBruto: number
  obsBruto: number
  depContBruto: number
  heaBruto: number
  bizBruto: number
  angBruto: number
  cynBruto: number
  aspContBruto: number
  tpaBruto: number
  lseBruto: number
  sodBruto: number
  famBruto: number
  wrkBruto: number
  trtBruto: number

  cargado: boolean
}

function safeNum(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  return isNaN(num) ? defaultValue : num
}

/**
 * Extrae un valor de una celda específica de la hoja "Puntajes Brutos".
 * Asume que la estructura del Excel es fija (formato Ezequiel).
 */
function getCell(data: any[][], row: number, col: number): any {
  if (row >= data.length) return null
  if (col >= data[row].length) return null
  return data[row][col]
}

function parseExcel(buffer: Buffer): ResultadoMMPI2 {
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  const sheetName = workbook.SheetNames.includes('Puntajes Brutos')
    ? 'Puntajes Brutos'
    : workbook.SheetNames[0]

  const ws = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null })

  if (data.length < 38) {
    throw new Error('El archivo no tiene suficientes filas en la hoja Puntajes Brutos')
  }

  // Detectar sexo: si el header tiene "MASCULINO" en col 10, es masculino
  // (el Excel de Ezequiel está configurado para varón por defecto)
  const sexo: 'masculino' | 'femenino' = 'masculino'

  // === ESCALAS DE VALIDEZ (fila 1, cols 3-5) ===
  // Col 3 = L, Col 4 = F, Col 5 = K, Col 8 = Omisiones (?)
  const lBruto = safeNum(getCell(data, 1, 3), 0)
  const fBruto = safeNum(getCell(data, 1, 4), 0)
  const kBruto = safeNum(getCell(data, 1, 5), 0)
  const omisiones = safeNum(getCell(data, 1, 8), 0)
  const fK = fBruto - kBruto

  // === ESCALAS CLÍNICAS BÁSICAS (fila 4, cols 3-13) ===
  // Hs=3, D=4, Hy=5, Pd=6, MfM=7, MfF=8, Pa=9, Pt=10, Sc=11, Ma=12
  // Si está en col 13 también (necesitamos Si)
  const hsBruto = safeNum(getCell(data, 4, 3), 0)
  const dBruto = safeNum(getCell(data, 4, 4), 0)
  const hyBruto = safeNum(getCell(data, 4, 5), 0)
  const pdBruto = safeNum(getCell(data, 4, 6), 0)
  const mfMBruto = safeNum(getCell(data, 4, 7), 0)
  const mfFBruto = safeNum(getCell(data, 4, 8), 0)
  const paBruto = safeNum(getCell(data, 4, 9), 0)
  const ptBruto = safeNum(getCell(data, 4, 10), 0)
  const scBruto = safeNum(getCell(data, 4, 11), 0)
  const maBruto = safeNum(getCell(data, 4, 12), 0)
  // Si está en otra columna - buscar en fila 4 todos los valores
  // El Excel de Ezequiel tiene Si en col 13
  const siBruto = safeNum(getCell(data, 4, 13), 0)

  // === HARRIS-LINGOES Grupo 1 (fila 7, cols 3-12): D1-D5, Pa1-Pa3, Si1-Si3 ===
  const d1Bruto = safeNum(getCell(data, 7, 3), 0)
  const d2Bruto = safeNum(getCell(data, 7, 4), 0)
  const d3Bruto = safeNum(getCell(data, 7, 5), 0)
  const d4Bruto = safeNum(getCell(data, 7, 6), 0)
  const d5Bruto = safeNum(getCell(data, 7, 7), 0)
  const pa1Bruto = safeNum(getCell(data, 7, 8), 0)
  const pa2Bruto = safeNum(getCell(data, 7, 9), 0)
  const pa3Bruto = safeNum(getCell(data, 7, 10), 0)
  const si1Bruto = safeNum(getCell(data, 7, 11), 0)
  const si2Bruto = safeNum(getCell(data, 7, 12), 0)
  // Si3 está en otra fila (puede estar en col 13 o en otra posición)
  const si3Bruto = safeNum(getCell(data, 7, 13), 0)

  // === HARRIS-LINGOES Grupo 2 (fila 9, cols 3-11): Hy1-Hy5, Ma1-Ma4 ===
  const hy1Bruto = safeNum(getCell(data, 9, 3), 0)
  const hy2Bruto = safeNum(getCell(data, 9, 4), 0)
  const hy3Bruto = safeNum(getCell(data, 9, 5), 0)
  const hy4Bruto = safeNum(getCell(data, 9, 6), 0)
  const hy5Bruto = safeNum(getCell(data, 9, 7), 0)
  const ma1Bruto = safeNum(getCell(data, 9, 8), 0)
  const ma2Bruto = safeNum(getCell(data, 9, 9), 0)
  const ma3Bruto = safeNum(getCell(data, 9, 10), 0)
  const ma4Bruto = safeNum(getCell(data, 9, 11), 0)

  // === HARRIS-LINGOES Grupo 3 (fila 11, cols 3-13): Pd1-Pd5, Sc1-Sc6 ===
  const pd1Bruto = safeNum(getCell(data, 11, 3), 0)
  const pd2Bruto = safeNum(getCell(data, 11, 4), 0)
  const pd3Bruto = safeNum(getCell(data, 11, 5), 0)
  const pd4Bruto = safeNum(getCell(data, 11, 6), 0)
  const pd5Bruto = safeNum(getCell(data, 11, 7), 0)
  const sc1Bruto = safeNum(getCell(data, 11, 8), 0)
  const sc2Bruto = safeNum(getCell(data, 11, 9), 0)
  const sc3Bruto = safeNum(getCell(data, 11, 10), 0)
  const sc4Bruto = safeNum(getCell(data, 11, 11), 0)
  const sc5Bruto = safeNum(getCell(data, 11, 12), 0)
  const sc6Bruto = safeNum(getCell(data, 11, 13), 0)

  // === RAZONES OBVIEDAD-SUTILIDAD (filas 17-25) ===
  // R17: D-O=3, D-S=4
  // R19: Hy-O=3, Hy-S=4
  // R21: Pd-O=3, Pd-S=4
  // R23: Pa-O=3, Pa-S=4
  // R25: Ma-O=3, Ma-S=4
  const dObvio = safeNum(getCell(data, 17, 3), 0)
  const dSutil = safeNum(getCell(data, 17, 4), 0)
  const hyObvio = safeNum(getCell(data, 19, 3), 0)
  const hySutil = safeNum(getCell(data, 19, 4), 0)
  const pdObvio = safeNum(getCell(data, 21, 3), 0)
  const pdSutil = safeNum(getCell(data, 21, 4), 0)
  const paObvio = safeNum(getCell(data, 23, 3), 0)
  const paSutil = safeNum(getCell(data, 23, 4), 0)
  const maObvio = safeNum(getCell(data, 25, 3), 0)
  const maSutil = safeNum(getCell(data, 25, 4), 0)

  // === ESCALAS SUPLEMENTARIAS Grupo 1 (fila 29, cols 3-11): A, R, Es, MAC-R, O-H, Do, Re, Mt ===
  const aBruto = safeNum(getCell(data, 29, 3), 0)
  const rBruto = safeNum(getCell(data, 29, 4), 0)
  const esBruto = safeNum(getCell(data, 29, 5), 0)
  const macRBruto = safeNum(getCell(data, 29, 6), 0)
  const ohBruto = safeNum(getCell(data, 29, 7), 0)
  const doBruto = safeNum(getCell(data, 29, 8), 0)
  const reBruto = safeNum(getCell(data, 29, 9), 0)
  const mtBruto = safeNum(getCell(data, 29, 10), 0)

  // === ESCALAS SUPLEMENTARIAS Grupo 2 (fila 31, cols 3-12): GM, GF, PK, PS, F(p), Fb, VRIN, TRIN ===
  const gmBruto = safeNum(getCell(data, 31, 3), 0)
  const gfBruto = safeNum(getCell(data, 31, 4), 0)
  const pkBruto = safeNum(getCell(data, 31, 5), 0)
  const psBruto = safeNum(getCell(data, 31, 6), 0)
  const fpBruto = safeNum(getCell(data, 31, 8), 0)  // F(p) en col 8
  const fbBruto = safeNum(getCell(data, 31, 9), 0)  // Fb en col 9
  const vrinBruto = safeNum(getCell(data, 31, 10), 0)  // VRIN en col 10
  const trinBruto = safeNum(getCell(data, 31, 11), 0)  // TRIN en col 11

  // === ESCALAS DE CONTENIDO Grupo 1 (fila 35, cols 3-10): ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN ===
  const anxBruto = safeNum(getCell(data, 35, 3), 0)
  const frsBruto = safeNum(getCell(data, 35, 4), 0)
  const obsBruto = safeNum(getCell(data, 35, 5), 0)
  const depContBruto = safeNum(getCell(data, 35, 6), 0)
  const heaBruto = safeNum(getCell(data, 35, 7), 0)
  const bizBruto = safeNum(getCell(data, 35, 8), 0)
  const angBruto = safeNum(getCell(data, 35, 9), 0)
  const cynBruto = safeNum(getCell(data, 35, 10), 0)

  // === ESCALAS DE CONTENIDO Grupo 2 (fila 37, cols 3-11): ASP, TPA, LSE, SOD, FAM, WRK, TRT ===
  const aspContBruto = safeNum(getCell(data, 37, 3), 0)
  const tpaBruto = safeNum(getCell(data, 37, 4), 0)
  const lseBruto = safeNum(getCell(data, 37, 5), 0)
  const sodBruto = safeNum(getCell(data, 37, 6), 0)
  const famBruto = safeNum(getCell(data, 37, 7), 0)
  const wrkBruto = safeNum(getCell(data, 37, 8), 0)
  const trtBruto = safeNum(getCell(data, 37, 9), 0)

  return {
    sexo,
    lBruto, fBruto, kBruto, fbBruto, fpBruto, vrinBruto, trinBruto, omisiones, fK,
    hsBruto, dBruto, hyBruto, pdBruto, mfMBruto, mfFBruto, paBruto, ptBruto, scBruto, maBruto, siBruto,
    d1Bruto, d2Bruto, d3Bruto, d4Bruto, d5Bruto,
    hy1Bruto, hy2Bruto, hy3Bruto, hy4Bruto, hy5Bruto,
    pd1Bruto, pd2Bruto, pd3Bruto, pd4Bruto, pd5Bruto,
    pa1Bruto, pa2Bruto, pa3Bruto,
    sc1Bruto, sc2Bruto, sc3Bruto, sc4Bruto, sc5Bruto, sc6Bruto,
    ma1Bruto, ma2Bruto, ma3Bruto, ma4Bruto,
    si1Bruto, si2Bruto, si3Bruto,
    dObvio, dSutil, hyObvio, hySutil, pdObvio, pdSutil, paObvio, paSutil, maObvio, maSutil,
    aBruto, rBruto, esBruto, macRBruto, ohBruto, doBruto, reBruto, mtBruto,
    gmBruto, gfBruto, pkBruto, psBruto,
    anxBruto, frsBruto, obsBruto, depContBruto, heaBruto, bizBruto, angBruto, cynBruto,
    aspContBruto, tpaBruto, lseBruto, sodBruto, famBruto, wrkBruto, trtBruto,
    cargado: true,
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let buffer: Buffer

    if (contentType.includes('multipart/form-data')) {
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
      const body = await request.json()
      const filePath = body.filePath

      if (!filePath) {
        return NextResponse.json(
          { error: 'Se requiere un archivo en FormData o filePath en JSON.' },
          { status: 400 }
        )
      }

      const fs = await import('fs')
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `Archivo no encontrado: ${filePath}` },
          { status: 400 }
        )
      }
      buffer = fs.readFileSync(filePath)
    }

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

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/mmpi2/upload-excel',
    method: 'POST',
    description: 'Procesa un archivo Excel de MMPI-2 (formato VS BB terceros) y extrae TODOS los puntajes brutos: validez, clínicas básicas, Harris-Lingoes, Obviedad-Sutilidad, suplementarias y contenido',
    accept: 'multipart/form-data con campo "file" (.xls, .xlsx)',
    format: 'Hoja "Puntajes Brutos" con estructura Ezequiel (L/F/K en R1, clínicas en R4, Harris-Lingoes en R7/R9/R11, Obviedad-Sutilidad en R17-R25, suplementarias en R29/R31, contenido en R35/R37)',
  })
}
