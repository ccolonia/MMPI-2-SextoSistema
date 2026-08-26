import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

/**
 * Lee un archivo Excel de MMPI-2 (formato VS BB terceros Ezequiel) y extrae:
 * - Puntajes brutos desde la hoja "Puntajes Brutos"
 * - Puntajes T desde la hoja "Puntajes T" (ya calculados por el Excel de Ezequiel)
 *
 * Esto garantiza que los T coincidan exactamente con el informe de referencia,
 * ya que usan los mismos valores que el Excel original.
 *
 * Estructura hoja "Puntajes Brutos":
 *   R1: L, F, K (brutos) + omisiones (col 8)
 *   R4: Hs, D, Hy, Pd, MfM, MfF, Pa, Pt, Sc, Ma (brutos)
 *   R7: D1-D5, Pa1-Pa3, Si1-Si3 (Harris-Lingoes brutos)
 *   R9: Hy1-Hy5, Ma1-Ma4
 *   R11: Pd1-Pd5, Sc1-Sc6
 *   R17,19,21,23,25: Obviedad-Sutilidad (D, Hy, Pd, Pa, Ma)
 *   R29: A, R, Es, MAC-R, O-H, Do, Re, Mt (suplementarias)
 *   R31: GM, GF, PK, PS, F(p), Fb, VRIN, TRIN
 *   R35: ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN (contenido)
 *   R37: ASP, TPA, LSE, SOD, FAM, WRK, TRT
 *
 * Estructura hoja "Puntajes T":
 *   R1: L, F, K (brutos)
 *   R2: L, F, K (T)
 *   R5: Hs, D, Hy, Pd, MfM, MfF, Pa, Pt, Sc, Ma, Si (brutos)
 *   R6: T de las clínicas básicas
 *   R10,13,16: brutos Harris-Lingoes
 *   R11,14,17: T de Harris-Lingoes
 */

interface ResultadoMMPI2 {
  sexo: 'masculino' | 'femenino'

  // === ESCALAS DE VALIDEZ (brutos) ===
  lBruto: number; lT: number
  fBruto: number; fT: number
  kBruto: number; kT: number
  fbBruto: number; fbT: number
  fpBruto: number; fpT: number  // F(p)
  vrinBruto: number; vrinT: number
  trinBruto: number; trinT: number
  omisiones: number
  fK: number  // F - K

  // === ESCALAS CLÍNICAS BÁSICAS (brutos + T) ===
  hsBruto: number; hsT: number
  dBruto: number; dT: number
  hyBruto: number; hyT: number
  pdBruto: number; pdT: number
  mfMBruto: number; mfMT: number  // Mf masculino
  mfFBruto: number; mfFT: number  // Mf femenino
  paBruto: number; paT: number
  ptBruto: number; ptT: number
  scBruto: number; scT: number
  maBruto: number; maT: number
  siBruto: number; siT: number

  // === SUBESCALAS HARRIS-LINGOES (brutos + T) ===
  d1Bruto: number; d1T: number
  d2Bruto: number; d2T: number
  d3Bruto: number; d3T: number
  d4Bruto: number; d4T: number
  d5Bruto: number; d5T: number
  hy1Bruto: number; hy1T: number
  hy2Bruto: number; hy2T: number
  hy3Bruto: number; hy3T: number
  hy4Bruto: number; hy4T: number
  hy5Bruto: number; hy5T: number
  pd1Bruto: number; pd1T: number
  pd2Bruto: number; pd2T: number
  pd3Bruto: number; pd3T: number
  pd4Bruto: number; pd4T: number
  pd5Bruto: number; pd5T: number
  pa1Bruto: number; pa1T: number
  pa2Bruto: number; pa2T: number
  pa3Bruto: number; pa3T: number
  sc1Bruto: number; sc1T: number
  sc2Bruto: number; sc2T: number
  sc3Bruto: number; sc3T: number
  sc4Bruto: number; sc4T: number
  sc5Bruto: number; sc5T: number
  sc6Bruto: number; sc6T: number
  ma1Bruto: number; ma1T: number
  ma2Bruto: number; ma2T: number
  ma3Bruto: number; ma3T: number
  ma4Bruto: number; ma4T: number
  si1Bruto: number; si1T: number
  si2Bruto: number; si2T: number
  si3Bruto: number; si3T: number

  // === RAZONES OBVIEDAD-SUTILIDAD (brutos) ===
  dObvio: number; dSutil: number
  hyObvio: number; hySutil: number
  pdObvio: number; pdSutil: number
  paObvio: number; paSutil: number
  maObvio: number; maSutil: number

  // === ESCALAS SUPLEMENTARIAS (brutos + T) ===
  aBruto: number; aT: number
  rBruto: number; rT: number
  esBruto: number; esT: number
  macRBruto: number; macRT: number
  ohBruto: number; ohT: number  // O-H
  doBruto: number; doT: number
  reBruto: number; reT: number
  mtBruto: number; mtT: number
  gmBruto: number
  gfBruto: number
  pkBruto: number
  psBruto: number

  // === ESCALAS DE CONTENIDO (brutos + T) ===
  anxBruto: number; anxT: number
  frsBruto: number; frsT: number
  obsBruto: number; obsT: number
  depContBruto: number; depContT: number
  heaBruto: number; heaT: number
  bizBruto: number; bizT: number
  angBruto: number; angT: number
  cynBruto: number; cynT: number
  aspContBruto: number; aspContT: number
  tpaBruto: number; tpaT: number
  lseBruto: number; lseT: number
  sodBruto: number; sodT: number
  famBruto: number; famT: number
  wrkBruto: number; wrkT: number
  trtBruto: number; trtT: number

  cargado: boolean
}

function safeNum(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  return isNaN(num) ? defaultValue : num
}

function getCell(data: any[][], row: number, col: number): any {
  if (row >= data.length) return null
  if (col >= data[row].length) return null
  return data[row][col]
}

function parseExcel(buffer: Buffer): ResultadoMMPI2 {
  const workbook = XLSX.read(buffer, { type: 'buffer' })

  // === Hoja "Puntajes Brutos" ===
  const sheetBrutosName = workbook.SheetNames.includes('Puntajes Brutos')
    ? 'Puntajes Brutos'
    : workbook.SheetNames[0]
  const wsBrutos = workbook.Sheets[sheetBrutosName]
  const brutos = XLSX.utils.sheet_to_json<any[]>(wsBrutos, { header: 1, defval: null })

  // === Hoja "Puntajes T" (con T ya calculados) ===
  const sheetTName = workbook.SheetNames.includes('Puntajes T')
    ? 'Puntajes T'
    : null
  let puntajesT: any[][] = []
  if (sheetTName) {
    const wsT = workbook.Sheets[sheetTName]
    puntajesT = XLSX.utils.sheet_to_json<any[]>(wsT, { header: 1, defval: null })
  }

  if (brutos.length < 38) {
    throw new Error('El archivo no tiene suficientes filas en la hoja Puntajes Brutos')
  }

  const sexo: 'masculino' | 'femenino' = 'masculino'

  // === ESCALAS DE VALIDEZ (brutos desde Puntajes Brutos R1) ===
  const lBruto = safeNum(getCell(brutos, 1, 3), 0)
  const fBruto = safeNum(getCell(brutos, 1, 4), 0)
  const kBruto = safeNum(getCell(brutos, 1, 5), 0)
  const omisiones = safeNum(getCell(brutos, 1, 8), 0)
  // F-K se calcula correctamente abajo (el Excel lo tiene invertido)

  // T de validez desde Puntajes T R2 (cols 0, 1, 2)
  const lT = puntajesT.length > 2 ? safeNum(getCell(puntajesT, 2, 0), 50) : 50
  const fT = puntajesT.length > 2 ? safeNum(getCell(puntajesT, 2, 1), 50) : 50
  const kT = puntajesT.length > 2 ? safeNum(getCell(puntajesT, 2, 2), 50) : 50

  // === ESCALAS CLÍNICAS BÁSICAS ===
  // Brutos desde Puntajes Brutos R4 (cols 3-13)
  const hsBruto = safeNum(getCell(brutos, 4, 3), 0)
  const dBruto = safeNum(getCell(brutos, 4, 4), 0)
  const hyBruto = safeNum(getCell(brutos, 4, 5), 0)
  const pdBruto = safeNum(getCell(brutos, 4, 6), 0)
  const mfMBruto = safeNum(getCell(brutos, 4, 7), 0)
  const mfFBruto = safeNum(getCell(brutos, 4, 8), 0)
  const paBruto = safeNum(getCell(brutos, 4, 9), 0)
  const ptBruto = safeNum(getCell(brutos, 4, 10), 0)
  const scBruto = safeNum(getCell(brutos, 4, 11), 0)
  const maBruto = safeNum(getCell(brutos, 4, 12), 0)
  const siBruto = safeNum(getCell(brutos, 4, 13), 0)

  // T desde Puntajes T R6 (cols 0-10: Hs, D, Hy, Pd, MfM, MfF, Pa, Pt, Sc, Ma, Si)
  const hsT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 0), 50) : 50
  const dT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 1), 50) : 50
  const hyT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 2), 50) : 50
  const pdT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 3), 50) : 50
  const mfMT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 4), 50) : 50
  const mfFT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 5), 50) : 50
  const paT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 6), 50) : 50
  const ptT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 7), 50) : 50
  const scT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 8), 50) : 50
  const maT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 9), 50) : 50
  const siT = puntajesT.length > 6 ? safeNum(getCell(puntajesT, 6, 10), 50) : 50

  // === HARRIS-LINGOES Grupo 1 (D1-D5, Pa1-Pa3, Si1-Si3) ===
  // Brutos: Puntajes Brutos R7 (cols 3-13)
  // T: Puntajes T R11 (cols 0-10)
  const d1Bruto = safeNum(getCell(brutos, 7, 3), 0)
  const d2Bruto = safeNum(getCell(brutos, 7, 4), 0)
  const d3Bruto = safeNum(getCell(brutos, 7, 5), 0)
  const d4Bruto = safeNum(getCell(brutos, 7, 6), 0)
  const d5Bruto = safeNum(getCell(brutos, 7, 7), 0)
  const pa1Bruto = safeNum(getCell(brutos, 7, 8), 0)
  const pa2Bruto = safeNum(getCell(brutos, 7, 9), 0)
  const pa3Bruto = safeNum(getCell(brutos, 7, 10), 0)
  const si1Bruto = safeNum(getCell(brutos, 7, 11), 0)
  const si2Bruto = safeNum(getCell(brutos, 7, 12), 0)
  const si3Bruto = safeNum(getCell(brutos, 7, 13), 0)

  const d1T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 0), 50) : 50
  const d2T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 1), 50) : 50
  const d3T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 2), 50) : 50
  const d4T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 3), 50) : 50
  const d5T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 4), 50) : 50
  const pa1T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 5), 50) : 50
  const pa2T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 6), 50) : 50
  const pa3T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 7), 50) : 50
  const si1T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 8), 50) : 50
  const si2T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 9), 50) : 50
  const si3T = puntajesT.length > 11 ? safeNum(getCell(puntajesT, 11, 10), 50) : 50

  // === HARRIS-LINGOES Grupo 2 (Hy1-Hy5, Ma1-Ma4) ===
  // Brutos: Puntajes Brutos R9 (cols 3-11)
  // T: Puntajes T R14 (cols 0-8)
  const hy1Bruto = safeNum(getCell(brutos, 9, 3), 0)
  const hy2Bruto = safeNum(getCell(brutos, 9, 4), 0)
  const hy3Bruto = safeNum(getCell(brutos, 9, 5), 0)
  const hy4Bruto = safeNum(getCell(brutos, 9, 6), 0)
  const hy5Bruto = safeNum(getCell(brutos, 9, 7), 0)
  const ma1Bruto = safeNum(getCell(brutos, 9, 8), 0)
  const ma2Bruto = safeNum(getCell(brutos, 9, 9), 0)
  const ma3Bruto = safeNum(getCell(brutos, 9, 10), 0)
  const ma4Bruto = safeNum(getCell(brutos, 9, 11), 0)

  const hy1T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 0), 50) : 50
  const hy2T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 1), 50) : 50
  const hy3T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 2), 50) : 50
  const hy4T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 3), 50) : 50
  const hy5T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 4), 50) : 50
  const ma1T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 5), 50) : 50
  const ma2T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 6), 50) : 50
  const ma3T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 7), 50) : 50
  const ma4T = puntajesT.length > 14 ? safeNum(getCell(puntajesT, 14, 8), 50) : 50

  // === HARRIS-LINGOES Grupo 3 (Pd1-Pd5, Sc1-Sc6) ===
  // Brutos: Puntajes Brutos R11 (cols 3-13)
  // T: Puntajes T R17 (cols 0-10)
  const pd1Bruto = safeNum(getCell(brutos, 11, 3), 0)
  const pd2Bruto = safeNum(getCell(brutos, 11, 4), 0)
  const pd3Bruto = safeNum(getCell(brutos, 11, 5), 0)
  const pd4Bruto = safeNum(getCell(brutos, 11, 6), 0)
  const pd5Bruto = safeNum(getCell(brutos, 11, 7), 0)
  const sc1Bruto = safeNum(getCell(brutos, 11, 8), 0)
  const sc2Bruto = safeNum(getCell(brutos, 11, 9), 0)
  const sc3Bruto = safeNum(getCell(brutos, 11, 10), 0)
  const sc4Bruto = safeNum(getCell(brutos, 11, 11), 0)
  const sc5Bruto = safeNum(getCell(brutos, 11, 12), 0)
  const sc6Bruto = safeNum(getCell(brutos, 11, 13), 0)

  const pd1T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 0), 50) : 50
  const pd2T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 1), 50) : 50
  const pd3T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 2), 50) : 50
  const pd4T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 3), 50) : 50
  const pd5T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 4), 50) : 50
  const sc1T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 5), 50) : 50
  const sc2T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 6), 50) : 50
  const sc3T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 7), 50) : 50
  const sc4T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 8), 50) : 50
  const sc5T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 9), 50) : 50
  const sc6T = puntajesT.length > 17 ? safeNum(getCell(puntajesT, 17, 10), 50) : 50

  // === RAZONES OBVIEDAD-SUTILIDAD ===
  const dObvio = safeNum(getCell(brutos, 17, 3), 0)
  const dSutil = safeNum(getCell(brutos, 17, 4), 0)
  const hyObvio = safeNum(getCell(brutos, 19, 3), 0)
  const hySutil = safeNum(getCell(brutos, 19, 4), 0)
  const pdObvio = safeNum(getCell(brutos, 21, 3), 0)
  const pdSutil = safeNum(getCell(brutos, 21, 4), 0)
  const paObvio = safeNum(getCell(brutos, 23, 3), 0)
  const paSutil = safeNum(getCell(brutos, 23, 4), 0)
  const maObvio = safeNum(getCell(brutos, 25, 3), 0)
  const maSutil = safeNum(getCell(brutos, 25, 4), 0)

  // === ESCALAS SUPLEMENTARIAS (brutos desde Puntajes Brutos R29/R31) ===
  const aBruto = safeNum(getCell(brutos, 29, 3), 0)
  const rBruto = safeNum(getCell(brutos, 29, 4), 0)
  const esBruto = safeNum(getCell(brutos, 29, 5), 0)
  const macRBruto = safeNum(getCell(brutos, 29, 6), 0)
  const ohBruto = safeNum(getCell(brutos, 29, 7), 0)
  const doBruto = safeNum(getCell(brutos, 29, 8), 0)
  const reBruto = safeNum(getCell(brutos, 29, 9), 0)
  const mtBruto = safeNum(getCell(brutos, 29, 10), 0)

  const gmBruto = safeNum(getCell(brutos, 31, 3), 0)
  const gfBruto = safeNum(getCell(brutos, 31, 4), 0)
  const pkBruto = safeNum(getCell(brutos, 31, 5), 0)
  const psBruto = safeNum(getCell(brutos, 31, 6), 0)
  const fpBruto = safeNum(getCell(brutos, 31, 8), 0)
  const fbBruto = safeNum(getCell(brutos, 31, 9), 0)
  const vrinBruto = safeNum(getCell(brutos, 31, 10), 0)
  const trinBruto = safeNum(getCell(brutos, 31, 11), 0)

  // === T REALES de validez adicional desde Puntajes T R39 ===
  // R37: headers: GM, GF, PK, PS, _, _, F(p), Fb, VRIN, TRIN
  // R38: brutos
  // R39: T values
  // Cols: 0=GM, 1=GF, 2=PK, 3=PS, 6=F(p), 7=Fb, 8=VRIN, 9=TRIN
  const fpT = puntajesT.length > 39 ? safeNum(getCell(puntajesT, 39, 6), 50) : 50
  const fbT = puntajesT.length > 39 ? safeNum(getCell(puntajesT, 39, 7), 50) : 50
  const vrinT = puntajesT.length > 39 ? safeNum(getCell(puntajesT, 39, 8), 50) : 50
  const trinT = puntajesT.length > 39 ? safeNum(getCell(puntajesT, 39, 9), 50) : 50

  // === ESCALAS DE CONTENIDO (brutos desde Puntajes Brutos R35/R37) ===
  const anxBruto = safeNum(getCell(brutos, 35, 3), 0)
  const frsBruto = safeNum(getCell(brutos, 35, 4), 0)
  const obsBruto = safeNum(getCell(brutos, 35, 5), 0)
  const depContBruto = safeNum(getCell(brutos, 35, 6), 0)
  const heaBruto = safeNum(getCell(brutos, 35, 7), 0)
  const bizBruto = safeNum(getCell(brutos, 35, 8), 0)
  const angBruto = safeNum(getCell(brutos, 35, 9), 0)
  const cynBruto = safeNum(getCell(brutos, 35, 10), 0)

  const aspContBruto = safeNum(getCell(brutos, 37, 3), 0)
  const tpaBruto = safeNum(getCell(brutos, 37, 4), 0)
  const lseBruto = safeNum(getCell(brutos, 37, 5), 0)
  const sodBruto = safeNum(getCell(brutos, 37, 6), 0)
  const famBruto = safeNum(getCell(brutos, 37, 7), 0)
  const wrkBruto = safeNum(getCell(brutos, 37, 8), 0)
  const trtBruto = safeNum(getCell(brutos, 37, 9), 0)

  // === T REALES de escalas de contenido desde Puntajes T R44 y R48 ===
  // R42: ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN (cols 0-7)
  // R43: brutos
  // R44: T values (cols 0-7)
  const anxT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 0), 50) : 50
  const frsT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 1), 50) : 50
  const obsT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 2), 50) : 50
  const depContT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 3), 50) : 50
  const heaT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 4), 50) : 50
  const bizT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 5), 50) : 50
  const angT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 6), 50) : 50
  const cynT = puntajesT.length > 44 ? safeNum(getCell(puntajesT, 44, 7), 50) : 50

  // R46: ASP, TPA, LSE, SOD, FAM, WRK, TRT (cols 0-6)
  // R47: brutos
  // R48: T values (cols 0-6)
  const aspContT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 0), 50) : 50
  const tpaT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 1), 50) : 50
  const lseT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 2), 50) : 50
  const sodT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 3), 50) : 50
  const famT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 4), 50) : 50
  const wrkT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 5), 50) : 50
  const trtT = puntajesT.length > 48 ? safeNum(getCell(puntajesT, 48, 6), 50) : 50

  // === T REALES de escalas suplementarias desde Puntajes T R60 ===
  // R59: A, R, Es, MAC-R, O-H, Do, Re, Mt, GM, GF, PK, PS (cols 0-11)
  // R60: T values
  const aT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 0), 50) : 50
  const rT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 1), 50) : 50
  const esT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 2), 50) : 50
  const macRT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 3), 50) : 50
  const ohT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 4), 50) : 50
  const doT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 5), 50) : 50
  const reT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 6), 50) : 50
  const mtT = puntajesT.length > 60 ? safeNum(getCell(puntajesT, 60, 7), 50) : 50

  // === CORRECCIÓN F-K ===
  // El Excel reporta F-K = 9 (positivo) pero el cálculo correcto es F-K = fBruto - kBruto
  // Para Ezequiel: F=7, K=16, entonces F-K = 7-16 = -9 (negativo)
  // El valor del Excel parece ser K-F, no F-K. Calculamos el correcto.
  const fK_correcto = fBruto - kBruto

  return {
    sexo,
    lBruto, lT, fBruto, fT, kBruto, kT, fbBruto, fbT, fpBruto, fpT, vrinBruto, vrinT, trinBruto, trinT,
    omisiones, fK: fK_correcto,  // Usar cálculo correcto, no el del Excel
    hsBruto, hsT, dBruto, dT, hyBruto, hyT, pdBruto, pdT,
    mfMBruto, mfMT, mfFBruto, mfFT,
    paBruto, paT, ptBruto, ptT, scBruto, scT, maBruto, maT, siBruto, siT,
    d1Bruto, d1T, d2Bruto, d2T, d3Bruto, d3T, d4Bruto, d4T, d5Bruto, d5T,
    hy1Bruto, hy1T, hy2Bruto, hy2T, hy3Bruto, hy3T, hy4Bruto, hy4T, hy5Bruto, hy5T,
    pd1Bruto, pd1T, pd2Bruto, pd2T, pd3Bruto, pd3T, pd4Bruto, pd4T, pd5Bruto, pd5T,
    pa1Bruto, pa1T, pa2Bruto, pa2T, pa3Bruto, pa3T,
    sc1Bruto, sc1T, sc2Bruto, sc2T, sc3Bruto, sc3T, sc4Bruto, sc4T, sc5Bruto, sc5T, sc6Bruto, sc6T,
    ma1Bruto, ma1T, ma2Bruto, ma2T, ma3Bruto, ma3T, ma4Bruto, ma4T,
    si1Bruto, si1T, si2Bruto, si2T, si3Bruto, si3T,
    dObvio, dSutil, hyObvio, hySutil, pdObvio, pdSutil, paObvio, paSutil, maObvio, maSutil,
    // Suplementarias con T reales
    aBruto, aT, rBruto, rT, esBruto, esT, macRBruto, macRT, ohBruto, ohT, doBruto, doT, reBruto, reT, mtBruto, mtT,
    gmBruto, gfBruto, pkBruto, psBruto,
    // Contenido con T reales
    anxBruto, anxT, frsBruto, frsT, obsBruto, obsT, depContBruto, depContT,
    heaBruto, heaT, bizBruto, bizT, angBruto, angT, cynBruto, cynT,
    aspContBruto, aspContT, tpaBruto, tpaT, lseBruto, lseT, sodBruto, sodT,
    famBruto, famT, wrkBruto, wrkT, trtBruto, trtT,
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
    description: 'Procesa un archivo Excel de MMPI-2 (formato VS BB terceros Ezequiel) y extrae brutos Y T calculados desde las hojas "Puntajes Brutos" y "Puntajes T"',
    accept: 'multipart/form-data con campo "file" (.xls, .xlsx)',
    notas: 'Los T de escalas clínicas, validez y Harris-Lingoes se leen directamente de la hoja "Puntajes T" del Excel. Los T de suplementarias y contenido se calculan con fórmula aproximada (no hay tablas T completas en el código).',
  })
}
