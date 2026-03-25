// Motor de calificación MMPI-2
// Calcula puntajes brutos a partir de las respuestas del evaluado

import { 
  ClaveEscala, 
  PARES_VRIN, 
  PARES_TRIN_SUMAR, 
  PARES_TRIN_RESTAR,
  obtenerClavesEscalas 
} from './claves-calificacion';

export interface RespuestaItem {
  numero: number;
  verdadero: boolean | null; // null = sin responder
}

export interface ResultadoCalificacion {
  omisiones: number;
  
  // Escalas de validez
  lBruto: number;
  fBruto: number;
  kBruto: number;
  fbBruto: number;
  fpBruto: number;
  vrinBruto: number;
  trinBruto: number;
  
  // Escalas clínicas básicas
  hsBruto: number;
  dBruto: number;
  hyBruto: number;
  pdBruto: number;
  mfBruto: number;
  paBruto: number;
  ptBruto: number;
  scBruto: number;
  maBruto: number;
  siBruto: number;
  
  // Escalas suplementarias
  aBruto: number;
  rBruto: number;
  esBruto: number;
  macRBruto: number;
  ohBruto: number;
  doBruto: number;
  reBruto: number;
  mtBruto: number;
  gmBruto: number;
  gfBruto: number;
  pkBruto: number;
  psBruto: number;
  mdsBruto: number;
  apsBruto: number;
  aasBruto: number;
  
  // Escalas de contenido
  anxBruto: number;
  frsBruto: number;
  obsBruto: number;
  depContBruto: number;
  heaBruto: number;
  bizBruto: number;
  angBruto: number;
  cynBruto: number;
  aspContBruto: number;
  tpaBruto: number;
  lseBruto: number;
  sodBruto: number;
  famBruto: number;
  wrkBruto: number;
  trtBruto: number;
  
  // Subescalas Harris-Lingoes
  d1Bruto: number;
  d2Bruto: number;
  d3Bruto: number;
  d4Bruto: number;
  d5Bruto: number;
  hy1Bruto: number;
  hy2Bruto: number;
  hy3Bruto: number;
  hy4Bruto: number;
  hy5Bruto: number;
  pd1Bruto: number;
  pd2Bruto: number;
  pd3Bruto: number;
  pd4Bruto: number;
  pd5Bruto: number;
  pa1Bruto: number;
  pa2Bruto: number;
  pa3Bruto: number;
  sc1Bruto: number;
  sc2Bruto: number;
  sc3Bruto: number;
  sc4Bruto: number;
  sc5Bruto: number;
  sc6Bruto: number;
  ma1Bruto: number;
  ma2Bruto: number;
  ma3Bruto: number;
  ma4Bruto: number;
  si1Bruto: number;
  si2Bruto: number;
  si3Bruto: number;
  
  // Índices derivados
  fK: number;
}

// Función para contar ítems que puntúan en una escala
function contarPuntos(respuestas: Map<number, boolean | null>, clave: ClaveEscala): number {
  let puntos = 0;
  
  // Contar respuestas Verdadero
  for (const itemNum of clave.verdaderos) {
    const respuesta = respuestas.get(itemNum);
    if (respuesta === true) {
      puntos++;
    }
  }
  
  // Contar respuestas Falso
  for (const itemNum of clave.falsos) {
    const respuesta = respuestas.get(itemNum);
    if (respuesta === false) {
      puntos++;
    }
  }
  
  return puntos;
}

// Calcular VRIN
function calcularVrin(respuestas: Map<number, boolean | null>): number {
  let puntos = 0;
  
  for (const par of PARES_VRIN) {
    const resp1 = respuestas.get(par.item1);
    const resp2 = respuestas.get(par.item2);
    
    // Verificar si ambos ítems fueron respondidos
    if (resp1 === null || resp1 === undefined || resp2 === null || resp2 === undefined) {
      continue;
    }
    
    const dir1EsV = par.dir1 === 'V';
    const dir2EsV = par.dir2 === 'V';
    
    // Verificar si coinciden en la dirección clave
    const resp1Coincide = dir1EsV ? resp1 === true : resp1 === false;
    const resp2Coincide = dir2EsV ? resp2 === true : resp2 === false;
    
    if (resp1Coincide && resp2Coincide) {
      puntos++;
    }
  }
  
  return puntos;
}

// Calcular TRIN
function calcularTrin(respuestas: Map<number, boolean | null>): number {
  let puntos = 0;
  
  // Sumar puntos por pares V-V
  for (const par of PARES_TRIN_SUMAR) {
    const resp1 = respuestas.get(par.item1);
    const resp2 = respuestas.get(par.item2);
    
    if (resp1 === true && resp2 === true) {
      puntos++;
    }
  }
  
  // Restar puntos por pares F-F
  for (const par of PARES_TRIN_RESTAR) {
    const resp1 = respuestas.get(par.item1);
    const resp2 = respuestas.get(par.item2);
    
    if (resp1 === false && resp2 === false) {
      puntos--;
    }
  }
  
  // Sumar 9 puntos al resultado
  return puntos + 9;
}

// Función principal de calificación
export function calificarMMPI2(
  respuestas: RespuestaItem[],
  sexo: 'masculino' | 'femenino'
): ResultadoCalificacion {
  // Crear mapa de respuestas para acceso rápido
  const mapaRespuestas = new Map<number, boolean | null>();
  let omisiones = 0;
  
  for (const r of respuestas) {
    mapaRespuestas.set(r.numero, r.verdadero);
    if (r.verdadero === null) {
      omisiones++;
    }
  }
  
  // Obtener todas las claves
  const claves = obtenerClavesEscalas();
  
  // Calcular escalas de validez
  const lBruto = contarPuntos(mapaRespuestas, claves.L);
  const fBruto = contarPuntos(mapaRespuestas, claves.F);
  const kBruto = contarPuntos(mapaRespuestas, claves.K);
  const fbBruto = contarPuntos(mapaRespuestas, claves.Fb);
  const fpBruto = contarPuntos(mapaRespuestas, claves.Fp);
  const vrinBruto = calcularVrin(mapaRespuestas);
  const trinBruto = calcularTrin(mapaRespuestas);
  
  // Calcular escalas clínicas básicas
  const hsBrutoSinCorregir = contarPuntos(mapaRespuestas, claves.Hs);
  const dBruto = contarPuntos(mapaRespuestas, claves.D);
  const hyBruto = contarPuntos(mapaRespuestas, claves.Hy);
  const pdBrutoSinCorregir = contarPuntos(mapaRespuestas, claves.Pd);
  const mfBruto = sexo === 'masculino' 
    ? contarPuntos(mapaRespuestas, claves.MfM)
    : contarPuntos(mapaRespuestas, claves.MfF);
  const paBruto = contarPuntos(mapaRespuestas, claves.Pa);
  const ptBrutoSinCorregir = contarPuntos(mapaRespuestas, claves.Pt);
  const scBrutoSinCorregir = contarPuntos(mapaRespuestas, claves.Sc);
  const maBrutoSinCorregir = contarPuntos(mapaRespuestas, claves.Ma);
  const siBruto = contarPuntos(mapaRespuestas, claves.Si);
  
  // Aplicar correcciones K
  const hsBruto = hsBrutoSinCorregir + Math.round(kBruto * 0.5);
  const pdBruto = pdBrutoSinCorregir + Math.round(kBruto * 0.4);
  const ptBruto = ptBrutoSinCorregir + kBruto;
  const scBruto = scBrutoSinCorregir + kBruto;
  const maBruto = maBrutoSinCorregir + Math.round(kBruto * 0.2);
  
  // Calcular escalas suplementarias
  const aBruto = contarPuntos(mapaRespuestas, claves.A);
  const rBruto = contarPuntos(mapaRespuestas, claves.R);
  const esBruto = contarPuntos(mapaRespuestas, claves.Es);
  const macRBruto = contarPuntos(mapaRespuestas, claves.MACR);
  const ohBruto = contarPuntos(mapaRespuestas, claves.OH);
  const doBruto = contarPuntos(mapaRespuestas, claves.Do);
  const reBruto = contarPuntos(mapaRespuestas, claves.Re);
  const mtBruto = contarPuntos(mapaRespuestas, claves.Mt);
  const gmBruto = contarPuntos(mapaRespuestas, claves.GM);
  const gfBruto = contarPuntos(mapaRespuestas, claves.GF);
  const pkBruto = contarPuntos(mapaRespuestas, claves.PK);
  const psBruto = contarPuntos(mapaRespuestas, claves.PS);
  const mdsBruto = contarPuntos(mapaRespuestas, claves.MDS);
  const apsBruto = contarPuntos(mapaRespuestas, claves.APS);
  const aasBruto = contarPuntos(mapaRespuestas, claves.AAS);
  
  // Calcular escalas de contenido
  const anxBruto = contarPuntos(mapaRespuestas, claves.ANX);
  const frsBruto = contarPuntos(mapaRespuestas, claves.FRS);
  const obsBruto = contarPuntos(mapaRespuestas, claves.OBS);
  const depContBruto = contarPuntos(mapaRespuestas, claves.DEP_CONT);
  const heaBruto = contarPuntos(mapaRespuestas, claves.HEA);
  const bizBruto = contarPuntos(mapaRespuestas, claves.BIZ);
  const angBruto = contarPuntos(mapaRespuestas, claves.ANG);
  const cynBruto = contarPuntos(mapaRespuestas, claves.CYN);
  const aspContBruto = contarPuntos(mapaRespuestas, claves.ASP_CONT);
  const tpaBruto = contarPuntos(mapaRespuestas, claves.TPA);
  const lseBruto = contarPuntos(mapaRespuestas, claves.LSE);
  const sodBruto = contarPuntos(mapaRespuestas, claves.SOD);
  const famBruto = contarPuntos(mapaRespuestas, claves.FAM);
  const wrkBruto = contarPuntos(mapaRespuestas, claves.WRK);
  const trtBruto = contarPuntos(mapaRespuestas, claves.TRT);
  
  // Calcular subescalas Harris-Lingoes
  const d1Bruto = contarPuntos(mapaRespuestas, claves.D1);
  const d2Bruto = contarPuntos(mapaRespuestas, claves.D2);
  const d3Bruto = contarPuntos(mapaRespuestas, claves.D3);
  const d4Bruto = contarPuntos(mapaRespuestas, claves.D4);
  const d5Bruto = contarPuntos(mapaRespuestas, claves.D5);
  const hy1Bruto = contarPuntos(mapaRespuestas, claves.Hy1);
  const hy2Bruto = contarPuntos(mapaRespuestas, claves.Hy2);
  const hy3Bruto = contarPuntos(mapaRespuestas, claves.Hy3);
  const hy4Bruto = contarPuntos(mapaRespuestas, claves.Hy4);
  const hy5Bruto = contarPuntos(mapaRespuestas, claves.Hy5);
  const pd1Bruto = contarPuntos(mapaRespuestas, claves.Pd1);
  const pd2Bruto = contarPuntos(mapaRespuestas, claves.Pd2);
  const pd3Bruto = contarPuntos(mapaRespuestas, claves.Pd3);
  const pd4Bruto = contarPuntos(mapaRespuestas, claves.Pd4);
  const pd5Bruto = contarPuntos(mapaRespuestas, claves.Pd5);
  const pa1Bruto = contarPuntos(mapaRespuestas, claves.Pa1);
  const pa2Bruto = contarPuntos(mapaRespuestas, claves.Pa2);
  const pa3Bruto = contarPuntos(mapaRespuestas, claves.Pa3);
  const sc1Bruto = contarPuntos(mapaRespuestas, claves.Sc1);
  const sc2Bruto = contarPuntos(mapaRespuestas, claves.Sc2);
  const sc3Bruto = contarPuntos(mapaRespuestas, claves.Sc3);
  const sc4Bruto = contarPuntos(mapaRespuestas, claves.Sc4);
  const sc5Bruto = contarPuntos(mapaRespuestas, claves.Sc5);
  const sc6Bruto = contarPuntos(mapaRespuestas, claves.Sc6);
  const ma1Bruto = contarPuntos(mapaRespuestas, claves.Ma1);
  const ma2Bruto = contarPuntos(mapaRespuestas, claves.Ma2);
  const ma3Bruto = contarPuntos(mapaRespuestas, claves.Ma3);
  const ma4Bruto = contarPuntos(mapaRespuestas, claves.Ma4);
  const si1Bruto = contarPuntos(mapaRespuestas, claves.Si1);
  const si2Bruto = contarPuntos(mapaRespuestas, claves.Si2);
  const si3Bruto = contarPuntos(mapaRespuestas, claves.Si3);
  
  // Calcular índice F-K
  const fK = fBruto - kBruto;
  
  return {
    omisiones,
    lBruto,
    fBruto,
    kBruto,
    fbBruto,
    fpBruto,
    vrinBruto,
    trinBruto,
    hsBruto,
    dBruto,
    hyBruto,
    pdBruto,
    mfBruto,
    paBruto,
    ptBruto,
    scBruto,
    maBruto,
    siBruto,
    aBruto,
    rBruto,
    esBruto,
    macRBruto,
    ohBruto,
    doBruto,
    reBruto,
    mtBruto,
    gmBruto,
    gfBruto,
    pkBruto,
    psBruto,
    mdsBruto,
    apsBruto,
    aasBruto,
    anxBruto,
    frsBruto,
    obsBruto,
    depContBruto,
    heaBruto,
    bizBruto,
    angBruto,
    cynBruto,
    aspContBruto,
    tpaBruto,
    lseBruto,
    sodBruto,
    famBruto,
    wrkBruto,
    trtBruto,
    d1Bruto,
    d2Bruto,
    d3Bruto,
    d4Bruto,
    d5Bruto,
    hy1Bruto,
    hy2Bruto,
    hy3Bruto,
    hy4Bruto,
    hy5Bruto,
    pd1Bruto,
    pd2Bruto,
    pd3Bruto,
    pd4Bruto,
    pd5Bruto,
    pa1Bruto,
    pa2Bruto,
    pa3Bruto,
    sc1Bruto,
    sc2Bruto,
    sc3Bruto,
    sc4Bruto,
    sc5Bruto,
    sc6Bruto,
    ma1Bruto,
    ma2Bruto,
    ma3Bruto,
    ma4Bruto,
    si1Bruto,
    si2Bruto,
    si3Bruto,
    fK,
  };
}
