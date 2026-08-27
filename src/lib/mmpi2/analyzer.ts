// Motor de análisis MMPI-2
// Implementación del procedimiento estandarizado según guía de Sanz (2008)

import {
  MMPI2Protocol,
  ValidityAnalysis,
  ClinicalScaleInterpretation,
  ProfileCode,
  MMPI2AnalysisResult,
  UMBRALES,
  NOMBRES_ESCALAS,
  DESCRIPCIONES_ESCALAS,
  CORRELATOS_EMPERICOS,
} from './types';

// FASE 1: Análisis de Validez del Protocolo
export function analizarValidez(protocol: MMPI2Protocol): ValidityAnalysis {
  const {
    omisiones,
    vrint,
    trint,
    fT,
    fbT,
    fpBruto,
    f_K,
    lBruto,
    kBruto,
  } = protocol;

  // 1. Análisis de omisiones
  let omisionesStatus: ValidityAnalysis['omisionesStatus'];
  let omisionesMensaje: string;
  
  if (omisiones <= UMBRALES.OMISIONES.CONFIABLE) {
    omisionesStatus = 'confiable';
    omisionesMensaje = `${omisiones} omisiones: Protocolo confiable para interpretación.`;
  } else if (omisiones <= UMBRALES.OMISIONES.CON_PRECAUCION) {
    omisionesStatus = 'confiable_precaucion';
    omisionesMensaje = `${omisiones} omisiones: Protocolo confiable con precaución. Interpretar con reservas.`;
  } else if (omisiones <= UMBRALES.OMISIONES.DUDOSO) {
    omisionesStatus = 'dudoso';
    omisionesMensaje = `${omisiones} omisiones: Validez del protocolo dudosa. Resultados cuestionables.`;
  } else {
    omisionesStatus = 'invalido';
    omisionesMensaje = `${omisiones} omisiones: Protocolo probablemente inválido por exceso de omisiones.`;
  }

  // 2. VRIN - Consistencia variable
  let vrinStatus: ValidityAnalysis['vrinStatus'];
  let vrinMensaje: string;
  
  if (vrint > 65) {
    vrinStatus = 'inconsistente';
    vrinMensaje = `VRIN T=${vrint}: Inconsistencia en las respuestas. El evaluado respondió de manera contradictoria a ítems similares.`;
  } else {
    vrinStatus = 'normal';
    vrinMensaje = `VRIN T=${vrint}: Consistencia adecuada en las respuestas.`;
  }

  // 3. TRIN - Tendencia de respuesta
  let trinStatus: ValidityAnalysis['trinStatus'];
  let trinMensaje: string;
  
  if (trint > 80) {
    trinStatus = 'aquiescente';
    trinMensaje = `TRIN T=${trint}: Tendencia aquiescente marcada. El evaluado tiende a responder "verdadero" indiscriminadamente.`;
  } else if (trint < 50) {
    trinStatus = 'negador';
    trinMensaje = `TRIN T=${trint}: Tendencia negadora. El evaluado tiende a responder "falso" indiscriminadamente.`;
  } else {
    trinStatus = 'normal';
    trinMensaje = `TRIN T=${trint}: Sin tendencia de respuesta significativa.`;
  }

  // 4. Escala F
  let fStatus: ValidityAnalysis['fStatus'];
  let fMensaje: string;
  
  if (fT >= UMBRALES.T_INVALIDO) {
    fStatus = 'invalido';
    fMensaje = `F T=${fT}: Protocolo probablemente inválido. Puntuación extrema sugiere respuestas aleatorias o simulación severa.`;
  } else if (fT >= UMBRALES.T_MUY_ELEVADO) {
    fStatus = 'muy_elevado';
    fMensaje = `F T=${fT}: Puntuación muy elevada. Posible exageración de síntomas, respuesta al azar, o psicopatología severa.`;
  } else if (fT >= UMBRALES.T_ELEVADO) {
    fStatus = 'elevado';
    fMensaje = `F T=${fT}: Puntuación elevada. Indica posible malestar psicológico significativo o tendencia a exagerar.`;
  } else {
    fStatus = 'normal';
    fMensaje = `F T=${fT}: Puntuación dentro de límites normales.`;
  }

  // 5. Escala Fb
  let fbStatus: ValidityAnalysis['fbStatus'];
  let fbMensaje: string;
  
  if (fbT >= UMBRALES.T_INVALIDO) {
    fbStatus = 'invalido';
    fbMensaje = `Fb T=${fbT}: Segmento posterior del protocolo probablemente inválido.`;
  } else if (fbT >= UMBRALES.T_MUY_ELEVADO) {
    fbStatus = 'muy_elevado';
    fbMensaje = `Fb T=${fbT}: Segmento posterior muy elevado. Evaluar validez de escalas de contenido.`;
  } else if (fbT >= UMBRALES.T_ELEVADO) {
    fbStatus = 'elevado';
    fbMensaje = `Fb T=${fbT}: Segmento posterior elevado.`;
  } else {
    fbStatus = 'normal';
    fbMensaje = `Fb T=${fbT}: Segmento posterior dentro de límites normales.`;
  }

  // 6. Consistencia F-Fb
  const fFbDiferencia = Math.abs(fT - fbT);
  let fFbConsistencia: ValidityAnalysis['fFbConsistencia'];
  let fFbMensaje: string;
  
  if (fFbDiferencia >= UMBRALES.F_FB_INCONSISTENCIA_SEVERA) {
    fFbConsistencia = 'inconsistente';
    fFbMensaje = `Diferencia F-Fb = ${fFbDiferencia}T: Inconsistencia marcada entre segmentos del protocolo. Protocolo inconsistente.`;
  } else if (fFbDiferencia >= UMBRALES.F_FB_INCONSISTENCIA) {
    fFbConsistencia = 'inconsistente';
    fFbMensaje = `Diferencia F-Fb = ${fFbDiferencia}T: Posible inconsistencia entre segmentos. Interpretar con cautela.`;
  } else {
    fFbConsistencia = 'consistente';
    fFbMensaje = `Diferencia F-Fb = ${fFbDiferencia}T: Consistencia adecuada entre segmentos del protocolo.`;
  }

  // 7. F(p) - Simulación
  let fpStatus: ValidityAnalysis['fpStatus'];
  let fpMensaje: string;
  
  if (fpBruto > UMBRALES.FP_SIMULACION) {
    fpStatus = 'posible_simulacion';
    fpMensaje = `F(p) bruto = ${fpBruto}: Posible simulación o exageración de psicopatología.`;
  } else {
    fpStatus = 'normal';
    fpMensaje = `F(p) bruto = ${fpBruto}: Sin evidencia de simulación de psicopatología.`;
  }

  // 8. Índice F-K
  let fKStatus: ValidityAnalysis['fKStatus'];
  let fKMensaje: string;
  
  if (f_K > UMBRALES.F_K_EXAGERACION) {
    fKStatus = 'exageracion';
    fKMensaje = `Índice F-K = ${f_K}: Posible exageración de síntomas o simulación.`;
  } else if (f_K < UMBRALES.F_K_SUBREPORTE) {
    fKStatus = 'subreporte';
    fKMensaje = `Índice F-K = ${f_K}: Posible sub-reporte de síntomas o defensividad extrema.`;
  } else {
    fKStatus = 'normal';
    fKMensaje = `Índice F-K = ${f_K}: Dentro de límites esperados.`;
  }

  // 9. Escala L
  let lStatus: ValidityAnalysis['lStatus'];
  let lMensaje: string;
  
  if (lBruto > UMBRALES.L_ELEVADO) {
    lStatus = 'elevado';
    lMensaje = `L bruto = ${lBruto}: Intento de presentar una imagen socialmente deseable. Defensividad elevada.`;
  } else {
    lStatus = 'normal';
    lMensaje = `L bruto = ${lBruto}: Sin intento evidente de presentación socialmente deseable.`;
  }

  // 10. Escala K
  let kStatus: ValidityAnalysis['kStatus'];
  let kMensaje: string;
  
  if (kBruto >= UMBRALES.K_ELEVADO) {
    kStatus = 'muy_elevado';
    kMensaje = `K bruto = ${kBruto}: Defensividad extrema. El evaluado minimiza problemas significativamente.`;
  } else if (kBruto > 15) {
    kStatus = 'elevado';
    kMensaje = `K bruto = ${kBruto}: Defensividad elevada. Tendencia a minimizar dificultades.`;
  } else if (kBruto < UMBRALES.K_BAJO) {
    kStatus = 'bajo';
    kMensaje = `K bruto = ${kBruto}: K bajo sugiere posible exageración de síntomas o malestar significativo.`;
  } else {
    kStatus = 'normal';
    kMensaje = `K bruto = ${kBruto}: Nivel de defensividad apropiado.`;
  }

  // Conclusión general de validez
  let conclusionGeneral: ValidityAnalysis['conclusionGeneral'];
  let justificacionValidez: string;
  
  const problemasValidez: string[] = [];
  
  if (omisionesStatus === 'invalido' || omisionesStatus === 'dudoso') {
    problemasValidez.push('omisiones excesivas');
  }
  if (fStatus === 'invalido' || fStatus === 'muy_elevado') {
    problemasValidez.push('F elevada');
  }
  if (fbStatus === 'invalido' || fbStatus === 'muy_elevado') {
    problemasValidez.push('Fb elevada');
  }
  if (vrinStatus === 'inconsistente') {
    problemasValidez.push('inconsistencia en respuestas');
  }
  if (fpStatus === 'posible_simulacion') {
    problemasValidez.push('posible simulación');
  }
  if (kStatus === 'muy_elevado' || lStatus === 'elevado') {
    problemasValidez.push('defensividad elevada');
  }
  if (fFbConsistencia === 'inconsistente') {
    problemasValidez.push('inconsistencia entre segmentos');
  }

  if (problemasValidez.length >= 3 || fStatus === 'invalido' || omisionesStatus === 'invalido') {
    conclusionGeneral = 'invalido';
    justificacionValidez = `El protocolo es INVÁLIDO debido a: ${problemasValidez.join(', ')}. No se recomienda la interpretación de las escalas clínicas.`;
  } else if (problemasValidez.length >= 1) {
    conclusionGeneral = 'valido_reservas';
    justificacionValidez = `El protocolo es VÁLIDO CON RESERVAS. Se detectaron: ${problemasValidez.join(', ')}. Interpretar con cautela y considerar estas limitaciones.`;
  } else {
    conclusionGeneral = 'valido';
    justificacionValidez = 'El protocolo es VÁLIDO. Las escalas de validez indican una respuesta consistente y veraz del evaluado. Se puede proceder con la interpretación clínica.';
  }

  return {
    omisionesStatus,
    omisionesMensaje,
    vrinStatus,
    vrinMensaje,
    trinStatus,
    trinMensaje,
    fStatus,
    fMensaje,
    fbStatus,
    fbMensaje,
    fFbConsistencia,
    fFbMensaje,
    fpStatus,
    fpMensaje,
    fKStatus,
    fKMensaje,
    lStatus,
    lMensaje,
    kStatus,
    kMensaje,
    conclusionGeneral,
    justificacionValidez,
  };
}

// FASE 2: Análisis de Escalas Clínicas Básicas
export function analizarEscalasClinicas(protocol: MMPI2Protocol): ClinicalScaleInterpretation[] {
  const { escalasClinicas, demograficos } = protocol;
  const interpretaciones: ClinicalScaleInterpretation[] = [];

  const codigos: (keyof typeof escalasClinicas)[] = ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'];

  for (const codigo of codigos) {
    const puntajeT = escalasClinicas[codigo];
    let elevacion: ClinicalScaleInterpretation['elevacion'];
    let interpretacion = '';
    const correlatos: string[] = [];
    const recomendaciones: string[] = [];

    if (puntajeT >= UMBRALES.T_MUY_ELEVADO) {
      elevacion = 'muy_elevada';
    } else if (puntajeT >= UMBRALES.T_ELEVADO) {
      elevacion = 'elevada';
    } else {
      elevacion = 'normal';
    }

    // Interpretación específica por escala
    interpretacion = obtenerInterpretacionEscala(codigo, puntajeT, demograficos.sexo);
    
    if (elevacion !== 'normal') {
      correlatos.push(...(CORRELATOS_EMPERICOS[codigo] || []));
      recomendaciones.push(...obtenerRecomendacionesEscala(codigo, puntajeT));
    }

    interpretaciones.push({
      codigo,
      nombre: NOMBRES_ESCALAS[codigo],
      puntajeT,
      elevacion,
      interpretacion,
      correlatos,
      recomendaciones,
    });
  }

  return interpretaciones;
}

function obtenerInterpretacionEscala(codigo: string, puntajeT: number, sexo: string): string {
  const base = DESCRIPCIONES_ESCALAS[codigo as keyof typeof DESCRIPCIONES_ESCALAS] || '';
  
  if (puntajeT >= 80) {
    return `ELEVACIÓN SIGNIFICATIVA (T=${puntajeT}): ${base} Esta elevación marcada indica presencia clara de las características descritas, con impacto significativo en el funcionamiento del evaluado. Se requiere atención clínica prioritaria.`;
  } else if (puntajeT >= 65) {
    return `ELEVACIÓN MODERADA (T=${puntajeT}): ${base} Se observan rasgos y síntomas en grado clínicamente significativo que merecen atención.`;
  } else if (puntajeT >= 55) {
    return `PUNTAJE LIGERAMENTE ELEVADO (T=${puntajeT}): Presencia de algunos rasgos asociados a esta escala, aunque no alcanzan nivel clínico.`;
  } else if (puntajeT >= 40) {
    return `PUNTAJE NORMAL (T=${puntajeT}): Dentro del rango esperado para la población general.`;
  } else {
    return `PUNTAJE BAJO (T=${puntajeT}): Por debajo del promedio. Puede indicar ausencia de las características medidas o tendencia opuesta.`;
  }
}

function obtenerRecomendacionesEscala(codigo: string, puntajeT: number): string[] {
  const recomendaciones: Record<string, string[]> = {
    Hs: [
      'Descartar causas médicas antes de atribuir síntomas a factores psicológicos',
      'Considerar abordaje psicoterapéutico enfocado en conciencia emocional',
      'Evitar reforzamiento de conductas de queja somática',
    ],
    D: [
      'Evaluar riesgo suicida de manera directa',
      'Considerar derivación para evaluación psicofarmacológica',
      'Abordaje cognitivo-conductual para depresión',
    ],
    Hy: [
      'Establecer alianza terapéutica sólida antes de confrontar defensas',
      'Trabajar gradualmente en reconocimiento de emociones',
      'Atención a posibles recaídas ante situaciones estresantes',
    ],
    Pd: [
      'Evaluar conducta antisocial y riesgo legal',
      'Descartar abuso de sustancias',
      'Establecer límites claros en el setting terapéutico',
    ],
    Mf: [
      'Explorar identidad de género y rol de género en contexto cultural',
      'Evitar presuposiciones basadas en estereotipos',
    ],
    Pa: [
      'Abordar con cautela, evitando confrontación directa',
      'Dificultad para establecer alianza terapéutica - requiere tiempo',
      'Evaluar presencia de ideación paranoide clínicamente significativa',
    ],
    Pt: [
      'Técnicas de manejo de ansiedad y mindfulness',
      'Exposición gradual a situaciones temidas',
      'Posible abordaje psicofarmacológico',
    ],
    Sc: [
      'Evaluación psiquiátrica para descartar trastorno psicótico',
      'Explorar experiencias perceptuales inusuales',
      'Considerar necesidad de apoyo social intensivo',
    ],
    Ma: [
      'Evaluar posibles episodios maníacos o hipomaníacos',
      'Monitorizar conductas de riesgo',
      'Abordaje que contenga impulsividad sin suprimir energía adaptativa',
    ],
    Si: [
      'Diferenciar introversión de fobia social o evitación',
      'Entrenamiento en habilidades sociales si es apropiado',
      'Respetar preferencia por actividades solitarias si no causa malestar',
    ],
  };

  return recomendaciones[codigo] || [];
}

// FASE 3: Determinar Código de Perfil
export function determinarCodigoPerfil(escalasInterpretadas: ClinicalScaleInterpretation[]): ProfileCode | null {
  const elevadas = escalasInterpretadas
    .filter(e => e.elevacion !== 'normal')
    .sort((a, b) => b.puntajeT - a.puntajeT);

  // === CASO DLN (Dentro de Límites Normales) ===
  // Según Sanz (2008) página 27: si NINGUNA escala supera T=65, el perfil es DLN
  if (elevadas.length === 0) {
    // Buscar las 2 escalas más altas aunque no sean "elevadas"
    const todasOrdenadas = [...escalasInterpretadas].sort((a, b) => b.puntajeT - a.puntajeT);
    const principales = todasOrdenadas.slice(0, 2);

    const codigoNumerico: Record<string, string> = {
      'Hs': '1', 'D': '2', 'Hy': '3', 'Pd': '4', 'Mf': '5',
      'Pa': '6', 'Pt': '7', 'Sc': '8', 'Ma': '9', 'Si': '0'
    };
    const numerosPerfil = principales.map(e => codigoNumerico[e.codigo] || e.codigo);
    const codigoHipotetico = numerosPerfil.length >= 2
      ? `${numerosPerfil[0]}${numerosPerfil[1]}/${numerosPerfil[1]}${numerosPerfil[0]}`
      : numerosPerfil[0];

    return {
      codigo: 'DLN',
      escalasInvolucradas: principales.map(e => e.codigo),
      definicion: 'dln',
      interpretacion: `Perfil Dentro de Límites Normales (DLN). Ninguna escala clínica básica alcanza T=65. Las dos escalas más altas son ${principales[0]?.nombre} (T=${principales[0]?.puntajeT}) y ${principales[1]?.nombre} (T=${principales[1]?.puntajeT}), pero no alcanzan el umbral clínico. Según Sanz (2008), este es el perfil más frecuente en población general y en selección de personal. En contexto clínico o forense, puede indicar: (a) baja motivación para reportar malestar, (b) ajuste egosintónico a problemas crónicos, o (c) ocultamiento de patología seria. Se recomienda matizar con subescalas Harris-Lingoes, escalas de contenido y suplementarias. Código hipotético (no codificable): ${codigoHipotetico}.`,
      correlatosClinicos: [
        'Perfil cuantitativamente normal',
        'Posible defensividad (ver L, K, ratios O/S)',
        'Interpretar con subescalas Harris-Lingoes y contenido',
        'No se aplica código de dos escalas (no cumple requisito de elevación mínima T≥65)',
      ],
      pronostico: 'Perfil dentro de límites normales. La interpretación clínica debe basarse en patrones cualitativos de subescalas y escalas adicionales más que en el código de perfil.',
    };
  }

  // Obtener las 2-3 escalas más elevadas
  const principales = elevadas.slice(0, 3);

  // Convertir códigos a números para el código de perfil
  const codigoNumerico: Record<string, string> = {
    'Hs': '1', 'D': '2', 'Hy': '3', 'Pd': '4', 'Mf': '5',
    'Pa': '6', 'Pt': '7', 'Sc': '8', 'Ma': '9', 'Si': '0'
  };

  const numerosPerfil = principales.map(e => codigoNumerico[e.codigo] || e.codigo);

  // Determinar nivel de definición
  let definicion: ProfileCode['definicion'];
  if (principales.length >= 2) {
    const diferencia = principales[0].puntajeT - principales[1].puntajeT;
    if (diferencia >= 10) {
      definicion = 'bien_definido';
    } else if (diferencia >= 5) {
      definicion = 'moderadamente_definido';
    } else {
      definicion = 'poco_definido';
    }
  } else {
    definicion = 'bien_definido';
  }

  const codigo = numerosPerfil.length >= 2
    ? `${numerosPerfil[0]}${numerosPerfil[1]}/${numerosPerfil[1]}${numerosPerfil[0]}`
    : numerosPerfil[0];

  return {
    codigo,
    escalasInvolucradas: principales.map(e => e.codigo),
    definicion,
    interpretacion: obtenerInterpretacionCodigoPerfil(codigo, numerosPerfil),
    correlatosClinicos: obtenerCorrelatosCodigo(codigo, numerosPerfil),
    pronostico: obtenerPronosticoCodigo(codigo, definicion),
  };
}

function obtenerInterpretacionCodigoPerfil(codigo: string, numeros: string[]): string {
  const interpretaciones: Record<string, string> = {
    '12/21': 'Perfil de conversión: Tendencia a expresar conflictos emocionales a través de síntomas físicos. Depresión enmascarada por quejas somáticas.',
    '13/31': 'Perfil de neurosis conversiva: Histeria con quejas somáticas prominentes y negación de problemas psicológicos.',
    '23/32': 'Perfil depresivo-neurótico: Depresión con ansiedad significativa, buena probabilidad de respuesta al tratamiento.',
    '24/42': 'Perfil de acting out depresivo: Depresión con conductas impulsivas y conflictos interpersonales. Riesgo de comportamiento autodestructivo.',
    '27/72': 'Perfil ansioso-depresivo: Ansiedad y depresión combinadas con rumiación excesiva. Buena conciencia de problemas.',
    '28/82': 'Perfil de trastorno afectivo: Depresión severa con posibles características esquizoides. Riesgo de hospitalización.',
    '34/43': 'Perfil de acting out histriónico: Impulsividad con teatralidad y conflicto entre dependencia y hostilidad.',
    '46/64': 'Perfil pasivo-agresivo/narcisista: Suspicacia combinada con rebeldía. Dificultad en relaciones de autoridad.',
    '47/74': 'Perfil de ansiedad con acting out: Ansiedad intensa con comportamientos impulsivos. Posible abuso de sustancias.',
    '48/84': 'Perfil esquizoide/antisocial: Alienación social con tendencias antisociales. Riesgo legal significativo.',
    '49/94': 'Perfil antisocial/expansivo: Impulsividad severa, desinhibición, alto riesgo de conductas antisociales y abuso de sustancias.',
    '68/86': 'Perfil esquizo-paranoide: Alienación con suspicacia marcada. Riesgo de deterioro psicótico.',
    '69/96': 'Perfil paranoide-expansivo: Ideas de grandeza con suspicacia. Posible trastorno bipolar o paranoide.',
    '78/87': 'Perfil de esquizo-ansiedad: Ansiedad severa con pensamiento idiosincrático. Alto nivel de malestar.',
    '89/98': 'Perfil de desorganización: Pensamiento no convencional con hiperactividad. Posible trastorno bipolar o esquizofrenia.',
  };

  if (interpretaciones[codigo]) {
    return interpretaciones[codigo];
  }

  // Interpretación genérica
  const escala1 = numeros[0] || '';
  const escala2 = numeros[1] || '';
  
  if (escala2) {
    return `Código de perfil ${codigo}: Combinación de características de las escalas ${escala1} y ${escala2}. Ver análisis individual de cada escala elevada para interpretación detallada.`;
  }
  
  return `Perfil con elevación principal en escala ${escala1}. Ver análisis individual para interpretación detallada.`;
}

function obtenerCorrelatosCodigo(codigo: string, numeros: string[]): string[] {
  const correlatos: Record<string, string[]> = {
    '12/21': ['Quejas somáticas múltiples', 'Negación de depresión', 'Historia de consultas médicas frecuentes'],
    '13/31': ['Conversión clásica', 'Inmadurez emocional', 'Dependencia interpersonal'],
    '23/32': ['Neurosis de ansiedad', 'Respuesta buena al tratamiento', 'Pronóstico favorable'],
    '24/42': ['Acting out', 'Conflicto con autoridad', 'Riesgo suicida moderado'],
    '27/72': ['Depresión ansiosa', 'Rumiación excesiva', 'Alta conciencia de problemas'],
    '28/82': ['Trastorno afectivo mayor', 'Posible ideación suicida', 'Necesidad de evaluación psiquiátrica'],
    '34/43': ['Histeria con acting out', 'Conflictos interpersonales', 'Necesidad de atención'],
    '46/64': ['Personalidad pasivo-agresiva', 'Resistencia al tratamiento', 'Conflictos laborales'],
    '47/74': ['Ansiedad marcada', 'Impulsividad', 'Posible abuso de sustancias'],
    '48/84': ['Trastorno de personalidad severo', 'Dificultad con la autoridad', 'Alienación social'],
    '49/94': ['Trastorno antisocial', 'Alto riesgo de conductas ilegales', 'Pronóstico reservado'],
    '68/86': ['Trastorno paranoide', 'Dificultad en alianza terapéutica', 'Riesgo de deterioro'],
    '69/96': ['Trastorno bipolar posible', 'Grandiosidad', 'Desinhibición'],
    '78/87': ['Alta ansiedad y confusión', 'Pensamiento perturbado', 'Necesidad de apoyo'],
    '89/98': ['Desorganización cognitiva', 'Posible trastorno psicótico', 'Urgente evaluación psiquiátrica'],
  };

  return correlatos[codigo] || ['Ver análisis individual de escalas elevadas'];
}

function obtenerPronosticoCodigo(codigo: string, definicion: ProfileCode['definicion']): string {
  let basePronostico = 'Pronóstico moderado: Se requiere intervención estructurada con seguimiento cercano.';

  const pronosticos: Record<string, string> = {
    '23/32': 'Pronóstico favorable: Buena respuesta esperada a psicoterapia de insight o cognitivo-conductual.',
    '27/72': 'Pronóstico moderadamente favorable: Buena conciencia de problemas facilita el tratamiento.',
    '49/94': 'Pronóstico reservado: Dificultad para establecer alianza terapéutica y mantener cambios.',
    '48/84': 'Pronóstico reservado: Combinación de traits que dificultan la adherencia al tratamiento.',
    '68/86': 'Pronóstico cauteloso: Se requiere paciente trabajo para establecer confianza terapéutica.',
    '89/98': 'Pronóstico variable: Depende de la naturaleza del trastorno subyacente.',
  };

  if (pronosticos[codigo]) {
    basePronostico = pronosticos[codigo];
  }

  if (definicion === 'bien_definido') {
    return basePronostico + ' Perfil bien definido aumenta la confiabilidad de la interpretación.';
  } else if (definicion === 'poco_definido') {
    return basePronostico + ' Perfil poco definido reduce la certeza diagnóstica.';
  }

  return basePronostico;
}

// FASE 4: Análisis de Escalas Suplementarias
export function analizarEscalasSuplementarias(protocol: MMPI2Protocol): ClinicalScaleInterpretation[] {
  if (!protocol.escalasSuplementarias) return [];

  const suplementarias = protocol.escalasSuplementarias;
  const interpretaciones: ClinicalScaleInterpretation[] = [];

  const nombres: Record<string, string> = {
    A: 'Ansiedad',
    R: 'Represión',
    Es: 'Fortaleza del Yo',
    MACR: 'Alcoholismo Revisado (MAC-R)',
    OH: 'Hostilidad Sobrecontrolada',
    PK: 'TEPT - Keane',
    PS: 'TEPT - Schlenger',
    Do: 'Dominio',
    Re: 'Responsabilidad Social',
  };

  const interpretacionesEspeciales: Record<string, (t: number) => { interp: string; correlatos: string[] }> = {
    A: (t) => ({
      interp: t >= 60 ? 'Nivel elevado de ansiedad generalizada y tensión emocional.' : 'Nivel de ansiedad dentro de límites normales.',
      correlatos: t >= 60 ? ['Ansiedad subjetiva intensa', 'Tensión muscular', 'Preocupación excesiva'] : []
    }),
    Es: (t) => ({
      interp: t >= 55 ? 'Buena fortaleza del yo y recursos de afrontamiento.' : t < 45 ? 'Fortaleza del yo reducida, recursos de afrontamiento limitados, menor resiliencia ante el estrés sostenido.' : 'Fortaleza del yo en el límite inferior del promedio, recursos de afrontamiento algo limitados.',
      correlatos: t >= 55 ? ['Buena capacidad de afrontamiento', 'Recursos psicológicos adecuados'] : t < 45 ? ['Vulnerabilidad al estrés', 'Menor capacidad de recuperación', 'Recursos de afrontamiento limitados'] : ['Recursos de afrontamiento algo limitados']
    }),
    MACR: (t) => ({
      interp: t >= 65 ? 'Riesgo elevado de problemas relacionados con alcohol u otras sustancias.' : 'Riesgo bajo de problemas de adicciones.',
      correlatos: t >= 65 ? ['Historia posible de abuso de sustancias', 'Conductas de riesgo', 'Posible dependencia'] : []
    }),
    OH: (t) => ({
      interp: t >= 70 ? 'Hostilidad intensa que es conscientemente sobrecontrolada. Riesgo de explosiones ante frustración.' : 'Control de hostilidad adecuado.',
      correlatos: t >= 70 ? ['Hostilidad reprimida', 'Posible acting out bajo estrés', 'Dificultad para expresar enojo'] : []
    }),
    PK: (t) => ({
      interp: t >= 65 ? 'Indicador consistente con TEPT. Evaluar historia de trauma.' : 'Sin indicadores significativos de TEPT.',
      correlatos: t >= 65 ? ['Posible historia traumática', 'Síntomas de reexperimentación', 'Evitación y hipervigilancia'] : []
    }),
  };

  for (const [codigo, puntajeT] of Object.entries(suplementarias)) {
    const nombre = nombres[codigo] || codigo;
    let interpretacion = '';
    let correlatos: string[] = [];

    const especial = interpretacionesEspeciales[codigo];
    if (especial) {
      const resultado = especial(puntajeT);
      interpretacion = resultado.interp;
      correlatos = resultado.correlatos;
    } else {
      if (puntajeT >= 65) {
        interpretacion = `Elevación significativa (T=${puntajeT}) en ${nombre}.`;
        correlatos = [`Indicador elevado en ${nombre}`];
      } else {
        interpretacion = `Puntaje dentro de límites normales (T=${puntajeT}).`;
      }
    }

    interpretaciones.push({
      codigo,
      nombre,
      puntajeT,
      elevacion: puntajeT >= 65 ? 'elevada' : puntajeT >= 80 ? 'muy_elevada' : 'normal',
      interpretacion,
      correlatos,
      recomendaciones: correlatos.length > 0 ? ['Considerar en la formulación clínica integrada'] : [],
    });
  }

  return interpretaciones;
}

// FASE 5: Análisis de Escalas de Contenido
export function analizarEscalasContenido(protocol: MMPI2Protocol): ClinicalScaleInterpretation[] {
  if (!protocol.escalasContenido) return [];

  const contenido = protocol.escalasContenido;
  const interpretaciones: ClinicalScaleInterpretation[] = [];

  const nombres: Record<string, string> = {
    ANX: 'Ansiedad',
    FRS: 'Miedos',
    OBS: 'Obsesividad',
    DEP: 'Depresión',
    HEA: 'Preocupaciones de Salud',
    BIZ: 'Pensamiento Bizarro',
    ANG: 'Ira',
    CYN: 'Cinismo',
    ASP: 'Conducta Antisocial',
    TPA: 'Tipo A',
    LSE: 'Baja Autoestima',
    SOD: 'Malestar Social',
    FAM: 'Problemas Familiares',
    WRK: 'Interferencia Laboral',
    TRT: 'Actitud Negativa hacia el Tratamiento',
  };

  for (const [codigo, puntajeT] of Object.entries(contenido)) {
    const nombre = nombres[codigo] || codigo;
    let interpretacion = '';
    const correlatos: string[] = [];

    if (puntajeT >= 65) {
      interpretacion = `Elevación significativa (T=${puntajeT}): El evaluado reporta problemas en el área de ${nombre.toLowerCase()}.`;
      correlatos.push(`Indicador de dificultades en ${nombre.toLowerCase()}`);
    } else if (puntajeT >= 55) {
      interpretacion = `Elevación leve (T=${puntajeT}): Presencia de algunas dificultades en ${nombre.toLowerCase()}.`;
    } else {
      interpretacion = `Puntaje normal (T=${puntajeT}): Sin indicadores significativos en ${nombre.toLowerCase()}.`;
    }

    interpretaciones.push({
      codigo,
      nombre,
      puntajeT,
      elevacion: puntajeT >= 65 ? 'elevada' : puntajeT >= 80 ? 'muy_elevada' : 'normal',
      interpretacion,
      correlatos,
      recomendaciones: correlatos.length > 0 ? ['Abordar en el contexto terapéutico'] : [],
    });
  }

  return interpretaciones;
}

// FASE 6: Formulación Clínica Integrada
export function generarFormulacionClinica(
  validez: ValidityAnalysis,
  escalasClinicas: ClinicalScaleInterpretation[],
  codigoPerfil: ProfileCode | null,
  suplementarias: ClinicalScaleInterpretation[],
  contenido: ClinicalScaleInterpretation[],
  protocol: MMPI2Protocol
): MMPI2AnalysisResult['formulacionClinica'] {
  
  // Validez del protocolo
  const validezProtocolo = validez.justificacionValidez;

  // === ESTILO DEFENSIVO (CRITERIO EN EL CÓDIGO, NO EN EL PROMPT) ===
  // El análisis defensivo se basa en indicadores SIEMPRE presentes (L, K, F-K)
  // y se enriquece con O/S ratios si están disponibles.
  let estiloDefensivo = '';
  const lBruto = protocol.lBruto;
  const kBruto = protocol.kBruto;
  const fK = protocol.f_K;
  const razonesOS = protocol.obviedadSutilidad;

  // L bruto >= 7 → T >= 65 (punto de corte clínico para defensividad)
  const lElevada = lBruto >= 7;
  // F-K negativo indica orientación defensiva (no simulación)
  const fKNegativo = fK < 0;
  // K elevado (>= 15) refuerza defensividad
  const kElevado = kBruto >= 15;

  // Contar razones O/S defensivas si están disponibles
  let razonesDefensivas = 0;
  let totalRazones = 0;
  let detallesOS = '';
  if (razonesOS) {
    for (const escala of ['D', 'Hy', 'Pd', 'Pa', 'Ma'] as const) {
      const r = razonesOS[escala];
      if (r) {
        totalRazones++;
        const total = r.obvio + r.sutil;
        const ratio = total > 0 ? r.obvio / total : 0.5;
        if (ratio < 0.45) razonesDefensivas++;
      }
    }
    if (totalRazones > 0) {
      detallesOS = `\n3. Razones Obviedad/Sutilidad: ${razonesDefensivas} de ${totalRazones} escalas presentan ratios O/S bajos (< 0.45), confirmando que el evaluado niega síntomas cuando estos son claramente reconocibles (ítems obvios) pero responde con más libertad ante ítems cuya implicación clínica no resulta evidente (sutiles).`;
    }
  }

  // Determinar nivel de defensividad
  // CRITERIO: L elevada + F-K negativo = estilo defensivo documentado
  // (no requiere O/S ratios porque L y F-K son suficientes por sí solos)
  if (lElevada && fKNegativo) {
    estiloDefensivo = `ESTILO DEFENSIVO DOCUMENTADO: El evaluado presenta un patrón defensivo sistemático, evidenciado por múltiples indicadores convergentes:

1. Escala L elevada (L bruto=${lBruto}, T≈65): Tendencia a presentarse de manera excesivamente virtuosa y moralmente intachable, negando pequeños fallos humanos que prácticamente todo el mundo reconoce. El evaluado se muestra bajo una luz muy favorable, con una autoimagen rígidamente positiva. Esto puede reflejar tanto defensividad situacional (contexto de evaluación con terceros en juego) como rasgos de personalidad más permanentes vinculados al convencionalismo y la rigidez moral.

2. Índice F-K = ${fK} (negativo): Valor claramente negativo que indica AUSENCIA de simulación de trastorno psicopatológico. Descarta exageración sintomática y confirma orientación defensiva. El evaluado minimiza la reportación de síntomas.${detallesOS}

${totalRazones > 0 ? '4' : '3'}. K bruto=${kBruto}: ${kElevado ? 'Elevado, refuerza el patrón defensivo. El evaluado tiende a minimizar dificultades psicológicas.' : 'En rango promedio, no añade defensividad adicional más allá de lo que refleja L.'}.

CONCLUSIÓN: El protocolo es aceptable para interpretación, pero los puntajes clínicos probablemente SUBESTIMAN la psicopatología real del evaluado. Las conclusiones clínicas deben leerse como PISOS, no como techos. En contexto forense con terceros en juego, este patrón defensivo cobra especial relevancia interpretativa y debe ser explicitado en el informe profesional.`;
  } else if (lElevada || fKNegativo || kElevado) {
    estiloDefensivo = `Patrón defensivo parcial: Se detectan algunos indicadores de defensividad (L bruto=${lBruto}, F-K=${fK}, K bruto=${kBruto}), aunque no configuran un patrón sistemático. Interpretar los resultados con cautela.${detallesOS}`;
  } else {
    estiloDefensivo = 'No se detecta patrón defensivo significativo. Las escalas de validez (L, K, F-K) se encuentran dentro de parámetros normativos.';
  }

  // Perfil de personalidad
  let perfilPersonalidad = '';
  const elevadas = escalasClinicas.filter(e => e.elevacion !== 'normal');
  
  if (elevadas.length === 0) {
    perfilPersonalidad = 'El perfil no presenta elevaciones clínicamente significativas en las escalas básicas del MMPI-2. Esto sugiere un funcionamiento psicológico dentro de parámetros normativos, sin indicadores claros de psicopatología significativa. Se recomienda considerar otros indicadores y el contexto clínico para una evaluación completa.';
  } else if (codigoPerfil) {
    perfilPersonalidad = `El perfil presenta un código ${codigoPerfil.codigo} (${codigoPerfil.definicion.replace('_', ' ')}). ${codigoPerfil.interpretacion} Las escalas más elevadas son ${codigoPerfil.escalasInvolucradas.join(', ')}, lo que indica presencia de características relacionadas con ${NOMBRES_ESCALAS[codigoPerfil.escalasInvolucradas[0] as keyof typeof NOMBRES_ESCALAS] || 'las escalas mencionadas'}.`;
  } else {
    perfilPersonalidad = `El perfil presenta elevación primaria en ${elevadas[0].nombre} (T=${elevadas[0].puntajeT}). ${elevadas[0].interpretacion}`;
  }

  // Áreas afectadas
  const areasAfectadas = {
    cognitivo: determinarAreaCognitiva(escalasClinicas, suplementarias),
    afectivo: determinarAreaAfectiva(escalasClinicas, suplementarias),
    conductual: determinarAreaConductual(escalasClinicas, suplementarias),
    interpersonal: determinarAreaInterpersonal(escalasClinicas, suplementarias),
    somatico: determinarAreaSomatica(escalasClinicas, suplementarias),
  };

  // Recursos y fortalezas
  const recursosFortalezas: string[] = [];
  const esElevado = suplementarias.find(s => s.codigo === 'Es');
  if (esElevado) {
    if (esElevado.puntajeT >= 55) {
      recursosFortalezas.push('Buena fortaleza del yo y capacidad de afrontamiento (Es T=' + esElevado.puntajeT + ')');
    } else if (esElevado.puntajeT < 45) {
      // T < 45 = por debajo del promedio = fortaleza del yo reducida
      recursosFortalezas.push('Fortaleza del yo reducida, recursos de afrontamiento limitados, menor resiliencia ante el estrés sostenido (Es T=' + esElevado.puntajeT + ')');
    } else {
      // T 45-54 = límite inferior / normal bajo
      recursosFortalezas.push('Fortaleza del yo en el límite inferior del promedio, recursos de afrontamiento algo limitados (Es T=' + esElevado.puntajeT + ')');
    }
  }
  
  const kNormal = protocol.kBruto >= 9 && protocol.kBruto <= 15;
  if (kNormal) {
    recursosFortalezas.push('Nivel adecuado de defensividad que permite trabajo terapéutico');
  }
  
  const escalasNormales = escalasClinicas.filter(e => e.puntajeT < 60);
  if (escalasNormales.length > 5) {
    recursosFortalezas.push('Mayoría de escalas clínicas dentro de parámetros normativos');
  }
  
  if (recursosFortalezas.length === 0) {
    recursosFortalezas.push('Se requiere evaluación más profunda para identificar recursos');
  }

  // Riesgos
  const riesgos: string[] = [];
  
  const depresion = escalasClinicas.find(e => e.codigo === 'D');
  if (depresion && depresion.puntajeT >= 70) {
    riesgos.push('Evaluar riesgo suicida dada elevación significativa en escala de Depresión');
  }
  
  const pd = escalasClinicas.find(e => e.codigo === 'Pd');
  if (pd && pd.puntajeT >= 70) {
    riesgos.push('Riesgo de conductas impulsivas y conflicto con normas sociales');
  }
  
  const ma = escalasClinicas.find(e => e.codigo === 'Ma');
  if (ma && ma.puntajeT >= 75) {
    riesgos.push('Riesgo de conductas de desinhibición y toma de decisiones impulsivas');
  }
  
  const sc = escalasClinicas.find(e => e.codigo === 'Sc');
  if (sc && sc.puntajeT >= 80) {
    riesgos.push('Posible desorganización psicótica - requiere evaluación psiquiátrica urgente');
  }
  
  const macr = suplementarias.find(s => s.codigo === 'MACR');
  if (macr && macr.puntajeT >= 65) {
    riesgos.push('Riesgo de problemas relacionados con sustancias');
  }

  // Pronóstico
  let pronostico = 'Pronóstico moderado con intervención apropiada. ';
  if (codigoPerfil) {
    pronostico = codigoPerfil.pronostico;
  } else if (elevadas.length === 0) {
    pronostico = 'Dado el perfil dentro de parámetros normativos, se espera buen funcionamiento con intervenciones preventivas o de apoyo.';
  }

  // Recomendaciones terapéuticas ANCLADAS AL PERFIL ESPECÍFICO
  const recomendacionesTerapeuticas: string[] = [];

  // 1. Recomendaciones por validez
  if (validez.conclusionGeneral === 'valido_reservas') {
    recomendacionesTerapeuticas.push('Interpretar los resultados con cautela debido a las limitaciones de validez del protocolo');
  }

  // 2. Recomendaciones por estilo defensivo
  if (lElevada && fKNegativo) {
    recomendacionesTerapeuticas.push('Triangular los hallazgos con entrevista clínica y fuentes colaterales, especialmente en contexto forense donde la motivación para la presentación favorable es elevada');
    recomendacionesTerapeuticas.push('Considerar reevaluación en contexto de menor presión defensiva para obtener un perfil más representativo');
  }

  // 3. Recomendaciones por escalas clínicas elevadas
  if (depresion && depresion.puntajeT >= 65) {
    recomendacionesTerapeuticas.push('Abordaje psicoterapéutico con enfoque en estado de ánimo depresivo (D T=' + depresion.puntajeT + ')');
    recomendacionesTerapeuticas.push('Considerar evaluación para tratamiento psicofarmacológico');
  }

  if (pd && pd.puntajeT >= 65) {
    recomendacionesTerapeuticas.push('Establecer límites claros en el setting terapéutico (Pd T=' + pd.puntajeT + ')');
    recomendacionesTerapeuticas.push('Evaluar conductas de riesgo y problemas legales');
  }

  const pa = escalasClinicas.find(e => e.codigo === 'Pa');
  if (pa && pa.puntajeT >= 65) {
    recomendacionesTerapeuticas.push('Dedicar tiempo a construir alianza terapéutica sólida (Pa T=' + pa.puntajeT + ')');
    recomendacionesTerapeuticas.push('Evitar confrontaciones directas que puedan activar suspicacia');
  }

  // 4. Recomendaciones por subescalas Harris-Lingoes relevantes
  if (protocol.subescalasHarrisLingoes) {
    const pa1 = protocol.subescalasHarrisLingoes.Pa1;
    if (pa1 && pa1 >= 4) { // Pa1 bruto >= 4 → T aprox >= 60
      recomendacionesTerapeuticas.push('Explorar experiencias de suspicacia interpersonal o sensación de injusticia (Pa1 elevada)');
    }
    const ma4 = protocol.subescalasHarrisLingoes.Ma4;
    if (ma4 && ma4 >= 5) { // Ma4 bruto >= 5 → T aprox >= 65
      recomendacionesTerapeuticas.push('Explorar autoimagen grandiosa y su impacto en el funcionamiento interpersonal (Ma4 elevada)');
    }
  }

  // 5. Recomendaciones por escalas de contenido
  if (protocol.escalasContenido) {
    const obs = protocol.escalasContenido.OBS;
    if (obs && obs >= 60) {
      recomendacionesTerapeuticas.push('Abordar rigidez cognitiva y tendencia a la rumiación (OBS T=' + obs + ')');
    }
    const anx = protocol.escalasContenido.ANX;
    if (anx && anx >= 60) {
      recomendacionesTerapeuticas.push('Técnicas de manejo de ansiedad y mindfulness (ANX T=' + anx + ')');
    }
    const biz = protocol.escalasContenido.BIZ;
    if (biz && biz >= 60) {
      recomendacionesTerapeuticas.push('Explorar experiencias perceptuales inusuales o pensamiento de características peculiares (BIZ T=' + biz + ')');
    }
    const wrk = protocol.escalasContenido.WRK;
    if (wrk && wrk >= 55) {
      recomendacionesTerapeuticas.push('Abordar dificultades en el rendimiento laboral o académico (WRK T=' + wrk + ')');
    }
  }

  // 6. Recomendaciones por escalas suplementarias
  if (protocol.escalasSuplementarias) {
    const es = protocol.escalasSuplementarias.Es;
    if (es && es < 45) {
      recomendacionesTerapeuticas.push('Fortalecer recursos de afrontamiento y resiliencia ante el estrés (Es T=' + es + ')');
    }
    const oh = protocol.escalasSuplementarias.OH;
    if (oh && oh >= 55) {
      recomendacionesTerapeuticas.push('Explorar patrones de control de hostilidad y riesgo de descargas emocionales (O-H T=' + oh + ')');
    }
    const doT = protocol.escalasSuplementarias.Do;
    if (doT && doT < 40) {
      recomendacionesTerapeuticas.push('Considerar entrenamiento en habilidades asertivas y de liderazgo (Do T=' + doT + ')');
    }
  }

  // 7. Si no hay recomendaciones específicas, dar recomendaciones generales ancladas
  if (recomendacionesTerapeuticas.length === 0) {
    if (codigoPerfil?.definicion === 'dln') {
      recomendacionesTerapeuticas.push('Perfil dentro de límites normativos: seguimiento psicológico periódico y monitoreo de factores de riesgo');
      recomendacionesTerapeuticas.push('Considerar evaluación con instrumentos complementarios para profundizar el análisis cualitativo');
    } else {
      recomendacionesTerapeuticas.push('Seguimiento psicológico periódico');
      recomendacionesTerapeuticas.push('Intervenciones de apoyo y fortalecimiento de recursos');
    }
  }

  return {
    validezProtocolo,
    perfilPersonalidad,
    estiloDefensivo,
    areasAfectadas,
    recursosFortalezas,
    riesgos,
    pronostico,
    recomendacionesTerapeuticas,
  };
}

function determinarAreaCognitiva(escalas: ClinicalScaleInterpretation[], sup: ClinicalScaleInterpretation[]): string {
  const sc = escalas.find(e => e.codigo === 'Sc');
  const pa = escalas.find(e => e.codigo === 'Pa');
  const pt = escalas.find(e => e.codigo === 'Pt');

  if (sc && sc.puntajeT >= 70) {
    return 'Alteraciones en el proceso de pensamiento: posible pensamiento idiosincrático, dificultad en la atención y concentración. Se observan indicadores de confusión cognitiva y experiencias perceptuales inusuales que requieren evaluación especializada.';
  }
  if (pa && pa.puntajeT >= 70) {
    return 'Estilo cognitivo caracterizado por suspicacia e hipervigilancia. Tendencia a interpretar situaciones de manera amenazante, con posible rigidez en las creencias y dificultad para considerar perspectivas alternativas.';
  }
  if (pt && pt.puntajeT >= 65) {
    return 'Patrón de rumiación excesiva y preocupación persistente. Dificultad para la toma de decisiones debido a análisis excesivo. Posible perfeccionismo que interfiere en el funcionamiento cognitivo eficiente.';
  }
  return 'Sin alteraciones cognitivas significativas identificadas. El proceso de pensamiento aparece dentro de parámetros esperados.';
}

function determinarAreaAfectiva(escalas: ClinicalScaleInterpretation[], sup: ClinicalScaleInterpretation[]): string {
  const d = escalas.find(e => e.codigo === 'D');
  const ma = escalas.find(e => e.codigo === 'Ma');
  const pt = escalas.find(e => e.codigo === 'Pt');

  if (d && d.puntajeT >= 70) {
    return 'Estado de ánimo significativamente deprimido con sentimientos de desesperanza, culpa y desvalorización. Anhedonia marcada con disminución de la capacidad de experimentar placer. Se requiere evaluación de riesgo suicida.';
  }
  if (ma && ma.puntajeT >= 70) {
    return 'Estado de ánimo expansivo, con euforia potencialmente inestable. Alta energía emocional que puede manifestarse como irritabilidad ante la frustración. Posible labilidad afectiva.';
  }
  if (pt && pt.puntajeT >= 65) {
    return 'Ansiedad generalizada y tensión emocional crónica. Dificultad para la relajación y manejo del estrés. Alta reactividad emocional ante estresores.';
  }
  return 'Área afectiva dentro de parámetros normativos. El estado de ánimo aparece estable sin indicadores de alteraciones significativas.';
}

function determinarAreaConductual(escalas: ClinicalScaleInterpretation[], sup: ClinicalScaleInterpretation[]): string {
  const pd = escalas.find(e => e.codigo === 'Pd');
  const ma = escalas.find(e => e.codigo === 'Ma');
  const sc = escalas.find(e => e.codigo === 'Sc');

  if (pd && pd.puntajeT >= 70) {
    return 'Patrón conductual caracterizado por impulsividad y desacato a normas sociales. Historia probable de conflictos con la autoridad y conductas de riesgo. Externalización de la responsabilidad y dificultad para aprender de consecuencias negativas.';
  }
  if (ma && ma.puntajeT >= 70) {
    return 'Conducta hiperactiva con inicio de múltiples proyectos sin completar. Tendencia a la desinhibición conductual y toma de decisiones impulsiva. Posible disminución de la necesidad de sueño.';
  }
  if (sc && sc.puntajeT >= 70) {
    return 'Conducta con posible desorganización, aislamiento social marcado y deterioro en actividades de la vida diaria. Comportamiento puede parecer extraño o incomprensible para otros.';
  }
  return 'Patrón conductual dentro de parámetros esperados. No se observan indicadores de conducta desadaptativa significativa.';
}

function determinarAreaInterpersonal(escalas: ClinicalScaleInterpretation[], sup: ClinicalScaleInterpretation[]): string {
  const si = escalas.find(e => e.codigo === 'Si');
  const pa = escalas.find(e => e.codigo === 'Pa');
  const pd = escalas.find(e => e.codigo === 'Pd');
  const hy = escalas.find(e => e.codigo === 'Hy');

  if (si && si.puntajeT >= 70) {
    return 'Introversión social marcada con incomodidad significativa en situaciones interpersonales. Red social limitada, dificultad para expresar opiniones y preferencia por actividades solitarias. Posible evitación social clínicamente significativa.';
  }
  if (pa && pa.puntajeT >= 70) {
    return 'Patrón interpersonal caracterizado por desconfianza marcada y hipersensibilidad a la crítica. Dificultad para establecer vínculos cercanos debido a suspicacia. Tendencia a percibir intenciones hostiles en otros.';
  }
  if (pd && pd.puntajeT >= 70) {
    return 'Relaciones interpersonales inestables con historial de conflictos. Manipulación sutil para obtener beneficios, dificultad para mantener compromisos a largo plazo. Patrón de externalización de problemas interpersonales.';
  }
  if (hy && hy.puntajeT >= 70) {
    return 'Necesidad intensa de aprobación y atención social. Estilo interpersonal teatral con demanda de ser el centro de atención. Relaciones superficiales con dificultad para intimidad genuina.';
  }
  return 'Funcionamiento interpersonal dentro de parámetros esperados. Las relaciones sociales aparecen adecuadas sin indicadores de dificultades significativas.';
}

function determinarAreaSomatica(escalas: ClinicalScaleInterpretation[], sup: ClinicalScaleInterpretation[]): string {
  const hs = escalas.find(e => e.codigo === 'Hs');
  const hy = escalas.find(e => e.codigo === 'Hy');
  const hea = sup.find(e => e.codigo === 'HEA');

  if (hs && hs.puntajeT >= 70) {
    return 'Múltiples quejas somáticas sin explicación médica clara. Preocupación excesiva por la salud y funciones corporales. Historia probable de consultas médicas frecuentes sin hallazgos orgánicos concluyentes. Se recomienda descartar causas médicas.';
  }
  if (hy && hy.puntajeT >= 70) {
    return 'Síntomas somáticos que empeoran en contextos de estrés emocional. Mecanismo de somatización para expresar conflictos psicológicos. Posible conversión de conflictos emocionales en síntomas físicos.';
  }
  if (hea && hea.puntajeT >= 65) {
    return 'Preocupaciones significativas sobre la salud física. Hipervigilancia ante señales corporales y temor a enfermedades. Impacto en funcionamiento diario por preocupaciones somáticas.';
  }
  return 'Sin quejas somáticas significativas identificadas. El área de salud física aparece dentro de parámetros esperados.';
}

// === HARRIS-LINGOES ===
// Nombres de las subescalas
const NOMBRES_HARRIS_LINGOES: Record<string, string> = {
  D1: 'Depresión subjetiva', D2: 'Retardo psicomotor', D3: 'Mal funcionamiento físico',
  D4: 'Insensibilidad mental', D5: 'Barrera de pensamiento',
  Hy1: 'Negación de ansiedad social', Hy2: 'Necesidad de afecto', Hy3: 'Labilidad-inseguridad',
  Hy4: 'Quejas somáticas', Hy5: 'Inhibición de agresión',
  Pd1: 'Discordia familiar', Pd2: 'Problemas de autoridad', Pd3: 'Respeto social',
  Pd4: 'Alienación social', Pd5: 'Alienación self',
  Pa1: 'Ideas persecutorias', Pa2: 'Susceptibilidad poiana', Pa3: 'Ingenuidad',
  Sc1: 'Alienación social', Sc2: 'Alienación bizarra', Sc3: 'Falta de energía y pobreza ideativa',
  Sc4: 'Falta de orientación objetivo', Sc5: 'Excesos sensoriales', Sc6: 'Conducta bizarra',
  Ma1: 'Cinismo', Ma2: 'Actuación psicopática', Ma3: 'Imperturbabilidad', Ma4: 'Inflación del ego',
  Si1: 'Timidez social', Si2: 'Evitación social', Si3: 'Alienación self',
};

// Analizar subescalas Harris-Lingoes
export function analizarHarrisLingoes(protocol: MMPI2Protocol) {
  if (!protocol.subescalasHarrisLingoes) return [];

  const subs = protocol.subescalasHarrisLingoes;
  const grupos = [
    { escala: 'D', subescalas: ['D1', 'D2', 'D3', 'D4', 'D5'] },
    { escala: 'Hy', subescalas: ['Hy1', 'Hy2', 'Hy3', 'Hy4', 'Hy5'] },
    { escala: 'Pd', subescalas: ['Pd1', 'Pd2', 'Pd3', 'Pd4', 'Pd5'] },
    { escala: 'Pa', subescalas: ['Pa1', 'Pa2', 'Pa3'] },
    { escala: 'Sc', subescalas: ['Sc1', 'Sc2', 'Sc3', 'Sc4', 'Sc5', 'Sc6'] },
    { escala: 'Ma', subescalas: ['Ma1', 'Ma2', 'Ma3', 'Ma4'] },
    { escala: 'Si', subescalas: ['Si1', 'Si2', 'Si3'] },
  ];

  return grupos.map(grupo => ({
    escala: grupo.escala,
    subescalas: grupo.subescalas.map(codigo => {
      const bruto = subs[codigo as keyof typeof subs] ?? 0;
      // Los T de Harris-Lingoes no se calculan aquí con tablas (no las tenemos completas)
      // Si el protocol ya trae los T (cargados del Excel), usar esos.
      // Si no, usar aproximación: T = 50 + bruto * 3
      const puntajeT = Math.min(120, Math.max(30, 50 + bruto * 3));
      const interpretacion = obtenerInterpretacionHarrisLingoes(codigo, puntajeT);
      return {
        codigo,
        nombre: NOMBRES_HARRIS_LINGOES[codigo] || codigo,
        bruto,
        puntajeT,
        interpretacion,
      };
    }),
  }));
}

function obtenerInterpretacionHarrisLingoes(codigo: string, t: number): string {
  if (t >= 65) return `Elevación significativa (T=${t}). Indica presencia marcada de las características medidas por ${NOMBRES_HARRIS_LINGOES[codigo] || codigo}.`;
  if (t >= 60) return `Elevación leve (T=${t}). Indica presencia moderada de ${NOMBRES_HARRIS_LINGOES[codigo] || codigo}.`;
  if (t >= 40) return `Rango normal (T=${t}).`;
  return `Puntaje bajo (T=${t}). Puede indicar ausencia o tendencia opuesta a ${NOMBRES_HARRIS_LINGOES[codigo] || codigo}.`;
}

// === RAZONES OBVIEDAD-SUTILIDAD ===
export function analizarObviedadSutilidad(protocol: MMPI2Protocol) {
  if (!protocol.obviedadSutilidad) return [];

  const os = protocol.obviedadSutilidad;
  const nombres: Record<string, string> = {
    D: 'Depresión', Hy: 'Histeria', Pd: 'Desviación Psicopática',
    Pa: 'Paranoia', Ma: 'Hipomanía',
  };

  return (['D', 'Hy', 'Pd', 'Pa', 'Ma'] as const).map(escala => {
    const datos = os[escala];
    if (!datos) return null;
    const total = datos.obvio + datos.sutil;
    const ratio = total > 0 ? datos.obvio / total : 0;
    let interpretacion = '';
    if (ratio < 0.45) {
      interpretacion = `Ratio O/S = ${ratio.toFixed(2)}: Patrón defensivo. El evaluado niega síntomas cuando son claramente reconocibles (ítems obvios) pero responde con más libertad ante ítems cuya implicación clínica no resulta evidente (sutiles).`;
    } else if (ratio > 0.55) {
      interpretacion = `Ratio O/S = ${ratio.toFixed(2)}: Patrón franco. El evaluado reconoce síntomas de manera directa sin defensividad.`;
    } else {
      interpretacion = `Ratio O/S = ${ratio.toFixed(2)}: Patrón normal. Equilibrio entre ítems obvios y sutiles.`;
    }
    return {
      escala,
      nombre: nombres[escala],
      obvio: datos.obvio,
      sutil: datos.sutil,
      ratio: Math.round(ratio * 100) / 100,
      interpretacion,
    };
  }).filter(Boolean) as { escala: string; nombre: string; obvio: number; sutil: number; ratio: number; interpretacion: string }[];
}

// === TRÍADA NEURÓTICA ===
export function calcularTriadaNeurotica(protocol: MMPI2Protocol) {
  const hs = protocol.escalasClinicas.Hs;
  const d = protocol.escalasClinicas.D;
  const hy = protocol.escalasClinicas.Hy;
  const suma = hs + d + hy;

  let interpretacion = '';
  if (suma < 150) {
    interpretacion = `Tríada neurótica (Hs+D+Hy) = ${suma}T. Sin tríada neurótica. Las escalas 1, 2 y 3 se encuentran en rango normal, sin indicadores de neurosis clásica.`;
  } else if (suma < 180) {
    interpretacion = `Tríada neurótica (Hs+D+Hy) = ${suma}T. Tríada neurótica leve. Presencia de algunos rasgos neuróticos pero sin configurar un cuadro clínico significativo.`;
  } else if (suma < 210) {
    interpretacion = `Tríada neurótica (Hs+D+Hy) = ${suma}T. Tríada neurótica moderada. Combinación de quejas somáticas, estado depresivo y tendencia conversiva que sugiere un cuadro neurótico estructurado.`;
  } else {
    interpretacion = `Tríada neurótica (Hs+D+Hy) = ${suma}T. Tríada neurótica marcada. Perfil clásico de neurosis con fuerte componente somático, depresivo e histriónico. Probable deterioro funcional.`;
  }

  return { hs, d, hy, suma, interpretacion };
}

// Función principal de análisis
export function analizarMMPI2(protocol: MMPI2Protocol): MMPI2AnalysisResult {
  // FASE 1: Análisis de validez
  const validez = analizarValidez(protocol);

  // FASE 2: Análisis de escalas clínicas
  const escalasClinicasInterpretadas = analizarEscalasClinicas(protocol);
  const escalasElevadas = escalasClinicasInterpretadas
    .filter(e => e.elevacion !== 'normal')
    .map(e => e.codigo);

  // FASE 3: Código de perfil
  const codigoPerfil = determinarCodigoPerfil(escalasClinicasInterpretadas);

  // FASE 4: Escalas suplementarias
  const interpretacionSuplementarias = analizarEscalasSuplementarias(protocol);

  // FASE 5: Escalas de contenido
  const interpretacionContenido = analizarEscalasContenido(protocol);

  // Harris-Lingoes
  const interpretacionHarrisLingoes = analizarHarrisLingoes(protocol);

  // Obviedad-Sutilidad
  const razonesObviedadSutilidad = analizarObviedadSutilidad(protocol);

  // Tríada neurótica
  const triadaNeurotica = calcularTriadaNeurotica(protocol);

  // FASE 6: Formulación clínica
  const formulacionClinica = generarFormulacionClinica(
    validez,
    escalasClinicasInterpretadas,
    codigoPerfil,
    interpretacionSuplementarias,
    interpretacionContenido,
    protocol
  );

  return {
    validez,
    escalasClinicasInterpretadas,
    escalasElevadas,
    codigoPerfil,
    interpretacionSuplementarias,
    interpretacionContenido,
    interpretacionHarrisLingoes,
    razonesObviedadSutilidad,
    triadaNeurotica,
    formulacionClinica,
  };
}
