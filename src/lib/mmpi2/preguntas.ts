// Preguntas del MMPI-2 extraídas del cuestionario oficial
// Total: 567 ítems

export interface PreguntaMMPI2 {
  number: number;
  text: string;
}

// Importar las preguntas desde el JSON
import preguntasData from './preguntas.json';

export const preguntasMMPI2: PreguntaMMPI2[] = preguntasData as PreguntaMMPI2[];

// Función para obtener una pregunta por número
export const getPreguntaPorNumero = (num: number): PreguntaMMPI2 | undefined => {
  return preguntasMMPI2.find(p => p.number === num);
};

// Función para obtener un rango de preguntas
export const getPreguntasPorRango = (inicio: number, fin: number): PreguntaMMPI2[] => {
  return preguntasMMPI2.filter(p => p.number >= inicio && p.number <= fin);
};

// Total de preguntas
export const TOTAL_PREGUNTAS = 567;

// Preguntas por sección para el cuestionario
export const PREGUNTAS_POR_SECCION = 50;
export const TOTAL_SECCIONES = Math.ceil(TOTAL_PREGUNTAS / PREGUNTAS_POR_SECCION);
