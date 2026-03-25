// Tipos para el sistema de interpretación MMPI-2
// Basado en la guía de Sanz (2008) - Universidad de Buenos Aires

// Datos demográficos del evaluado
export interface DemographicData {
  sexo: 'masculino' | 'femenino';
  edad: number;
  contextoEvaluacion: 'clinico' | 'forense' | 'laboral' | 'investigacion';
  motivoConsulta: string;
  fechaEvaluacion: string;
  nombreEvaluado?: string;
  evaluador?: string;
  institucion?: string;
}

// Puntajes de una escala individual
export interface ScaleScore {
  nombre: string;
  bruto: number;
  T: number;
}

// Datos del protocolo MMPI-2
export interface MMPI2Protocol {
  demograficos: DemographicData;
  
  // Escalas de validez
  omisiones: number;
  vrint: number;
  trint: number;
  fBruto: number;
  fT: number;
  fbT: number;
  fpBruto: number;
  f_K: number;
  lBruto: number;
  kBruto: number;
  
  // Escalas clínicas básicas (puntajes T)
  escalasClinicas: {
    Hs: number; // Escala 1 - Hipocondriasis
    D: number;  // Escala 2 - Depresión
    Hy: number; // Escala 3 - Histeria
    Pd: number; // Escala 4 - Desviación Psicopática
    Mf: number; // Escala 5 - Masculinidad-Feminidad
    Pa: number; // Escala 6 - Paranoia
    Pt: number; // Escala 7 - Psicastenia
    Sc: number; // Escala 8 - Esquizofrenia
    Ma: number; // Escala 9 - Hipomanía
    Si: number; // Escala 0 - Introversión Social
  };
  
  // Escalas suplementarias (opcional)
  escalasSuplementarias?: {
    A: number;   // Ansiedad
    R: number;   // Represión
    Es: number;  // Fortaleza del Yo
    MACR: number; // Alcoholismo revisado
    OH: number;  // Hostilidad sobrecontrolada
    PK: number;  // TEPT - Keane
    PS: number;  // TEPT - Schlenger
    Do: number;  // Dominio
    Re: number;  // Responsabilidad social
  };
  
  // Escalas de contenido (opcional)
  escalasContenido?: {
    ANX: number; // Ansiedad
    FRS: number; // Miedos
    OBS: number; // Obsesividad
    DEP: number; // Depresión
    HEA: number; // Preocupaciones de salud
    BIZ: number; // Bizarro
    ANG: number; // Ira
    CYN: number; // Cinismo
    ASP: number; // Conducta antisocial
    TPA: number; // Tipo A
    LSE: number; // Baja autoestima
    SOD: number; // Malestar social
    FAM: number; // Problemas familiares
    WRK: number; // Interferencia laboral
    TRT: number; // Tratamiento negativo
  };
  
  // Subescalas Harris-Lingoes (opcional)
  subescalasHarrisLingoes?: {
    D1: number; D2: number; D3: number; D4: number; D5: number;
    Hy1: number; Hy2: number; Hy3: number; Hy4: number; Hy5: number;
    Pd1: number; Pd2: number; Pd3: number; Pd4: number; Pd5: number;
    Pa1: number; Pa2: number; Pa3: number;
    Sc1: number; Sc2: number; Sc3: number; Sc4: number; Sc5: number; Sc6: number;
    Ma1: number; Ma2: number; Ma3: number; Ma4: number;
    Si1: number; Si2: number; Si3: number;
  };
}

// Resultado del análisis de validez
export interface ValidityAnalysis {
  omisionesStatus: 'confiable' | 'confiable_precaucion' | 'dudoso' | 'invalido';
  omisionesMensaje: string;
  
  vrinStatus: 'normal' | 'inconsistente';
  vrinMensaje: string;
  
  trinStatus: 'normal' | 'aquiescente' | 'negador';
  trinMensaje: string;
  
  fStatus: 'normal' | 'elevado' | 'muy_elevado' | 'invalido';
  fMensaje: string;
  
  fbStatus: 'normal' | 'elevado' | 'muy_elevado' | 'invalido';
  fbMensaje: string;
  
  fFbConsistencia: 'consistente' | 'inconsistente';
  fFbMensaje: string;
  
  fpStatus: 'normal' | 'posible_simulacion';
  fpMensaje: string;
  
  fKStatus: 'normal' | 'exageracion' | 'subreporte';
  fKMensaje: string;
  
  lStatus: 'normal' | 'elevado';
  lMensaje: string;
  
  kStatus: 'normal' | 'bajo' | 'elevado' | 'muy_elevado';
  kMensaje: string;
  
  conclusionGeneral: 'valido' | 'invalido' | 'valido_reservas';
  justificacionValidez: string;
}

// Interpretación de escala clínica
export interface ClinicalScaleInterpretation {
  codigo: string;
  nombre: string;
  puntajeT: number;
  elevacion: 'normal' | 'elevada' | 'muy_elevada';
  interpretacion: string;
  correlatos: string[];
  recomendaciones: string[];
}

// Código de perfil
export interface ProfileCode {
  codigo: string;
  escalasInvolucradas: string[];
  definicion: 'bien_definido' | 'moderadamente_definido' | 'poco_definido';
  interpretacion: string;
  correlatosClinicos: string[];
  pronostico: string;
}

// Resultado del análisis completo
export interface MMPI2AnalysisResult {
  validez: ValidityAnalysis;
  escalasClinicasInterpretadas: ClinicalScaleInterpretation[];
  escalasElevadas: string[];
  codigoPerfil: ProfileCode | null;
  interpretacionSuplementarias: ClinicalScaleInterpretation[];
  interpretacionContenido: ClinicalScaleInterpretation[];
  interpretacionHarrisLingoes: { escala: string; subescalas: { nombre: string; puntaje: number; interpretacion: string }[] }[];
  formulacionClinica: {
    validezProtocolo: string;
    perfilPersonalidad: string;
    areasAfectadas: {
      cognitivo: string;
      afectivo: string;
      conductual: string;
      interpersonal: string;
      somatico: string;
    };
    recursosFortalezas: string[];
    riesgos: string[];
    pronostico: string;
    recomendacionesTerapeuticas: string[];
  };
}

// Constantes para umbrales
export const UMBRALES = {
  OMISIONES: {
    CONFIABLE: 2,
    CON_PRECAUCION: 5,
    DUDOSO: 25,
  },
  T_ELEVADO: 65,
  T_MUY_ELEVADO: 80,
  T_INVALIDO: 110,
  F_K_EXAGERACION: 20,
  F_K_SUBREPORTE: -11,
  L_ELEVADO: 7,
  K_BAJO: 9,
  K_ELEVADO: 22,
  FP_SIMULACION: 8,
  F_FB_INCONSISTENCIA: 7,
  F_FB_INCONSISTENCIA_SEVERA: 10,
};

// Nombres de escalas clínicas
export const NOMBRES_ESCALAS = {
  Hs: 'Hipocondriasis',
  D: 'Depresión',
  Hy: 'Histeria',
  Pd: 'Desviación Psicopática',
  Mf: 'Masculinidad-Feminidad',
  Pa: 'Paranoia',
  Pt: 'Psicastenia',
  Sc: 'Esquizofrenia',
  Ma: 'Hipomanía',
  Si: 'Introversión Social',
};

// Descripciones de escalas clínicas
export const DESCRIPCIONES_ESCALAS = {
  Hs: 'Preocupaciones somáticas excesivas, inmadurez emocional, dificultad para expresar enojo. Tendencia a quejarse de múltiples síntomas físicos sin base orgánica clara.',
  D: 'Depresión clínica, baja autoestima, pesimismo marcado, anhedonia. Sentimientos de desesperanza, culpa excesiva y desvalorización personal.',
  Hy: 'Negación de conflictos emocionales, somatización como mecanismo de defensa, necesidad intensa de aprobación social. Tendencia a la teatralidad.',
  Pd: 'Impulsividad, desacato a normas sociales, externalización de responsabilidades, tendencias manipuladoras. Historia de conflictos con la autoridad.',
  Mf: 'Intereses y actitudes tradicionales del género opuesto. En hombres: sensibilidad estética, intereses artísticos. En mujeres: assertividad, competitividad.',
  Pa: 'Suspicacia, hipersensibilidad a la crítica, ideas de referencia. Tendencia a interpretar acciones ajenas como hostiles o amenazantes.',
  Pt: 'Ansiedad generalizada, rumiación excesiva, inseguridad marcada, tendencias obsesivas. Dificultad para relajarse y alta tensión emocional.',
  Sc: 'Alienación social, pensamiento no convencional, posible confusión cognitiva. Experiencias perceptuales inusuales, aislamiento emocional.',
  Ma: 'Energía expansiva, impulsividad, euforia, desinhibición conductual. Posible grandiosidad, disminución de la necesidad de sueño.',
  Si: 'Introversión social marcada, timidez, inhibición en situaciones sociales. Preferencia por actividades solitarias, dificultades en habilidades sociales.',
};

// Correlatos empíricos por escala
export const CORRELATOS_EMPERICOS = {
  Hs: [
    'Múltiples quejas somáticas sin explicación médica clara',
    'Historia de consultas médicas frecuentes',
    'Uso de mecanismos de somatización',
    'Dificultad para identificar y expresar emociones',
    'Estilo de personalidad dependiente e inmaduro',
    'Pobre respuesta a intervenciones psicológicas tradicionales',
  ],
  D: [
    'Estado de ánimo deprimido persistente',
    'Pérdida de interés en actividades placenteras',
    'Alteraciones del sueño y apetito',
    'Ideación pesimista y autodesvalorización',
    'Riesgo de ideación suicida',
    'Historia de pérdidas significativas',
  ],
  Hy: [
    'Negación de dificultades psicológicas',
    'Síntomas físicos que empeoran con el estrés',
    'Necesidad intensa de atención y aprobación',
    'Estilo interpersonal manipulador sutil',
    'Respuesta inicial positiva al tratamiento pero recaídas frecuentes',
    'Evasión de responsabilidad personal',
  ],
  Pd: [
    'Historia de conflictos con figuras de autoridad',
    'Dificultades laborales y legales',
    'Relaciones interpersonales inestables',
    'Impulsividad y toma de riesgos',
    'Externalización de la responsabilidad',
    'Posible abuso de sustancias',
  ],
  Mf: [
    'Intereses y valores no convencionales para su género',
    'Sensibilidad estética y artística',
    'Posibles conflictos de identidad de género',
    'Estilo de comunicación más expresivo',
    'Mayor empatía y capacidad relacional',
  ],
  Pa: [
    'Desconfianza marcada hacia otros',
    'Sensibilidad excesiva a la crítica',
    'Ideas de referencia y persecución',
    'Dificultad para establecer vínculos terapéuticos',
    'Quejas frecuentes de injusticias',
    'Rigidez cognitiva y moral',
  ],
  Pt: [
    'Ansiedad generalizada y crónica',
    'Rumiación y preocupación excesiva',
    'Síntomas obsesivo-compulsivos',
    'Perfeccionismo autoexigente',
    'Dificultad para tomar decisiones',
    'Tensión muscular y fatiga crónica',
  ],
  Sc: [
    'Pensamiento idiosincrático o bizarro',
    'Experiencias perceptuales inusuales',
    'Aislamiento social y afecto embotado',
    'Dificultades de atención y concentración',
    'Historia de tratamiento psiquiátrico',
    'Posible desorganización conductual',
  ],
  Ma: [
    'Hipereactividad y desinhibición',
    'Disminución de la necesidad de sueño',
    'Grandiosidad y optimismo irrealista',
    'Impulsividad en decisiones importantes',
    'Inicio de múltiples proyectos sin completar',
    'Riesgo de comportamiento maníaco',
  ],
  Si: [
    'Incomodidad en situaciones sociales',
    'Preferencia por actividades solitarias',
    'Dificultad para expresar opiniones',
    'Red social limitada',
    'Sensibilidad al rechazo',
    'Posible evitación social clínicamente significativa',
  ],
};
