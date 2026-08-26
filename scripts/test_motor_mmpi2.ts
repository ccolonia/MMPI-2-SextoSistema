/**
 * Test end-to-end del motor MMPI-2.
 * Verifica que:
 * 1. Las tablas T carguen correctamente (todas monótonas)
 * 2. La función convertirAT funcione para M y F
 * 3. Las claves de calificación tengan los items esperados
 * 4. El flujo completo: respuestas → brutos → T → análisis funcione
 */

import { calificarMMPI2, RespuestaItem } from '../src/lib/mmpi2/calificacion'
import { convertirAT, TABLA_T_MASCULINO, TABLA_T_FEMENINO } from '../src/lib/mmpi2/tablas-conversion'
import { analizarMMPI2 } from '../src/lib/mmpi2/analyzer'
import { MMPI2Protocol } from '../src/lib/mmpi2/types'
import { obtenerClavesEscalas } from '../src/lib/mmpi2/claves-calificacion'

function checkMonotonic(tabla: Record<number, number>, nombre: string): boolean {
  const keys = Object.keys(tabla).map(Number).sort((a, b) => a - b)
  let bugs = 0
  for (let i = 1; i < keys.length; i++) {
    if (tabla[keys[i]] < tabla[keys[i - 1]]) {
      console.error(`  ❌ ${nombre}: bruto ${keys[i - 1]}->T${tabla[keys[i - 1]]}, bruto ${keys[i]}->T${tabla[keys[i]]}`)
      bugs++
    }
  }
  return bugs === 0
}

function testTablasMonotonicas() {
  console.log('\n=== TEST 1: Tablas T monótonas ===')
  let allOk = true
  for (const [escala, tabla] of Object.entries(TABLA_T_MASCULINO)) {
    if (Object.keys(tabla).length === 0) continue
    if (!checkMonotonic(tabla, `MASCULINO/${escala}`)) allOk = false
  }
  for (const [escala, tabla] of Object.entries(TABLA_T_FEMENINO)) {
    if (Object.keys(tabla).length === 0) continue
    if (!checkMonotonic(tabla, `FEMENINO/${escala}`)) allOk = false
  }
  console.log(allOk ? '  ✅ Todas las tablas son monótonas' : '  ❌ Hay violaciones de monotonicidad')
  return allOk
}

function testConversionT() {
  console.log('\n=== TEST 2: Conversión bruto → T ===')
  // Valores verificados contra PDF de Sanz (2008) y Excel de Ezequiel
  
  const casos = [
    { escala: 'Hs', bruto: 6, sexo: 'masculino' as const, esperado: 33 },  // PDF: T=33 (TS viejo mal decía 37)
    { escala: 'Hs', bruto: 6, sexo: 'femenino' as const, esperado: 30 },   // PDF: T=30 (corregido)
    { escala: 'Hs', bruto: 30, sexo: 'femenino' as const, esperado: 86 },
    { escala: 'Hy', bruto: 30, sexo: 'femenino' as const, esperado: 68 },
    { escala: 'Pd', bruto: 30, sexo: 'femenino' as const, esperado: 68 },
    { escala: 'D', bruto: 30, sexo: 'masculino' as const, esperado: 74 },  // PDF + Excel: T=74 (TS viejo mal decía 88)
    { escala: 'Pt', bruto: 30, sexo: 'masculino' as const, esperado: 57 }, // PDF: T=57 (TS viejo mal decía 91)
  ]
  
  let allOk = true
  for (const caso of casos) {
    const t = convertirAT(caso.escala, caso.bruto, caso.sexo)
    const ok = t === caso.esperado
    console.log(`  ${ok ? '✅' : '❌'} ${caso.escala}/${caso.sexo} bruto=${caso.bruto} → T=${t} (esperado ${caso.esperado})`)
    if (!ok) allOk = false
  }
  return allOk
}

function testCalificacionCompleta() {
  console.log('\n=== TEST 3: Calificación completa (567 respuestas) ===')
  // Generar 567 respuestas: todas Verdadero
  const respuestas: RespuestaItem[] = []
  for (let i = 1; i <= 567; i++) {
    respuestas.push({ numero: i, verdadero: true })
  }
  
  const resultado = calificarMMPI2(respuestas, 'masculino')
  console.log(`  Omisiones: ${resultado.omisiones}`)
  console.log(`  L bruto: ${resultado.lBruto}`)
  console.log(`  F bruto: ${resultado.fBruto}`)
  console.log(`  K bruto: ${resultado.kBruto}`)
  console.log(`  Hs bruto: ${resultado.hsBruto} (con corrección K)`)
  console.log(`  D bruto: ${resultado.dBruto}`)
  console.log(`  Pt bruto: ${resultado.ptBruto} (con corrección K)`)
  
  // Verificar que los brutos sean razonables
  const ok = resultado.omisiones === 0 && resultado.lBruto >= 0 && resultado.fBruto > 0
  console.log(`  ${ok ? '✅' : '❌'} Calificación completa exitosa`)
  return ok
}

function testAnalisisCompleto() {
  console.log('\n=== TEST 4: Análisis completo MMPI-2 ===')
  // Crear protocolo sintético con perfil elevado en D y Sc
  const protocol: MMPI2Protocol = {
    demograficos: {
      sexo: 'masculino',
      edad: 30,
      contextoEvaluacion: 'clinico',
      motivoConsulta: 'Test sintético',
      fechaEvaluacion: '2026-08-26',
      nombreEvaluado: 'Paciente Test',
      evaluador: 'Dr. Test',
    },
    omisiones: 0,
    vrint: 50,
    trint: 50,
    fBruto: 10,
    fT: 67,
    fbT: 55,
    fpBruto: 3,
    f_K: 5,
    lBruto: 3,
    kBruto: 12,
    escalasClinicas: {
      Hs: 50, D: 78, Hy: 50, Pd: 50, Mf: 50,
      Pa: 50, Pt: 60, Sc: 82, Ma: 50, Si: 50,
    },
  }
  
  const analisis = analizarMMPI2(protocol)
  
  console.log(`  Validez: ${analisis.validez.conclusionGeneral}`)
  console.log(`  Escalas elevadas: ${analisis.escalasElevadas.join(', ')}`)
  if (analisis.codigoPerfil) {
    console.log(`  Código de perfil: ${analisis.codigoPerfil.codigo} (${analisis.codigoPerfil.definicion})`)
    console.log(`  Interpretación: ${analisis.codigoPerfil.interpretacion.substring(0, 80)}...`)
  }
  console.log(`  Área afectiva: ${analisis.formulacionClinica.areasAfectadas.afectivo.substring(0, 80)}...`)
  console.log(`  Riesgos: ${analisis.formulacionClinica.riesgos.length} identificados`)
  
  // Verificar que el código de perfil sea 28/82 (D y Sc elevados)
  const codigoOk = analisis.codigoPerfil?.codigo === '28/82' || analisis.codigoPerfil?.codigo === '82/28'
  console.log(`  ${codigoOk ? '✅' : '❌'} Código de perfil correcto: ${analisis.codigoPerfil?.codigo}`)
  return codigoOk
}

function testClavesCalificacion() {
  console.log('\n=== TEST 5: Claves de calificación ===')
  const claves = obtenerClavesEscalas()
  
  // Conteos esperados según Sanz (2008)
  const esperados: Record<string, number> = {
    L: 15, F: 60, K: 30, Hs: 32, D: 57, Hy: 60, Pd: 50,
    MfM: 56, MfF: 56, Pa: 40, Pt: 48, Sc: 78, Ma: 46, Si: 69,
  }  
  let allOk = true
  for (const [nombre, esperado] of Object.entries(esperados)) {
    const clave = claves[nombre as keyof typeof claves]
    if (!clave) {
      console.error(`  ❌ ${nombre}: NO ENCONTRADA`)
      allOk = false
      continue
    }
    const total = clave.verdaderos.length + clave.falsos.length
    const ok = total === esperado
    console.log(`  ${ok ? '✅' : '❌'} ${nombre}: ${total} items (esperado ${esperado})`)
    if (!ok) allOk = false
  }
  return allOk
}

// Ejecutar todos los tests
console.log('🧪 TESTS END-TO-END DEL MOTOR MMPI-2')
console.log('='.repeat(60))

const results = [
  testTablasMonotonicas(),
  testConversionT(),
  testCalificacionCompleta(),
  testAnalisisCompleto(),
  testClavesCalificacion(),
]

const allPassed = results.every(r => r)
console.log('\n' + '='.repeat(60))
console.log(allPassed ? '🎉 TODOS LOS TESTS PASARON' : '❌ HAY TESTS FALLIDOS')
console.log('='.repeat(60))

process.exit(allPassed ? 0 : 1)
