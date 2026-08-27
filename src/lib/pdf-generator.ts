// Generador de PDF para informes MMPI-2
// Usa jsPDF para generar PDFs directamente en el navegador

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EscalasClinicas {
  Hs: number;
  D: number;
  Hy: number;
  Pd: number;
  Mf: number;
  Pa: number;
  Pt: number;
  Sc: number;
  Ma: number;
  Si: number;
}

interface Demograficos {
  nombreEvaluado?: string;
  edad?: number;
  sexo?: string;
  fechaEvaluacion?: string;
  contextoEvaluacion?: string;
  motivoConsulta?: string;
  evaluador?: string;
  institucion?: string;
}

interface InformeData {
  demograficos?: Demograficos;
  omisiones?: number;
  vrint?: number;
  trint?: number;
  fBruto?: number;
  fT?: number;
  fbT?: number;
  fpBruto?: number;
  f_K?: number;
  lBruto?: number;
  kBruto?: number;
  escalasClinicas?: EscalasClinicas;
  escalasSuplementarias?: Record<string, number>;
  escalasContenido?: Record<string, number>;
  analysisResult?: any;
}

// Colores
const COLORS = {
  primary: [31, 78, 121] as [number, number, number],
  accent: [46, 125, 50] as [number, number, number],
  warning: [245, 124, 0] as [number, number, number],
  danger: [198, 40, 40] as [number, number, number],
  success: [76, 175, 80] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
};

function getElevationText(tScore: number): string {
  if (tScore >= 80) return 'Muy Elevado';
  if (tScore >= 65) return 'Elevado';
  if (tScore >= 55) return 'Ligeramente Elevado';
  if (tScore >= 45) return 'Normal';
  return 'Bajo';
}

function getElevationColor(tScore: number): [number, number, number] {
  if (tScore >= 80) return COLORS.danger;
  if (tScore >= 65) return COLORS.warning;
  if (tScore >= 55) return [255, 193, 7];
  if (tScore >= 45) return COLORS.accent;
  return [33, 150, 243];
}

export async function generateMMPI2PDF(data: InformeData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // =====================
  // PORTADA
  // =====================
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.primary);
  doc.text('INFORME DE EVALUACIÓN PSICOLÓGICA', pageWidth / 2, y + 20, { align: 'center' });

  doc.setFontSize(32);
  doc.text('MMPI-2', pageWidth / 2, y + 35, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.gray);
  doc.text('Inventario Multifásico de Personalidad de Minnesota-2', pageWidth / 2, y + 45, { align: 'center' });

  // Línea decorativa
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(pageWidth * 0.2, y + 55, pageWidth * 0.8, y + 55);

  // Datos del evaluado
  y = y + 70;
  const demo = data.demograficos || {};

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);

  const demoData = [
    ['Evaluado:', demo.nombreEvaluado || 'No especificado'],
    ['Edad:', demo.edad ? `${demo.edad} años` : 'N/A'],
    ['Sexo:', demo.sexo === 'masculino' ? 'Masculino' : demo.sexo === 'femenino' ? 'Femenino' : 'N/A'],
    ['Fecha de Evaluación:', demo.fechaEvaluacion || new Date().toISOString().split('T')[0]],
    ['Contexto:', demo.contextoEvaluacion || 'Clínico'],
    ['Evaluador:', demo.evaluador || 'No especificado'],
    ['Institución:', demo.institucion || 'No especificada'],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: demoData,
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: COLORS.gray },
      1: { cellWidth: 100 }
    },
    margin: { left: pageWidth / 2 - 75 }
  });

  if (demo.motivoConsulta) {
    y = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text('Motivo de Consulta:', margin, y);
    y += 5;
    const lines = doc.splitTextToSize(demo.motivoConsulta, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  // Referencia
  y = pageHeight - 40;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text('Fundamentado en la Guía de Sanz (2005) - Universidad de Buenos Aires', pageWidth / 2, y, { align: 'center' });
  doc.text('Procedimiento estandarizado de interpretación del MMPI-2', pageWidth / 2, y + 5, { align: 'center' });

  // =====================
  // PÁGINA 2 - ESCALAS DE VALIDEZ
  // =====================
  doc.addPage();
  y = margin;

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text('1. ESCALAS DE VALIDEZ', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  const validezIntro = 'Las escalas de validez evalúan la calidad y consistencia de las respuestas proporcionadas por el evaluado. Son fundamentales para determinar si el protocolo es interpretable.';
  const validezLines = doc.splitTextToSize(validezIntro, pageWidth - margin * 2);
  doc.text(validezLines, margin, y);
  y += 12;

  const validityData = [
    ['Escala', 'Puntaje', 'Interpretación'],
    ['Omisiones (?)', String(data.omisiones || 0), (data.omisiones || 0) <= 10 ? 'Protocolo confiable' : 'Revisar omisiones'],
    ['VRIN (T)', String(data.vrint || 50), (data.vrint || 50) > 70 ? 'Inconsistencia elevada' : 'Consistencia adecuada'],
    ['TRIN (T)', String(data.trint || 50), (data.trint || 50) > 80 ? 'Tendencia aquiescente' : 'Sin tendencia significativa'],
    ['F (T)', String(data.fT || 50), (data.fT || 50) >= 65 ? 'Elevado - posible exageración' : 'Dentro de límites normales'],
    ['Fb (T)', String(data.fbT || 50), 'Similar a F para segmento posterior'],
    ['F(p) Bruto', String(data.fpBruto || 0), (data.fpBruto || 0) > 6 ? 'Posible simulación' : 'Sin evidencia de simulación'],
    ['Índice F-K', String(data.f_K || 0), 'Dentro de límites esperados'],
    ['L (Bruto)', String(data.lBruto || 0), (data.lBruto || 0) > 6 ? 'Presentación socialmente deseable' : 'Sin intento de presentación favorable'],
    ['K (Bruto)', String(data.kBruto || 0), 'Nivel de defensividad apropiado'],
  ];

  autoTable(doc, {
    startY: y,
    head: [validityData[0]],
    body: validityData.slice(1),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 110 }
    }
  });

  // Conclusión de validez
  y = (doc as any).lastAutoTable.finalY + 10;
  const analysis = data.analysisResult || {};
  const validez = analysis.validez || {};
  const conclusion = validez.conclusionGeneral || 'valido';

  let statusText = 'PROTOCOLO VÁLIDO';
  let statusColor = COLORS.success;

  if (conclusion === 'invalido') {
    statusText = 'PROTOCOLO INVÁLIDO';
    statusColor = COLORS.danger;
  } else if (conclusion === 'reservas') {
    statusText = 'PROTOCOLO VÁLIDO CON RESERVAS';
    statusColor = COLORS.warning;
  }

  doc.setFillColor(...statusColor);
  doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(statusText, pageWidth / 2, y + 7, { align: 'center' });

  // =====================
  // ESCALAS CLÍNICAS
  // =====================
  doc.addPage();
  y = margin;

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text('2. ESCALAS CLÍNICAS BÁSICAS', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gray);
  const clinicasIntro = 'Las diez escalas clínicas básicas del MMPI-2 miden diferentes áreas del funcionamiento psicológico. Un puntaje T de 65 o superior se considera clínicamente significativo.';
  const clinicasLines = doc.splitTextToSize(clinicasIntro, pageWidth - margin * 2);
  doc.text(clinicasLines, margin, y);
  y += 12;

  const escalaNombres: Record<string, string> = {
    Hs: '1. Hipocondriasis',
    D: '2. Depresión',
    Hy: '3. Histeria',
    Pd: '4. Desv. Psicopática',
    Mf: '5. Masc-Fem',
    Pa: '6. Paranoia',
    Pt: '7. Psicastenia',
    Sc: '8. Esquizofrenia',
    Ma: '9. Hipomanía',
    Si: '0. Introversión'
  };

  const escalaDesc: Record<string, string> = {
    Hs: 'Preocupación por salud y funciones corporales',
    D: 'Estado de ánimo deprimido, desesperanza',
    Hy: 'Síntomas somáticos ante conflictos emocionales',
    Pd: 'Desacato a normas, impulsividad',
    Mf: 'Intereses que se desvían de roles tradicionales',
    Pa: 'Suspicacia, desconfianza, hipersensibilidad',
    Pt: 'Ansiedad, tensión, rumiación',
    Sc: 'Pensamiento alterado, aislamiento social',
    Ma: 'Hiperactividad, elevación del ánimo',
    Si: 'Introversión, incomodidad social'
  };

  const escalas = data.escalasClinicas || {};
  const clinicalData = [['Escala', 'T', 'Elevación', 'Descripción']];

  for (const codigo of ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si']) {
    const t = escalas[codigo as keyof EscalasClinicas] || 50;
    clinicalData.push([
      escalaNombres[codigo],
      String(Math.round(t)),
      getElevationText(t),
      escalaDesc[codigo]
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [clinicalData[0]],
    body: clinicalData.slice(1),
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: 255 },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 75 }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 1) {
        const tScore = parseInt(hookData.cell.raw as string);
        if (tScore >= 65) {
          hookData.cell.styles.textColor = COLORS.danger;
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // =====================
  // PERFIL PSICOMÉTRICO
  // =====================
  doc.addPage();
  y = margin;

  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text('3. PERFIL PSICOMÉTRICO', margin, y);
  y += 15;

  // Dibujar gráfico de barras simple
  const chartX = margin + 10;
  const chartY = y;
  const chartWidth = pageWidth - margin * 2 - 20;
  const chartHeight = 80;

  // Ejes
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(chartX, chartY, chartWidth, chartHeight);

  // Líneas de referencia
  for (let t = 30; t <= 100; t += 10) {
    const yPos = chartY + chartHeight - ((t - 30) / 70) * chartHeight;
    doc.line(chartX, yPos, chartX + chartWidth, yPos);

    // Etiquetas del eje Y
    if (t % 20 === 0) {
      doc.setFontSize(7);
      doc.setTextColor(...COLORS.gray);
      doc.text(String(t), chartX - 5, yPos + 2, { align: 'right' });
    }
  }

  // Línea T=65
  const t65Y = chartY + chartHeight - ((65 - 30) / 70) * chartHeight;
  doc.setDrawColor(...COLORS.warning);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(chartX, t65Y, chartX + chartWidth, t65Y);
  doc.setLineDashPattern([], 0);
  doc.setFontSize(7);
  doc.text('T=65', chartX + chartWidth + 3, t65Y + 2);

  // Barras
  const barWidth = chartWidth / 10 - 6;
  const codigos = ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'];
  const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  doc.setLineWidth(0);

  codigos.forEach((codigo, i) => {
    const t = escalas[codigo as keyof EscalasClinicas] || 50;
    const barHeight = ((t - 30) / 70) * chartHeight;
    const barX = chartX + (i * (chartWidth / 10)) + 3;
    const barY = chartY + chartHeight - barHeight;

    // Color según elevación
    doc.setFillColor(...getElevationColor(t));
    doc.rect(barX, barY, barWidth, barHeight, 'F');

    // Etiqueta del eje X
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text(labels[i], barX + barWidth / 2, chartY + chartHeight + 5, { align: 'center' });
  });

  // Leyenda
  y = chartY + chartHeight + 20;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.primary);
  doc.text('Interpretación del Perfil:', margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray);
  doc.text('• Los puntajes T ≥ 65 (línea punteada naranja) indican elevaciones clínicamente significativas.', margin, y);
  y += 4;
  doc.text('• Los puntajes T ≥ 80 indican elevaciones severas que requieren atención prioritaria.', margin, y);

  // =====================
  // INTERPRETACIÓN DEL PERFIL
  // =====================
  y += 15;
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text('4. INTERPRETACIÓN DEL PERFIL', margin, y);
  y += 8;

  const codigoPerfil = analysis.codigoPerfil || {};
  const formulacion = analysis.formulacionClinica || {};

  if (codigoPerfil.codigo) {
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.accent);
    doc.text(`Código de Perfil: ${codigoPerfil.codigo}`, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    if (codigoPerfil.interpretacion) {
      const interpLines = doc.splitTextToSize(codigoPerfil.interpretacion, pageWidth - margin * 2);
      doc.text(interpLines, margin, y);
      y += interpLines.length * 4 + 5;
    }
  }

  // =====================
  // FORMULACIÓN CLÍNICA
  // =====================
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text('5. FORMULACIÓN CLÍNICA', margin, y);
  y += 8;

  if (formulacion.perfilPersonalidad) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text('Perfil de Personalidad:', margin, y);
    y += 5;
    const perfilLines = doc.splitTextToSize(formulacion.perfilPersonalidad, pageWidth - margin * 2);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(perfilLines, margin, y);
    y += perfilLines.length * 4 + 8;
  }

  // Recursos
  if (formulacion.recursosFortalezas?.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text('Recursos y Fortalezas:', margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.success);
    formulacion.recursosFortalezas.slice(0, 5).forEach((r: string) => {
      doc.text(`+ ${r}`, margin + 3, y);
      y += 4;
    });
    y += 3;
  }

  // Riesgos
  if (formulacion.riesgos?.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.gray);
    doc.text('Riesgos Identificados:', margin, y);
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.danger);
    formulacion.riesgos.slice(0, 5).forEach((r: string) => {
      doc.text(`! ${r}`, margin + 3, y);
      y += 4;
    });
    y += 3;
  }

  // =====================
  // RECOMENDACIONES
  // =====================
  if (formulacion.recomendacionesTerapeuticas?.length > 0) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.text('6. RECOMENDACIONES', margin, y);
    y += 8;

    const recData = formulacion.recomendacionesTerapeuticas.slice(0, 6).map((r: string, i: number) => [
      String(i + 1),
      r
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Recomendación']],
      body: recData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: COLORS.primary, textColor: 255 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: pageWidth - margin * 2 - 15 }
      }
    });
  }

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Generado el ${new Date().toLocaleDateString('es-ES')}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Devolver como Blob
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
