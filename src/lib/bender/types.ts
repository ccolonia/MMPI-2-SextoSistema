// Tipos para el Test de Bender-Koppitz
// Basado en el sistema de Elizabeth Münsterberg Koppitz (1981)

export type FiguraBender = 'A' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'

export type TipoError = 'distorsion' | 'rotacion' | 'integracion' | 'perseveracion'

// Ítem de calificación de la Escala de Maduración
export interface ItemCalificacion {
  id: string           // ej: "1a", "2", "12a"
  figura: FiguraBender // ej: "A", "1", "2"
  tipo: TipoError
  descripcion: string  // criterio exacto de Koppitz
  significanciaDCM?: string  // si es indicador de DCM
  edadSignificancia?: number // edad a partir de la cual es significativo
}

// Indicador Emocional (12 de Koppitz)
export interface IndicadorEmocional {
  id: number           // 1-12
  nombre: string
  definicion: string   // qué se observa en el dibujo
  interpretacion: string // significado clínico
  figuras?: string     // en qué figuras se observa
}

// Indicador de DCM (Disfunción Cerebral Mínima)
export interface IndicadorDCM {
  tipo: 'I' | 'II'    // Tipo I (compensatorio) o Tipo II (defensivo)
  letra: string        // a-h
  descripcion: string
  presente: boolean
}

// Datos del protocolo Bender
export interface BenderProtocol {
  demograficos: {
    nombreEvaluado: string
    fechaNacimiento: string
    edadCronologica: string  // ej: "7 años, 6 meses (7:6)"
    edadAnios: number        // para cálculos
    edadMeses: number
    escolaridad: string
    institucion: string
    motivoConsulta: string
    evaluador: string
    fechaEvaluacion: string
  }
  
  // Observaciones de aplicación
  observaciones: {
    tiempoTotal: string     // ej: "3 min 15 seg"
    tiempoMinutos: number   // para análisis (ej: 3.25)
    lateralidad: string     // "Diestro" | "Zurdo" | "Ambidiestro"
    usoBorrador: string     // "0 intentos" | "1-2 intentos" | "3+ intentos"
    conductaAnclaje: boolean // puso el dedo en la tarjeta
    conductaSubverbalizacion: boolean
    observacionesConducta: string
  }
  
  // Calificación: 30 ítems (1 = error presente, 0 = ausente)
  items: Record<string, number>  // ej: { "1a": 1, "2": 0, "3": 1, ... }
  
  // Indicadores Emocionales (cuáles están presentes)
  indicadoresEmocionales: number[]  // ej: [1, 3, 5, 8]
  
  // Indicadores DCM (cuáles están presentes)
  indicadoresDCM: string[]  // ej: ["I-b", "I-c", "II-a", "II-g"]
}

// Resultado del análisis
export interface BenderAnalysisResult {
  // Eje I: Madurez perceptivo-motriz
  puntajeDirecto: number          // total de errores (0-30)
  edadMaduracionEquivalente: string  // ej: "5 años 9 meses a 5 años 11 meses"
  nivelRendimientoGrado: string    // ej: "Equivalente al inicio de 1.er Año"
  retrasoMeses: number             // retraso respecto a edad cronológica
  retrasoInterpretacion: string    // ej: "Retraso significativo de 1 año y 7 meses"
  
  // Desglose por categoría de error
  erroresPorCategoria: {
    distorsion: number
    rotacion: number
    integracion: number
    perseveracion: number
  }
  
  // Errores detallados (cuáles ítems falló)
  erroresDetalle: Array<{
    item: string
    figura: string
    tipo: string
    descripcion: string
  }>
  
  // Eje II: DCM
  dcmPresente: boolean
  dcmIndicadores: Array<{
    figura: string
    item: string
    criterio: string
    nivel: string  // "Altamente significativo" | "Significativo"
    interpretacion: string
  }>
  dcmTipo1: string[]  // conductas compensatorias presentes
  dcmTipo2: string[]  // conductas defensivas presentes
  
  // Eje III: Indicadores Emocionales
  ieTotal: number
  ieDetalle: Array<{
    id: number
    nombre: string
    definicion: string
    interpretacion: string
  }>
  ieSignificacion: string  // "Sin desajuste" | "Tendencia" | "Desajuste significativo"
  
  // Síntesis
  sintesis: string
  
  // Recomendaciones
  recomendaciones: string[]
}
