// Los 30 ítems de calificación de la Escala de Maduración de Koppitz
// Basado en el manual de Koppitz (1981)

import { ItemCalificacion, IndicadorEmocional } from './types'

export const ITEMS_CALIFICACION: ItemCalificacion[] = [
  // === FIGURA A ===
  {
    id: '1a',
    figura: 'A',
    tipo: 'distorsion',
    descripcion: 'El cuadrado o el círculo (o ambos) están excesivamente achatados o deformados; un eje del círculo o del cuadrado es el doble de largo que el otro.',
  },
  {
    id: '1b',
    figura: 'A',
    tipo: 'distorsion',
    descripcion: 'Desproporción de tamaño entre el cuadrado y el círculo; uno es el doble de grande que el otro.',
  },
  {
    id: '2',
    figura: 'A',
    tipo: 'rotacion',
    descripcion: 'Rotación parcial o total de la figura o de la tarjeta en 45° o más.',
    significanciaDCM: 'Altamente significativo en todas las edades',
  },
  {
    id: '3',
    figura: 'A',
    tipo: 'integracion',
    descripcion: 'Falla en la integración del círculo y el cuadrado; separación o sobreposición excesiva de más de 3 mm en el punto de unión.',
  },

  // === FIGURA 1 ===
  {
    id: '4',
    figura: '1',
    tipo: 'distorsion',
    descripcion: 'Cinco o más puntos convertidos en círculos (puntos agrandados o parcialmente rellenados no se puntúan).',
  },
  {
    id: '5',
    figura: '1',
    tipo: 'rotacion',
    descripcion: 'Rotación de la figura o de la tarjeta en 45° o más.',
    significanciaDCM: 'Altamente significativo en todas las edades',
  },
  {
    id: '6',
    figura: '1',
    tipo: 'perseveracion',
    descripcion: 'Más de 15 puntos en una hilera.',
    significanciaDCM: 'Altamente significativo a partir de los 7 años',
    edadSignificancia: 7,
  },

  // === FIGURA 2 ===
  {
    id: '7',
    figura: '2',
    tipo: 'rotacion',
    descripcion: 'Rotación del eje de la figura o de la tarjeta en 45° o más.',
  },
  {
    id: '8',
    figura: '2',
    tipo: 'integracion',
    descripcion: 'Omisión o adición de una o dos hileras de círculos; cuatro o más círculos en la mayoría de las columnas; o fusión con la Figura 1.',
    significanciaDCM: 'Altamente significativo a partir de los 6 años',
    edadSignificancia: 6,
  },
  {
    id: '9',
    figura: '2',
    tipo: 'perseveracion',
    descripcion: 'Más de 14 columnas de círculos en una hilera.',
    significanciaDCM: 'Significativo a partir de los 7 años',
    edadSignificancia: 7,
  },

  // === FIGURA 3 ===
  {
    id: '10',
    figura: '3',
    tipo: 'distorsion',
    descripcion: 'Cinco o más puntos convertidos en círculos.',
  },
  {
    id: '11',
    figura: '3',
    tipo: 'rotacion',
    descripcion: 'Rotación del eje de la figura o de la tarjeta en 45° o más.',
  },
  {
    id: '12a',
    figura: '3',
    tipo: 'integracion',
    descripcion: 'Pérdida de la forma; "cabeza de flecha" irreconocible o invertida; conglomeración de puntos; o solo una hilera de puntos.',
    significanciaDCM: 'Significativo a partir de los 5 años',
    edadSignificancia: 5,
  },
  {
    id: '12b',
    figura: '3',
    tipo: 'integracion',
    descripcion: 'Uso de línea continua en lugar de hileras de puntos.',
    significanciaDCM: 'Altamente significativo (puntos por línea)',
  },

  // === FIGURA 4 ===
  {
    id: '13',
    figura: '4',
    tipo: 'rotacion',
    descripcion: 'Rotación de la figura (total o parcial) o de la tarjeta en 45° o más.',
    significanciaDCM: 'Altamente significativo en todas las edades',
  },
  {
    id: '14',
    figura: '4',
    tipo: 'integracion',
    descripcion: 'Separación o superposición de más de 3 mm entre el cuadrado y la curva.',
  },

  // === FIGURA 5 ===
  {
    id: '15',
    figura: '5',
    tipo: 'distorsion',
    descripcion: 'Cinco o más puntos convertidos en círculos.',
  },
  {
    id: '16',
    figura: '5',
    tipo: 'rotacion',
    descripcion: 'Rotación de la figura en 45° o más (total o parcial).',
  },
  {
    id: '17a',
    figura: '5',
    tipo: 'integracion',
    descripcion: 'Línea recta o círculo de puntos en vez de un arco; o la extensión atraviesa el arco.',
  },
  {
    id: '17b',
    figura: '5',
    tipo: 'integracion',
    descripcion: 'Línea continua en vez de puntos en la extensión o en el arco.',
    significanciaDCM: 'Altamente significativo (puntos por línea)',
  },

  // === FIGURA 6 ===
  {
    id: '18a',
    figura: '6',
    tipo: 'distorsion',
    descripcion: 'Tres o más curvas sustituidas por ángulos.',
    significanciaDCM: 'Significativo a partir de los 7 años',
    edadSignificancia: 7,
  },
  {
    id: '18b',
    figura: '6',
    tipo: 'distorsion',
    descripcion: 'Ninguna curva en una o ambas líneas (líneas rectas).',
    significanciaDCM: 'Altamente significativo (curvas por rectas)',
  },
  {
    id: '19',
    figura: '6',
    tipo: 'integracion',
    descripcion: 'Las dos líneas no se cruzan o se cruzan en un extremo de una o ambas líneas.',
  },
  {
    id: '20',
    figura: '6',
    tipo: 'perseveracion',
    descripcion: 'Seis o más curvas/sinusoides completas en cualquiera de las dos líneas.',
  },

  // === FIGURA 7 ===
  {
    id: '21a',
    figura: '7',
    tipo: 'distorsion',
    descripcion: 'Desproporción de tamaño entre los dos hexágonos (uno es el doble del otro).',
  },
  {
    id: '21b',
    figura: '7',
    tipo: 'distorsion',
    descripcion: 'Deformación de los hexágonos por adición u omisión de ángulos.',
  },
  {
    id: '22',
    figura: '7',
    tipo: 'rotacion',
    descripcion: 'Rotación parcial o total de la figura o tarjeta en 45° o más.',
    significanciaDCM: 'Altamente significativo a partir de los 6 años',
    edadSignificancia: 6,
  },
  {
    id: '23',
    figura: '7',
    tipo: 'integracion',
    descripcion: 'Los hexágonos no se superponen o lo hacen excesivamente (un hexágono penetra totalmente dentro del otro).',
  },

  // === FIGURA 8 ===
  {
    id: '24',
    figura: '8',
    tipo: 'distorsion',
    descripcion: 'El hexágono o el rombo están excesivamente deformados; ángulos agregados u omitidos.',
  },
  {
    id: '25',
    figura: '8',
    tipo: 'rotacion',
    descripcion: 'Rotación del eje de la figura o de la tarjeta en 45° o más.',
    significanciaDCM: 'Altamente significativo en todas las edades',
  },
]

// Los 12 Indicadores Emocionales de Koppitz
export const INDICADORES_EMOCIONALES: IndicadorEmocional[] = [
  {
    id: 1,
    nombre: 'Orden Confuso',
    definicion: 'Figuras distribuidas al azar sin secuencia lógica.',
    interpretacion: 'Falla en planificación, confusión mental e impulsividad. Significativo después de los 7 años.',
  },
  {
    id: 2,
    nombre: 'Línea Ondulada',
    definicion: 'Líneas onduladas en lugar de rectas en Fig. 1 y 2.',
    interpretacion: 'Inestabilidad emocional o de coordinación.',
    figuras: '1, 2',
  },
  {
    id: 3,
    nombre: 'Rayas en lugar de Círculos',
    definicion: 'Más de la mitad de los círculos sustituidos por rayas en Fig. 2.',
    interpretacion: 'Impulsividad, agresividad, falta de atención y evitación de la tarea.',
    figuras: '2',
  },
  {
    id: 4,
    nombre: 'Aumento Progresivo de Tamaño',
    definicion: 'Aumento progresivo del tamaño de las figuras 1, 2 y 3.',
    interpretacion: 'Baja tolerancia a la frustración.',
    figuras: '1, 2, 3',
  },
  {
    id: 5,
    nombre: 'Macrografismo (Gran Tamaño)',
    definicion: 'Dibujos un tercio más grandes que la tarjeta estímulo.',
    interpretacion: 'Conductas de acting-out (descarga de impulsos hacia fuera).',
  },
  {
    id: 6,
    nombre: 'Micrografismo (Tamaño Pequeño)',
    definicion: 'Dibujos notablemente pequeños.',
    interpretacion: 'Ansiedad, timidez o retraimiento.',
  },
  {
    id: 7,
    nombre: 'Líneas Finas',
    definicion: 'Trazos excesivamente finos y débiles.',
    interpretacion: 'Timidez y retraimiento extremo.',
  },
  {
    id: 8,
    nombre: 'Repaso del Dibujo',
    definicion: 'Trazos repasados con líneas gruesas e impulsivas.',
    interpretacion: 'Agresividad y hostilidad manifiesta.',
  },
  {
    id: 9,
    nombre: 'Segunda Tentativa',
    definicion: 'El niño abandona un dibujo y empieza en otro lugar.',
    interpretacion: 'Impulsividad y ansiedad.',
  },
  {
    id: 10,
    nombre: 'Expansión',
    definicion: 'Uso de dos o más hojas para completar el test.',
    interpretacion: 'Asociado a perturbación grave o retraso.',
  },
  {
    id: 11,
    nombre: 'Marco alrededor de las Figuras',
    definicion: 'Dibuja un marco o borde alrededor de las figuras.',
    interpretacion: 'Pobre autocontrol; necesidad de límites externos.',
  },
  {
    id: 12,
    nombre: 'Cambios o Añadidos',
    definicion: 'Modifica o añade elementos a las figuras originales.',
    interpretacion: 'Temores, ansiedades o desconexión de la realidad.',
  },
]

// Indicadores de DCM
export const DCM_TIPO_1 = [
  { letra: 'b', descripcion: 'Trazar la figura con el dedo antes de dibujarla' },
  { letra: 'c', descripcion: 'Uso de anclaje (poner el dedo en la tarjeta mientras copia)' },
  { letra: 'd', descripcion: 'Trabajar estrictamente de memoria tras mirar la tarjeta una sola vez' },
  { letra: 'e', descripcion: 'Rotar la tarjeta o el papel para copiar, volviéndolos a su posición original al terminar' },
]

export const DCM_TIPO_2 = [
  { letra: 'a', descripcion: 'Tiempo extremo para terminar (excesivamente largo o menos de 4 min)' },
  { letra: 'b', descripcion: 'Trazar la figura con el dedo' },
  { letra: 'g', descripcion: 'Actos impulsivos: dibujos apresurados o borrar y corregir con esfuerzo extremo' },
  { letra: 'h', descripcion: 'Manifestación de frustración e insatisfacción con los logros' },
]
