// Tabla de conversión de Puntaje Directo (PD) a Edad de Maduración Visomotriz
// Basado en Koppitz (1974/1981)

export interface EdadMaduracion {
  pd: number
  edad: string
  nivelGrado: string
}

export const TABLA_EDAD_MADURACION: EdadMaduracion[] = [
  { pd: 0, edad: '11 años 0 meses a 11 años 11 meses', nivelGrado: 'Madurez viso-motriz adecuada para edad escolar avanzada' },
  { pd: 1, edad: '10 años 0 meses a 10 años 11 meses', nivelGrado: 'Madurez viso-motriz adecuada para 4.º-5.º grado' },
  { pd: 2, edad: '9 años 0 meses a 9 años 11 meses', nivelGrado: 'Madurez viso-motriz adecuada para 3.º-4.º grado' },
  { pd: 3, edad: '8 años 6 meses a 8 años 11 meses', nivelGrado: 'Equivalente a 3.º grado de primaria' },
  { pd: 4, edad: '8 años 0 meses a 8 años 5 meses', nivelGrado: 'Equivalante a 2.º-3.º grado de primaria' },
  { pd: 5, edad: '7 años 6 meses a 7 años 11 meses', nivelGrado: 'Equivalente a 2.º grado de primaria' },
  { pd: 6, edad: '7 años 0 meses a 7 años 5 meses', nivelGrado: 'Equivalente a 1.º-2.º grado de primaria' },
  { pd: 7, edad: '6 años 6 meses a 6 años 11 meses', nivelGrado: 'Equivalente a 1.º grado de primaria' },
  { pd: 8, edad: '6 años 0 meses a 6 años 5 meses', nivelGrado: 'Equivalente al inicio de 1.º grado' },
  { pd: 9, edad: '5 años 9 meses a 5 años 11 meses', nivelGrado: 'Equivalente al inicio de 1.er Año / Pre-primaria' },
  { pd: 10, edad: '5 años 6 meses a 5 años 8 meses', nivelGrado: 'Nivel mínimo de madurez para iniciar aprendizaje escolar (Pre-primaria)' },
  { pd: 11, edad: '5 años 4 meses a 5 años 5 meses', nivelGrado: 'Pre-escolar (Kínder superior)' },
  { pd: 12, edad: '5 años 2 meses a 5 años 3 meses', nivelGrado: 'Pre-escolar (Kínder superior)' },
  { pd: 13, edad: '5 años 0 meses a 5 años 1 mes', nivelGrado: 'Pre-escolar (Kínder)' },
  { pd: 14, edad: '4 años 10 meses a 4 años 11 meses', nivelGrado: 'Pre-escolar (Kínder)' },
  { pd: 15, edad: '4 años 8 meses a 4 años 9 meses', nivelGrado: 'Pre-escolar (Pre-kínder)' },
  { pd: 16, edad: '4 años 6 meses a 4 años 7 meses', nivelGrado: 'Pre-escolar (Pre-kínder)' },
  { pd: 17, edad: '4 años 4 meses a 4 años 5 meses', nivelGrado: 'Nivel maternal/Jardín' },
  { pd: 18, edad: '4 años 2 meses a 4 años 3 meses', nivelGrado: 'Nivel maternal/Jardín' },
  { pd: 19, edad: '4 años 1 mes', nivelGrado: 'Nivel maternal/Jardín' },
  { pd: 20, edad: '4 años 0 meses', nivelGrado: 'Nivel maternal/Jardín' },
]

export function obtenerEdadMaduracion(pd: number): EdadMaduracion {
  if (pd >= 21) {
    return { pd, edad: 'Menor a 4 años 0 meses', nivelGrado: 'Funcionamiento muy inmaduro — requiere evaluación profunda' }
  }
  const entrada = TABLA_EDAD_MADURACION.find(e => e.pd === pd)
  return entrada || TABLA_EDAD_MADURACION[TABLA_EDAD_MADURACION.length - 1]
}

// Calcular retraso en meses
export function calcularRetraso(edadCronologicaMeses: number, pd: number): { meses: number, interpretacion: string } {
  const entrada = obtenerEdadMaduracion(pd)
  
  // Extraer edad mínima de maduración en meses de la cadena
  // ej: "5 años 9 meses a 5 años 11 meses" → 5*12+9 = 69 meses
  const match = entrada.edad.match(/(\d+) años?\s*(?:(\d+) meses?)?/)
  if (!match) return { meses: 0, interpretacion: 'No se pudo calcular el retraso' }
  
  const anios = parseInt(match[1]) || 0
  const meses = parseInt(match[2]) || 0
  const edadMaduracionMeses = anios * 12 + meses
  
  const retrasoMeses = edadCronologicaMeses - edadMaduracionMeses
  
  let interpretacion = ''
  if (retrasoMeses <= 0) {
    interpretacion = 'Sin retraso. La edad de maduración visomotriz es congruente o superior a la edad cronológica.'
  } else if (retrasoMeses <= 6) {
    interpretacion = `Retraso leve de ${retrasoMeses} meses en la integración perceptivo-motriz.`
  } else if (retrasoMeses <= 12) {
    interpretacion = `Retraso moderado de ${retrasoMeses} meses (aproximadamente ${Math.floor(retrasoMeses / 12)} año${retrasoMeses % 12 > 0 ? ' y ' + (retrasoMeses % 12) + ' meses' : ''}) en la integración perceptivo-motriz.`
  } else {
    const aniosRetraso = Math.floor(retrasoMeses / 12)
    const mesesRestantes = retrasoMeses % 12
    interpretacion = `Retraso significativo de ${aniosRetraso} año${aniosRetraso > 1 ? 's' : ''}${mesesRestantes > 0 ? ' y ' + mesesRestantes + ' meses' : ''} en la integración perceptivo-motriz.`
  }
  
  return { meses: retrasoMeses, interpretacion }
}
