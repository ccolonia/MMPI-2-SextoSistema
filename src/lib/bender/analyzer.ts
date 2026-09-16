// Motor de análisis del Test de Bender-Koppitz
// Criterio clínico en el código (no en el prompt)

import { BenderProtocol, BenderAnalysisResult } from './types'
import { ITEMS_CALIFICACION, INDICADORES_EMOCIONALES, DCM_TIPO_1, DCM_TIPO_2 } from './items'
import { obtenerEdadMaduracion, calcularRetraso } from './tablas'

export function analizarBender(protocol: BenderProtocol): BenderAnalysisResult {
  // === EVALUACIÓN ADAPTATIVA SEGÚN EDAD ===
  const edadAnios = protocol.demograficos.edadAnios
  const esPoblacionInfantil = edadAnios >= 5 && edadAnios <= 11

  // === EJE I: MADUREZ PERCEPTIVO-MOTRIZ ===
  
  // Calcular puntaje directo (total de errores)
  const puntajeDirecto = Object.values(protocol.items).reduce((sum, val) => sum + val, 0)
  
  // Evaluación adaptativa según edad
  let edadMaduracionEquivalente: string
  let nivelRendimientoGrado: string
  let retrasoMeses: number
  let retrasoInterpretacion: string

  if (esPoblacionInfantil) {
    // Baremos estándar de Koppitz (5 a 11 años)
    const edadMaduracion = obtenerEdadMaduracion(puntajeDirecto)
    edadMaduracionEquivalente = edadMaduracion.edad
    nivelRendimientoGrado = edadMaduracion.nivelGrado
    
    const edadCronologicaMeses = protocol.demograficos.edadAnios * 12 + protocol.demograficos.edadMeses
    const retraso = calcularRetraso(edadCronologicaMeses, puntajeDirecto)
    retrasoMeses = retraso.meses
    retrasoInterpretacion = retraso.interpretacion
  } else {
    // Protocolo para adultos / mayores de 12 años
    edadMaduracionEquivalente = 'No aplicable (Sujeto fuera de rango normativo infantil de Koppitz)'
    nivelRendimientoGrado = 'Evaluación orientada al análisis cualitativo de organicidad (DCM) y disfunción visomotriz en adultos.'
    retrasoMeses = 0
    retrasoInterpretacion = 'Los errores no se traducen en edad cronológica de retraso. El análisis se enfoca en indicadores cualitativos de organicidad y disfunción visomotriz.'
  }
  
  // Desglose por categoría de error
  const erroresPorCategoria = {
    distorsion: 0,
    rotacion: 0,
    integracion: 0,
    perseveracion: 0,
  }
  
  const erroresDetalle: BenderAnalysisResult['erroresDetalle'] = []
  
  for (const item of ITEMS_CALIFICACION) {
    if (protocol.items[item.id] === 1) {
      erroresPorCategoria[item.tipo]++
      erroresDetalle.push({
        item: item.id,
        figura: item.figura,
        tipo: item.tipo,
        descripcion: item.descripcion,
      })
    }
  }
  
  // === EJE II: DCM (DISFUNCIÓN CEREBRAL MÍNIMA) ===
  
  const dcmIndicadores: BenderAnalysisResult['dcmIndicadores'] = []
  
  // Revisar cada ítem que falló y ver si es indicador de DCM
  for (const item of ITEMS_CALIFICACION) {
    if (protocol.items[item.id] === 1 && item.significanciaDCM) {
      // Verificar si la edad del niño cumple el criterio de significancia
      const esSignificativo = !item.edadSignificancia || protocol.demograficos.edadAnios >= item.edadSignificancia
      
      if (esSignificativo) {
        const nivel = item.significanciaDCM.includes('Altamente') ? 'Altamente significativo' : 'Significativo'
        let interpretacion = ''
        
        if (item.tipo === 'rotacion') {
          interpretacion = 'Indicador de posible disfunción en el procesamiento visoespacial y orientación.'
        } else if (item.tipo === 'perseveracion') {
          interpretacion = 'Indicador de posible vulnerabilidad orgánica o dificultad en el control inhibitorio.'
        } else if (item.tipo === 'distorsion' && item.id.includes('18')) {
          interpretacion = 'Indicador de posible disfunción motora fina.'
        } else if (item.tipo === 'integracion') {
          interpretacion = 'Indicador de posible falla sintética/perceptiva.'
        } else {
          interpretacion = 'Indicador de posible disfunción neurológica.'
        }
        
        dcmIndicadores.push({
          figura: `Figura ${item.figura}`,
          item: `Ítem ${item.id}`,
          criterio: item.significanciaDCM,
          nivel,
          interpretacion,
        })
      }
    }
  }
  
  // DCM Tipo I y Tipo II (conductas observadas)
  const dcmTipo1: string[] = []
  const dcmTipo2: string[] = []
  
  if (protocol.observaciones.conductaAnclaje) {
    dcmTipo1.push('c) Uso de anclaje (poner el dedo en la tarjeta mientras copia)')
  }
  if (protocol.observaciones.tiempoMinutos > 0 && protocol.observaciones.tiempoMinutos < 4) {
    dcmTipo2.push('a) Tiempo extremadamente corto (menos de 4 min) — impulsividad')
  }
  if (protocol.observaciones.tiempoMinutos > 9) {
    dcmTipo2.push('a) Tiempo extremadamente largo (más de 9 min) — perfeccionismo o compensación')
  }
  
  const dcmPresente = dcmIndicadores.length >= 2 || (dcmIndicadores.length >= 1 && (dcmTipo1.length > 0 || dcmTipo2.length > 0))
  
  // === EJE III: INDICADORES EMOCIONALES ===
  
  const ieDetalle = protocol.indicadoresEmocionales.map(id => {
    const ie = INDICADORES_EMOCIONALES.find(e => e.id === id)
    return ie ? {
      id: ie.id,
      nombre: ie.nombre,
      definicion: ie.definicion,
      interpretacion: ie.interpretacion,
    } : null
  }).filter(Boolean) as BenderAnalysisResult['ieDetalle']
  
  const ieTotal = ieDetalle.length
  let ieSignificacion = ''
  if (ieTotal === 0) {
    ieSignificacion = 'No se identifican indicadores emocionales significativos.'
  } else if (ieTotal <= 2) {
    ieSignificacion = `Se identifican ${ieTotal} indicador(es) emocional(es). Esto refleja tendencias de personalidad pero no alcanza el umbral de significación clínica (3 o más).`
  } else {
    ieSignificacion = `Se identifican ${ieTotal} indicadores emocionales. La presencia de 3 o más indicadores se asocia en un 80% a 100% de probabilidad con desajustes emocionales significativos.`
  }
  
  // === SÍNTESIS DIAGNÓSTICA ===
  const sintesis = generarSintesis(protocol, puntajeDirecto, edadMaduracion.edad, retraso.interpretacion, dcmIndicadores, ieTotal, ieSignificacion)
  
  // === RECOMENDACIONES ===
  const recomendaciones = generarRecomendaciones(puntajeDirecto, dcmPresente, ieTotal, protocol.observaciones.tiempoMinutos)
  
  return {
    puntajeDirecto,
    edadMaduracionEquivalente: edadMaduracionEquivalente,
    nivelRendimientoGrado: nivelRendimientoGrado,
    retrasoMeses: retrasoMeses,
    retrasoInterpretacion: retrasoInterpretacion,
    erroresPorCategoria,
    erroresDetalle,
    dcmPresente,
    dcmIndicadores,
    dcmTipo1,
    dcmTipo2,
    ieTotal,
    ieDetalle,
    ieSignificacion,
    sintesis,
    recomendaciones,
  }
}

function generarSintesis(
  protocol: BenderProtocol,
  pd: number,
  edadMad: string,
  retrasoInterp: string,
  dcmInd: BenderAnalysisResult['dcmIndicadores'],
  ieTotal: number,
  ieSignif: string
): string {
  const nombre = protocol.demograficos.nombreEvaluado
  const edad = protocol.demograficos.edadCronologica
  
  let sintesis = `La evaluación mediante el Test Gestáltico Visomotor de Bender (revisión de Koppitz) revela en ${nombre} (${edad}) un puntaje directo de ${pd} errores (Edad de Maduración Equivalente: ${edadMad}). ${retrasoInterp}\n\n`
  
  if (dcmInd.length > 0) {
    sintesis += `El análisis cualitativo identifica ${dcmInd.length} indicador(es) neuropsicológico(s) compatible(s) con vulnerabilidad en el procesamiento visoespacial y control motor fino (hipótesis de DCM). `
  }
  
  if (ieTotal >= 3) {
    sintesis += `Se detecta un marcado componente emocional con ${ieTotal} indicadores emocionales, sugiriendo labilidad afectiva y baja tolerancia a la frustración. `
  } else if (ieTotal > 0) {
    sintesis += `Se detectan ${ieTotal} indicador(es) emocional(es), sugiriendo tendencias de personalidad que requieren monitoreo. `
  }
  
  if (protocol.observaciones.tiempoMinutos > 0 && protocol.observaciones.tiempoMinutos < 4) {
    sintesis += `Su ejecución apresurada (${protocol.observaciones.tiempoTotal}) evidencia un estilo de respuesta precipitado. `
  } else if (protocol.observaciones.tiempoMinutos > 9) {
    sintesis += `Su ejecución prolongada (${protocol.observaciones.tiempoTotal}) sugiere perfeccionismo o esfuerzo compensatorio. `
  }
  
  sintesis += `\n\nNota clínica: Los hallazgos deben formularse como una hipótesis que debe contrastarse con la historia clínica (antecedentes perinatales, bajo peso) y otras pruebas (WISC, Raven, HTP).`
  
  return sintesis
}

function generarRecomendaciones(pd: number, dcmPresente: boolean, ieTotal: number, tiempoMin: number): string[] {
  const recs: string[] = []
  
  // Por madurez
  if (pd >= 10) {
    recs.push('Iniciar programa de intervención en integración visomotora, coordinación ojo-mano, direccionalidad y orientación espacial.')
    recs.push('Implementar el uso de anclaje (guías visuales o marcadores de inicio) para la copia de patrones gráficos.')
  } else if (pd >= 5) {
    recs.push('Reforzar actividades de coordinación viso-motora mediante ejercicios de copia y trazado guiado.')
  }
  
  // Por DCM
  if (dcmPresente) {
    recs.push('Se sugiere realizar una valoración neuropsicológica integral de la atención y funciones ejecutivas (control inhibitorio y planificación).')
    recs.push('Descarte audiológico/visual preventivo.')
  }
  
  // Por emocional
  if (ieTotal >= 3) {
    recs.push('Trabajar técnicas de modelado para el control de la impulsividad ("pausa y revisión antes de entregar").')
    recs.push('Reforzar los esfuerzos de autocorrección y el uso del borrador como herramienta de aprendizaje.')
    recs.push('Considerar derivación a abordaje terapéutico emocional si los indicadores persisten.')
  }
  
  // Por tiempo
  if (tiempoMin > 0 && tiempoMin < 4) {
    recs.push('Fragmentar las consignas escritas complejas en pasos breves. Otorgar tiempo adicional para copiar del pizarrón.')
    recs.push('Evitar penalizar la calidad del trazo gráfico en las etapas iniciales de lectoescritura.')
  } else if (tiempoMin > 9) {
    recs.push('Fomentar el uso de etiquetas verbales (verbalizar la tarea) para mejorar la conceptualización.')
  }
  
  // Escolar
  if (pd >= 7) {
    recs.push('Las exigencias deben ajustarse a la Edad de Maduración y no al grado escolar.')
    recs.push('Considerar evaluación complementaria con WISC para descartar discrepancia CI verbal vs ejecución viso-motora.')
  }
  
  // Monitoreo
  recs.push('Se recomienda realizar aplicaciones repetidas (seguimiento) para monitorear el progreso evolutivo.')
  
  return recs
}
