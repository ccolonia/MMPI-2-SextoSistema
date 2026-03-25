#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de Informes MMPI-2 en PDF - Versión Completa
Basado en la Guía de Sanz (2008) - Universidad de Buenos Aires
Incluye: Datos, Validez, Escalas Clínicas, Subescalas, Perfil, Interpretación, Formulación Clínica
"""

import sys
import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.graphics.shapes import Drawing, Line, String
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics.widgets.markers import makeMarker

# Registrar fuentes con soporte completo para español
pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSerifBold', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))

# Registrar familias de fuentes
registerFontFamily('DejaVuSerif', normal='DejaVuSerif', bold='DejaVuSerifBold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSansBold')

# Colores corporativos
HEADER_COLOR = colors.HexColor('#1F4E79')
HEADER_TEXT = colors.white
ROW_EVEN = colors.white
ROW_ODD = colors.HexColor('#F5F5F5')
ACCENT_COLOR = colors.HexColor('#2E7D32')
WARNING_COLOR = colors.HexColor('#F57C00')
DANGER_COLOR = colors.HexColor('#C62828')
VALID_COLOR = colors.HexColor('#4CAF50')

def create_styles():
    """Crear estilos personalizados para el documento"""
    styles = getSampleStyleSheet()
    
    # Título principal
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName='DejaVuSansBold',
        fontSize=24,
        leading=30,
        alignment=TA_CENTER,
        spaceAfter=10,
        textColor=colors.HexColor('#1F4E79')
    ))
    
    # Subtítulo
    styles.add(ParagraphStyle(
        name='SubTitle',
        fontName='DejaVuSans',
        fontSize=12,
        leading=16,
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor('#666666')
    ))
    
    # Encabezado de sección
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='DejaVuSansBold',
        fontSize=14,
        leading=18,
        alignment=TA_LEFT,
        spaceBefore=14,
        spaceAfter=10,
        textColor=colors.HexColor('#1F4E79'),
        borderPadding=4,
    ))
    
    # Subsección
    styles.add(ParagraphStyle(
        name='SubSectionHeader',
        fontName='DejaVuSansBold',
        fontSize=12,
        leading=16,
        alignment=TA_LEFT,
        spaceBefore=10,
        spaceAfter=6,
        textColor=colors.HexColor('#2E7D32'),
    ))
    
    # Cuerpo de texto
    styles.add(ParagraphStyle(
        name='CustomBodyText',
        fontName='DejaVuSerif',
        fontSize=12,
        leading=16,
        alignment=TA_JUSTIFY,
        spaceAfter=6
    ))
    
    # Texto para tablas
    styles.add(ParagraphStyle(
        name='TableText',
        fontName='DejaVuSerif',
        fontSize=11,
        leading=14,
        alignment=TA_CENTER
    ))
    
    # Texto izquierda para tablas
    styles.add(ParagraphStyle(
        name='TableTextLeft',
        fontName='DejaVuSerif',
        fontSize=11,
        leading=14,
        alignment=TA_LEFT
    ))
    
    # Encabezado de tabla
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='DejaVuSansBold',
        fontSize=11,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white
    ))
    
    # Texto pequeño
    styles.add(ParagraphStyle(
        name='SmallText',
        fontName='DejaVuSerif',
        fontSize=10,
        leading=12,
        alignment=TA_LEFT,
        textColor=colors.HexColor('#666666')
    ))
    
    # Texto de interpretación
    styles.add(ParagraphStyle(
        name='InterpretText',
        fontName='DejaVuSerif',
        fontSize=12,
        leading=16,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
        leftIndent=15
    ))
    
    # Texto de nota/alerta
    styles.add(ParagraphStyle(
        name='AlertText',
        fontName='DejaVuSerif',
        fontSize=12,
        leading=16,
        alignment=TA_LEFT,
        spaceAfter=6,
        backColor=colors.HexColor('#FFF3E0'),
        borderPadding=6
    ))
    
    return styles


def get_t_color(t_score):
    """Obtener color según puntaje T"""
    if t_score >= 80:
        return DANGER_COLOR
    elif t_score >= 65:
        return WARNING_COLOR
    elif t_score >= 55:
        return colors.HexColor('#FFC107')
    elif t_score >= 45:
        return ACCENT_COLOR
    else:
        return colors.HexColor('#2196F3')


def get_elevation_text(t_score):
    """Obtener texto de elevación según puntaje T"""
    if t_score >= 80:
        return 'Muy Elevado'
    elif t_score >= 65:
        return 'Elevado'
    elif t_score >= 55:
        return 'Ligeramente Elevado'
    elif t_score >= 45:
        return 'Normal'
    else:
        return 'Bajo'


def get_elevation_color_text(t_score):
    """Obtener color de texto según elevación"""
    if t_score >= 80:
        return colors.HexColor('#B71C1C')
    elif t_score >= 65:
        return colors.HexColor('#E65100')
    elif t_score >= 55:
        return colors.HexColor('#F57F17')
    else:
        return colors.HexColor('#1B5E20')


def create_cover_page(story, styles, data):
    """Crear página de portada"""
    story.append(Spacer(1, 1.5*inch))
    
    # Título principal
    story.append(Paragraph(
        'INFORME DE EVALUACIÓN PSICOLÓGICA',
        styles['MainTitle']
    ))
    story.append(Paragraph(
        'MMPI-2',
        styles['MainTitle']
    ))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Subtítulo
    story.append(Paragraph(
        'Inventario Multifásico de Personalidad de Minnesota-2',
        styles['SubTitle']
    ))
    
    story.append(Spacer(1, 0.4*inch))
    
    # Línea decorativa
    story.append(HRFlowable(
        width="60%",
        thickness=2,
        color=ACCENT_COLOR,
        spaceBefore=10,
        spaceAfter=10
    ))
    
    story.append(Spacer(1, 0.4*inch))
    
    # Datos del evaluado (portada)
    demograficos = data.get('demograficos', {})
    cover_data = [
        ['Evaluado:', demograficos.get('nombreEvaluado', 'No especificado')],
        ['Edad:', f"{demograficos.get('edad', 'N/A')} años"],
        ['Sexo:', 'Masculino' if demograficos.get('sexo') == 'masculino' else 'Femenino'],
        ['Fecha de Evaluación:', demograficos.get('fechaEvaluacion', datetime.now().strftime('%Y-%m-%d'))],
        ['Contexto:', demograficos.get('contextoEvaluacion', 'Clínico').capitalize()],
    ]
    
    cover_table = Table(cover_data, colWidths=[2*inch, 4*inch])
    cover_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'DejaVuSerif'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#333333')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(cover_table)
    
    story.append(Spacer(1, 0.6*inch))
    
    # Evaluador e institución
    evaluador = demograficos.get('evaluador', '')
    institucion = demograficos.get('institucion', '')
    motivo = demograficos.get('motivoConsulta', '')
    
    if evaluador:
        story.append(Paragraph(f"<b>Evaluador:</b> {evaluador}", styles['SubTitle']))
    if institucion:
        story.append(Paragraph(f"<b>Institución:</b> {institucion}", styles['SubTitle']))
    
    if motivo:
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(f"<b>Motivo de Consulta:</b> {motivo}", styles['CustomBodyText']))
    
    story.append(Spacer(1, 0.8*inch))
    
    # Referencia
    story.append(Paragraph(
        'Fundamentado en la Guía de Sanz (2005) - Universidad de Buenos Aires',
        styles['SmallText']
    ))
    story.append(Paragraph(
        'Procedimiento estandarizado de interpretación del MMPI-2',
        styles['SmallText']
    ))
    
    story.append(PageBreak())


def create_demographics_section(story, styles, data):
    """Crear sección de datos demográficos"""
    story.append(Paragraph('<b>1. DATOS DEL EVALUADO</b>', styles['SectionHeader']))
    
    demograficos = data.get('demograficos', {})
    motivo = demograficos.get('motivoConsulta', '')
    
    demo_data = [
        [Paragraph('<b>Campo</b>', styles['TableHeader']), 
         Paragraph('<b>Valor</b>', styles['TableHeader'])],
        [Paragraph('Nombre Completo', styles['TableTextLeft']), 
         Paragraph(demograficos.get('nombreEvaluado', 'No especificado'), styles['TableTextLeft'])],
        [Paragraph('Edad', styles['TableTextLeft']), 
         Paragraph(f"{demograficos.get('edad', 'N/A')} años", styles['TableTextLeft'])],
        [Paragraph('Sexo', styles['TableTextLeft']), 
         Paragraph('Masculino' if demograficos.get('sexo') == 'masculino' else 'Femenino', styles['TableTextLeft'])],
        [Paragraph('Fecha de Evaluación', styles['TableTextLeft']), 
         Paragraph(demograficos.get('fechaEvaluacion', 'N/A'), styles['TableTextLeft'])],
        [Paragraph('Contexto de Evaluación', styles['TableTextLeft']), 
         Paragraph(demograficos.get('contextoEvaluacion', 'N/A').capitalize(), styles['TableTextLeft'])],
        [Paragraph('Evaluador', styles['TableTextLeft']), 
         Paragraph(demograficos.get('evaluador', 'No especificado'), styles['TableTextLeft'])],
        [Paragraph('Institución', styles['TableTextLeft']), 
         Paragraph(demograficos.get('institucion', 'No especificada'), styles['TableTextLeft'])],
    ]
    
    if motivo:
        demo_data.append([Paragraph('Motivo de Consulta', styles['TableTextLeft']), 
                         Paragraph(motivo, styles['TableTextLeft'])])
    
    demo_table = Table(demo_data, colWidths=[2.3*inch, 4.2*inch])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]))
    
    story.append(demo_table)
    story.append(Spacer(1, 15))


def create_validity_section(story, styles, data):
    """Crear sección de escalas de validez - COMPLETA"""
    story.append(Paragraph('<b>2. ESCALAS DE VALIDEZ</b>', styles['SectionHeader']))
    
    story.append(Paragraph(
        'Las escalas de validez evalúan la calidad y consistencia de las respuestas proporcionadas por el evaluado. '
        'Son fundamentales para determinar si el protocolo es interpretable.',
        styles['CustomBodyText']
    ))
    story.append(Spacer(1, 8))
    
    # Datos de validez
    omisiones = data.get('omisiones', 0)
    f_t = data.get('fT', 50)
    l_bruto = data.get('lBruto', 0)
    k_bruto = data.get('kBruto', 0)
    vrint = data.get('vrint', 50)
    trint = data.get('trint', 50)
    fbT = data.get('fbT', 50)
    fp_bruto = data.get('fpBruto', 3)
    f_k = data.get('f_K', 0)
    
    # Tabla de escalas de validez
    validity_data = [
        [Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>Puntaje</b>', styles['TableHeader']),
         Paragraph('<b>Interpretación</b>', styles['TableHeader'])]
    ]
    
    # Interpretaciones detalladas
    def get_omisiones_interp(o):
        if o <= 10:
            return 'Protocolo confiable para interpretación'
        elif o <= 20:
            return 'Confiable con precaución - Interpretar con reservas'
        elif o <= 30:
            return 'Validez dudosa - Resultados cuestionables'
        else:
            return 'Protocolo INVÁLIDO por exceso de omisiones'
    
    def get_vrin_interp(v):
        if v > 80:
            return 'INVÁLIDO - Inconsistencia severa en respuestas'
        elif v > 70:
            return 'Inconsistencia elevada - Respuestas contradictorias'
        elif v > 65:
            return 'Inconsistencia moderada - Precaución en interpretación'
        else:
            return 'Consistencia adecuada en las respuestas'
    
    def get_trin_interp(t):
        if t > 80:
            return 'Tendencia aquiescente marcada - Responde "Verdadero" indiscriminadamente'
        elif t < 50:
            return 'Tendencia negadora - Responde "Falso" indiscriminadamente'
        else:
            return 'Sin tendencia de respuesta significativa'
    
    def get_f_interp(f):
        if f >= 100:
            return 'INVÁLIDO - Respuestas aleatorias o simulación severa'
        elif f >= 80:
            return 'Muy elevado - Posible exageración severa o psicopatología extrema'
        elif f >= 65:
            return 'Elevado - Malestar significativo o tendencia a exagerar'
        else:
            return 'Puntuación dentro de límites normales'
    
    def get_l_interp(l):
        if l > 10:
            return 'Elevado - Presentación socialmente deseable, defensividad marcada'
        elif l > 6:
            return 'Ligeramente elevado - Alguna tendencia a presentarse favorablemente'
        else:
            return 'Sin intento evidente de presentación socialmente deseable'
    
    def get_k_interp(k):
        if k >= 20:
            return 'Defensividad extrema - Minimización de problemas'
        elif k > 15:
            return 'Defensividad elevada - Tendencia a minimizar dificultades'
        elif k < 8:
            return 'K bajo - Posible exageración de síntomas o malestar significativo'
        else:
            return 'Nivel de defensividad apropiado'
    
    validity_rows = [
        ('Omisiones (?)', str(omisiones), get_omisiones_interp(omisiones)),
        ('VRIN (T)', str(vrint), get_vrin_interp(vrint)),
        ('TRIN (T)', str(trint), get_trin_interp(trint)),
        ('F (T)', str(f_t), get_f_interp(f_t)),
        ('Fb (T)', str(fbT), 'Similar interpretación que F para segmento posterior'),
        ('F(p) (Bruto)', str(fp_bruto), 'Posible simulación' if fp_bruto > 6 else 'Sin evidencia de simulación'),
        ('Índice F-K', str(f_k), 'Posible exageración' if f_k > 6 else ('Posible sub-reporte' if f_k < -6 else 'Dentro de límites esperados')),
        ('L (Bruto)', str(l_bruto), get_l_interp(l_bruto)),
        ('K (Bruto)', str(k_bruto), get_k_interp(k_bruto)),
    ]
    
    for escala, puntaje, interp in validity_rows:
        validity_data.append([
            Paragraph(escala, styles['TableTextLeft']),
            Paragraph(f"<b>{puntaje}</b>", styles['TableText']),
            Paragraph(interp, styles['TableTextLeft'])
        ])
    
    validity_table = Table(validity_data, colWidths=[1.4*inch, 0.8*inch, 4.3*inch])
    validity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]))
    
    story.append(validity_table)
    story.append(Spacer(1, 10))
    
    # Conclusión de validez
    analysis = data.get('analysisResult', {})
    validez = analysis.get('validez', {})
    conclusion = validez.get('conclusionGeneral', 'valido')
    justificacion = validez.get('justificacionValidez', 'No disponible')
    
    # Determinar color y estilo según conclusión
    if conclusion == 'valido':
        bg_color = colors.HexColor('#E8F5E9')
        border_color = VALID_COLOR
        status_text = 'PROTOCOLO VÁLIDO'
    elif conclusion == 'invalido':
        bg_color = colors.HexColor('#FFEBEE')
        border_color = DANGER_COLOR
        status_text = 'PROTOCOLO INVÁLIDO'
    else:
        bg_color = colors.HexColor('#FFF3E0')
        border_color = WARNING_COLOR
        status_text = 'PROTOCOLO VÁLIDO CON RESERVAS'
    
    # Tabla de conclusión
    conclusion_data = [
        [Paragraph(f'<b>CONCLUSIÓN: {status_text}</b>', styles['TableHeader'])]
    ]
    conclusion_table = Table(conclusion_data, colWidths=[6.5*inch])
    conclusion_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), border_color),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(conclusion_table)
    
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"<b>Justificación:</b> {justificacion}", styles['InterpretText']))
    story.append(Spacer(1, 12))


def create_clinical_scales_section(story, styles, data):
    """Crear sección de escalas clínicas básicas - COMPLETA"""
    story.append(Paragraph('<b>3. ESCALAS CLÍNICAS BÁSICAS</b>', styles['SectionHeader']))
    
    story.append(Paragraph(
        'Las diez escalas clínicas básicas del MMPI-2 miden diferentes áreas del funcionamiento psicológico. '
        'Un puntaje T de 65 o superior se considera clínicamente significativo.',
        styles['CustomBodyText']
    ))
    story.append(Spacer(1, 8))
    
    escalas = data.get('escalasClinicas', {})
    analysis = data.get('analysisResult', {})
    escalas_interp = analysis.get('escalasClinicasInterpretadas', [])
    
    # Nombres completos de escalas
    escala_nombres = {
        'Hs': '1. Hipocondriasis',
        'D': '2. Depresión',
        'Hy': '3. Histeria',
        'Pd': '4. Desviación Psicopática',
        'Mf': '5. Masculinidad-Feminidad',
        'Pa': '6. Paranoia',
        'Pt': '7. Psicastenia',
        'Sc': '8. Esquizofrenia',
        'Ma': '9. Hipomanía',
        'Si': '0. Introversión Social'
    }
    
    # Descripciones de escalas
    escala_descripciones = {
        'Hs': 'Preocupación excesiva por la salud y funciones corporales, quejas somáticas múltiples.',
        'D': 'Estado de ánimo deprimido, desesperanza, falta de energía e ideación suicida potencial.',
        'Hy': 'Tendencia a responder con síntomas somáticos ante conflictos emocionales, inmadurez.',
        'Pd': 'Desacato a normas sociales, impulsividad, conflictos con la autoridad, conducta antisocial.',
        'Mf': 'Intereses y actitudes que se desvían de los roles de género tradicionales.',
        'Pa': 'Suspicacia, desconfianza, hipersensibilidad a la crítica, posibles ideas paranoides.',
        'Pt': 'Ansiedad, tensión, rumiación, indecisión, perfeccionismo y malestar psicológico general.',
        'Sc': 'Pensamiento alterado, aislamiento social, posible desorganización psicótica.',
        'Ma': 'Hiperactividad, elevación del ánimo, impulsividad, baja necesidad de sueño.',
        'Si': 'Introversión social, incomodidad en situaciones interpersonales, aislamiento.'
    }
    
    # Tabla principal de escalas
    clinical_data = [
        [Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>T</b>', styles['TableHeader']),
         Paragraph('<b>Elevación</b>', styles['TableHeader']),
         Paragraph('<b>Descripción</b>', styles['TableHeader'])]
    ]
    
    for codigo in ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si']:
        t_score = escalas.get(codigo, 50)
        nombre = escala_nombres.get(codigo, codigo)
        elevacion = get_elevation_text(t_score)
        descripcion = escala_descripciones.get(codigo, '')
        
        clinical_data.append([
            Paragraph(nombre, styles['TableTextLeft']),
            Paragraph(f"<b>{int(t_score)}</b>", styles['TableText']),
            Paragraph(elevacion, styles['TableText']),
            Paragraph(descripcion, styles['TableTextLeft'])
        ])
    
    clinical_table = Table(clinical_data, colWidths=[1.6*inch, 0.5*inch, 1.1*inch, 3.3*inch])
    
    # Estilos de tabla
    table_styles = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]
    
    # Agregar colores según puntaje T
    for i, codigo in enumerate(['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si'], 1):
        t_score = escalas.get(codigo, 50)
        if t_score >= 65:
            table_styles.append(('TEXTCOLOR', (1, i), (2, i), get_elevation_color_text(t_score)))
    
    clinical_table.setStyle(TableStyle(table_styles))
    story.append(clinical_table)
    
    # Leyenda
    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>Leyenda de Puntajes T:</b>', styles['CustomBodyText']))
    legend_items = [
        ('Normal (45-54)', 'Funcionamiento dentro de límites normativos', ACCENT_COLOR),
        ('Ligeramente Elevado (55-64)', 'Indicadores leves, monitorear', colors.HexColor('#FFC107')),
        ('Elevado (65-79)', 'Indicadores significativos, probablemente relevante', WARNING_COLOR),
        ('Muy Elevado (80+)', 'Indicadores severos, requiere atención prioritaria', DANGER_COLOR),
    ]
    
    legend_text = '<br/>'.join([f'<font color="{c.hexval()}">&#9632;</font> <b>{l}:</b> {d}' for l, d, c in legend_items])
    story.append(Paragraph(legend_text, styles['InterpretText']))
    story.append(Spacer(1, 10))
    
    # Interpretaciones detalladas de escalas elevadas
    elevadas = [e for e in escalas_interp if e.get('elevacion') != 'normal']
    if elevadas:
        story.append(Paragraph('<b>Interpretación de Escalas Elevadas:</b>', styles['SubSectionHeader']))
        for escala in elevadas[:5]:
            codigo = escala.get('codigo', '')
            nombre = escala.get('nombre', '')
            puntaje = escala.get('puntajeT', 0)
            interpretacion = escala.get('interpretacion', '')
            
            story.append(Paragraph(
                f"<b>{codigo} - {nombre}</b> (T={puntaje}):",
                styles['CustomBodyText']
            ))
            story.append(Paragraph(interpretacion, styles['InterpretText']))
            
            correlatos = escala.get('correlatos', [])
            if correlatos:
                story.append(Paragraph(
                    f"<i>Correlatos: {', '.join(correlatos[:3])}</i>",
                    styles['SmallText']
                ))
        story.append(Spacer(1, 10))


def create_supplementary_scales_section(story, styles, data):
    """Crear sección de escalas suplementarias"""
    story.append(Paragraph('<b>4. ESCALAS SUPLEMENTARIAS</b>', styles['SectionHeader']))
    
    story.append(Paragraph(
        'Las escalas suplementarias proporcionan información adicional sobre áreas específicas del funcionamiento.',
        styles['CustomBodyText']
    ))
    story.append(Spacer(1, 8))
    
    protocol = data.get('escalasSuplementarias', {})
    analysis = data.get('analysisResult', {})
    sup_interp = analysis.get('interpretacionSuplementarias', [])
    
    if not protocol:
        story.append(Paragraph('No se dispuso de datos de escalas suplementarias para este evaluado.', styles['CustomBodyText']))
        story.append(Spacer(1, 10))
        return
    
    # Nombres de escalas suplementarias
    nombres = {
        'A': 'Ansiedad',
        'R': 'Represión',
        'Es': 'Fortaleza del Yo',
        'MACR': 'Alcoholismo MAC-R',
        'OH': 'Hostilidad Sobrecontrolada',
        'PK': 'TEPT Keane',
        'PS': 'TEPT Schlenger',
        'Do': 'Dominio',
        'Re': 'Responsabilidad Social'
    }
    
    sup_data = [
        [Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>T</b>', styles['TableHeader']),
         Paragraph('<b>Elevación</b>', styles['TableHeader']),
         Paragraph('<b>Interpretación</b>', styles['TableHeader'])]
    ]
    
    for codigo, puntaje in protocol.items():
        nombre = nombres.get(codigo, codigo)
        elevacion = get_elevation_text(puntaje)
        
        # Buscar interpretación del análisis
        interp_obj = next((s for s in sup_interp if s.get('codigo') == codigo), None)
        interpretacion = interp_obj.get('interpretacion', 'Sin interpretación disponible') if interp_obj else 'Sin interpretación disponible'
        
        sup_data.append([
            Paragraph(nombre, styles['TableTextLeft']),
            Paragraph(f"<b>{int(puntaje)}</b>", styles['TableText']),
            Paragraph(elevacion, styles['TableText']),
            Paragraph(interpretacion[:80] + ('...' if len(interpretacion) > 80 else ''), styles['TableTextLeft'])
        ])
    
    sup_table = Table(sup_data, colWidths=[1.4*inch, 0.5*inch, 0.9*inch, 3.7*inch])
    sup_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]))
    
    story.append(sup_table)
    story.append(Spacer(1, 10))


def create_content_scales_section(story, styles, data):
    """Crear sección de escalas de contenido"""
    story.append(Paragraph('<b>5. ESCALAS DE CONTENIDO</b>', styles['SectionHeader']))
    
    story.append(Paragraph(
        'Las escalas de contenido evalúan áreas específicas de preocupación y sintomatología reportada por el evaluado.',
        styles['CustomBodyText']
    ))
    story.append(Spacer(1, 8))
    
    protocol = data.get('escalasContenido', {})
    analysis = data.get('analysisResult', {})
    cont_interp = analysis.get('interpretacionContenido', [])
    
    if not protocol:
        story.append(Paragraph('No se dispuso de datos de escalas de contenido para este evaluado.', styles['CustomBodyText']))
        story.append(Spacer(1, 10))
        return
    
    nombres = {
        'ANX': 'Ansiedad', 'FRS': 'Miedos', 'OBS': 'Obsesividad',
        'DEP': 'Depresión', 'HEA': 'Preocup. Salud', 'BIZ': 'Pensamiento Bizarro',
        'ANG': 'Ira', 'CYN': 'Cinismo', 'ASP': 'Conducta Antisocial',
        'TPA': 'Tipo A', 'LSE': 'Baja Autoestima', 'SOD': 'Malestar Social',
        'FAM': 'Problemas Familiares', 'WRK': 'Interferencia Laboral',
        'TRT': 'Actitud Negativa Tratamiento'
    }
    
    # Dividir en dos columnas para ahorrar espacio
    cont_data = [
        [Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>T</b>', styles['TableHeader']),
         Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>T</b>', styles['TableHeader'])]
    ]
    
    items = list(protocol.items())
    for i in range(0, len(items), 2):
        row = []
        # Primera columna
        codigo1, puntaje1 = items[i]
        nombre1 = nombres.get(codigo1, codigo1)
        row.extend([
            Paragraph(nombre1, styles['TableTextLeft']),
            Paragraph(f"<b>{int(puntaje1)}</b>", styles['TableText'])
        ])
        # Segunda columna si existe
        if i + 1 < len(items):
            codigo2, puntaje2 = items[i + 1]
            nombre2 = nombres.get(codigo2, codigo2)
            row.extend([
                Paragraph(nombre2, styles['TableTextLeft']),
                Paragraph(f"<b>{int(puntaje2)}</b>", styles['TableText'])
            ])
        else:
            row.extend(['', ''])
        cont_data.append(row)
    
    cont_table = Table(cont_data, colWidths=[1.6*inch, 0.5*inch, 1.6*inch, 0.5*inch])
    cont_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('BACKGROUND', (2, 0), (3, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('ALIGN', (3, 0), (3, -1), 'CENTER'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]))
    
    story.append(cont_table)
    story.append(Spacer(1, 10))


def create_profile_chart(story, styles, data):
    """Crear gráfico de perfil psicométrico"""
    story.append(Paragraph('<b>6. PERFIL PSICOMÉTRICO</b>', styles['SectionHeader']))
    
    escalas = data.get('escalasClinicas', {})
    
    # Crear gráfico de barras
    drawing = Drawing(520, 220)
    
    # Datos
    labels = ['1\nHs', '2\nD', '3\nHy', '4\nPd', '5\nMf', '6\nPa', '7\nPt', '8\nSc', '9\nMa', '0\nSi']
    values = [escalas.get(k, 50) for k in ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si']]
    
    bc = VerticalBarChart()
    bc.x = 50
    bc.y = 40
    bc.height = 140
    bc.width = 420
    bc.data = [values]
    bc.strokeColor = None
    bc.valueAxis.valueMin = 30
    bc.valueAxis.valueMax = 100
    bc.valueAxis.valueStep = 10
    bc.valueAxis.strokeColor = colors.grey
    bc.valueAxis.gridStrokeColor = colors.HexColor('#E0E0E0')
    bc.categoryAxis.labels.boxAnchor = 'ne'
    bc.categoryAxis.labels.dx = 5
    bc.categoryAxis.labels.dy = -2
    bc.categoryAxis.labels.fontName = 'DejaVuSans'
    bc.categoryAxis.labels.fontSize = 8
    bc.categoryAxis.categoryNames = labels
    bc.categoryAxis.strokeColor = colors.grey
    
    # Color uniforme para todas las barras (verde corporativo)
    bc.bars[0].fillColor = ACCENT_COLOR
    
    drawing.add(bc)
    
    # Líneas de referencia
    # Línea T=65 (elevación)
    drawing.add(Line(50, 40 + 140 * (65-30)/70, 470, 40 + 140 * (65-30)/70, 
                     strokeColor=WARNING_COLOR, strokeWidth=1, strokeDashArray=[3, 3]))
    # Etiqueta T=65
    drawing.add(String(475, 40 + 140 * (65-30)/70 - 5, 'T=65', fontSize=7, fillColor=WARNING_COLOR))
    
    story.append(drawing)
    
    # Leyenda del gráfico
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>Interpretación del Perfil:</b> Los puntajes T >= 65 (línea punteada naranja) indican elevaciones clínicamente significativas. '
        'Las barras representan el nivel de cada escala clínica.',
        styles['CustomBodyText']
    ))
    story.append(Spacer(1, 10))


def create_profile_interpretation(story, styles, data):
    """Crear sección de interpretación del perfil"""
    story.append(Paragraph('<b>7. INTERPRETACIÓN DEL PERFIL</b>', styles['SectionHeader']))
    
    analysis = data.get('analysisResult', {})
    codigo_perfil = analysis.get('codigoPerfil', {})
    escalas_interp = analysis.get('escalasClinicasInterpretadas', [])
    
    # Código de perfil
    if codigo_perfil:
        codigo = codigo_perfil.get('codigo', 'No determinado')
        definicion = codigo_perfil.get('definicion', '').replace('_', ' ')
        interpretacion = codigo_perfil.get('interpretacion', 'No disponible')
        correlatos = codigo_perfil.get('correlatosClinicos', [])
        pronostico = codigo_perfil.get('pronostico', 'No disponible')
        
        story.append(Paragraph(f"<b>Código de Perfil: {codigo}</b>", styles['SubSectionHeader']))
        story.append(Paragraph(f"<i>Definición: {definicion}</i>", styles['CustomBodyText']))
        story.append(Spacer(1, 6))
        
        story.append(Paragraph('<b>Interpretación:</b>', styles['CustomBodyText']))
        story.append(Paragraph(interpretacion, styles['InterpretText']))
        
        if correlatos:
            story.append(Paragraph('<b>Correlatos Clínicos:</b>', styles['CustomBodyText']))
            for c in correlatos:
                story.append(Paragraph(f"- {c}", styles['InterpretText']))
        
        story.append(Paragraph(f"<b>Pronóstico:</b> {pronostico}", styles['CustomBodyText']))
        story.append(Spacer(1, 10))
    else:
        # Perfil sin elevaciones
        story.append(Paragraph(
            '<b>Perfil dentro de parámetros normativos</b>',
            styles['SubSectionHeader']
        ))
        story.append(Paragraph(
            'El perfil no presenta elevaciones clínicamente significativas en las escalas básicas. '
            'Esto sugiere un funcionamiento psicológico dentro de parámetros normativos, sin indicadores '
            'claros de psicopatología significativa. Se recomienda considerar otros indicadores y el contexto '
            'clínico para una evaluación completa.',
            styles['InterpretText']
        ))
        story.append(Spacer(1, 10))


def create_clinical_formulation(story, styles, data):
    """Crear sección de formulación clínica"""
    story.append(Paragraph('<b>8. FORMULACIÓN CLÍNICA INTEGRADA</b>', styles['SectionHeader']))
    
    analysis = data.get('analysisResult', {})
    formulacion = analysis.get('formulacionClinica', {})
    
    if not formulacion:
        story.append(Paragraph('No se encontró formulación clínica disponible.', styles['CustomBodyText']))
        return
    
    # Validez del protocolo
    validez = formulacion.get('validezProtocolo', 'No disponible')
    story.append(Paragraph('<b>Validez del Protocolo:</b>', styles['SubSectionHeader']))
    story.append(Paragraph(validez, styles['InterpretText']))
    
    # Perfil de personalidad
    perfil = formulacion.get('perfilPersonalidad', 'No disponible')
    story.append(Paragraph('<b>Perfil de Personalidad:</b>', styles['SubSectionHeader']))
    story.append(Paragraph(perfil, styles['InterpretText']))
    
    # Áreas afectadas
    areas = formulacion.get('areasAfectadas', {})
    if areas:
        story.append(Paragraph('<b>Áreas Afectadas:</b>', styles['SubSectionHeader']))
        
        area_nombres = {
            'cognitivo': 'Cognitivo',
            'afectivo': 'Afectivo',
            'conductual': 'Conductual',
            'interpersonal': 'Interpersonal',
            'somatico': 'Somático'
        }
        
        areas_data = [[Paragraph('<b>Área</b>', styles['TableHeader']),
                       Paragraph('<b>Descripción</b>', styles['TableHeader'])]]
        
        for key, value in areas.items():
            nombre = area_nombres.get(key, key.capitalize())
            areas_data.append([
                Paragraph(nombre, styles['TableTextLeft']),
                Paragraph(value, styles['TableTextLeft'])
            ])
        
        areas_table = Table(areas_data, colWidths=[1.2*inch, 5.3*inch])
        areas_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(areas_table)
        story.append(Spacer(1, 10))
    
    # Recursos y fortalezas
    recursos = formulacion.get('recursosFortalezas', [])
    if recursos:
        story.append(Paragraph('<b>Recursos y Fortalezas:</b>', styles['SubSectionHeader']))
        for r in recursos:
            story.append(Paragraph(f"+ {r}", styles['InterpretText']))
    
    # Riesgos
    riesgos = formulacion.get('riesgos', [])
    if riesgos:
        story.append(Paragraph('<b>Riesgos Identificados:</b>', styles['SubSectionHeader']))
        for r in riesgos:
            story.append(Paragraph(f"! {r}", styles['InterpretText']))
    
    story.append(Spacer(1, 10))


def create_recommendations(story, styles, data):
    """Crear sección de recomendaciones"""
    story.append(Paragraph('<b>9. RECOMENDACIONES</b>', styles['SectionHeader']))
    
    analysis = data.get('analysisResult', {})
    formulacion = analysis.get('formulacionClinica', {})
    
    # Pronóstico
    pronostico = formulacion.get('pronostico', 'No disponible')
    story.append(Paragraph('<b>Pronóstico:</b>', styles['SubSectionHeader']))
    story.append(Paragraph(pronostico, styles['InterpretText']))
    story.append(Spacer(1, 6))
    
    # Recomendaciones terapéuticas
    recomendaciones = formulacion.get('recomendacionesTerapeuticas', [])
    if recomendaciones:
        story.append(Paragraph('<b>Recomendaciones Terapéuticas:</b>', styles['SubSectionHeader']))
        
        rec_data = [[Paragraph('<b>#</b>', styles['TableHeader']),
                     Paragraph('<b>Recomendación</b>', styles['TableHeader'])]]
        
        for i, rec in enumerate(recomendaciones, 1):
            rec_data.append([
                Paragraph(str(i), styles['TableText']),
                Paragraph(rec, styles['TableTextLeft'])
            ])
        
        rec_table = Table(rec_data, colWidths=[0.4*inch, 6.1*inch])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
        ]))
        story.append(rec_table)
    else:
        story.append(Paragraph('No se generaron recomendaciones específicas.', styles['CustomBodyText']))
    
    story.append(Spacer(1, 15))


def generate_mmpi2_report(data, output_path):
    """Función principal para generar el informe PDF completo"""
    
    # Crear documento
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        title='Informe_MMPI2',
        author='Sistema de Evaluación Psicológica',
        creator='Z.ai',
        subject='Informe de evaluación psicológica MMPI-2'
    )
    
    # Estilos
    styles = create_styles()
    
    # Contenido
    story = []
    
    # 1. Portada
    create_cover_page(story, styles, data)
    
    # 2. Datos del evaluado
    create_demographics_section(story, styles, data)
    
    # 3. Escalas de validez
    create_validity_section(story, styles, data)
    
    # 4. Escalas clínicas básicas
    create_clinical_scales_section(story, styles, data)
    
    # 5. Escalas suplementarias
    create_supplementary_scales_section(story, styles, data)
    
    # 6. Escalas de contenido
    create_content_scales_section(story, styles, data)
    
    # 7. Perfil psicométrico (gráfico)
    create_profile_chart(story, styles, data)
    
    # 8. Interpretación del perfil
    create_profile_interpretation(story, styles, data)
    
    # 9. Formulación clínica
    create_clinical_formulation(story, styles, data)
    
    # 10. Recomendaciones
    create_recommendations(story, styles, data)
    
    # Pie de página
    story.append(Spacer(1, 0.3*inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Paragraph(
        f'Informe generado el {datetime.now().strftime("%d/%m/%Y a las %H:%M")} | '
        f'Sistema de Evaluación Psicológica MMPI-2 | Basado en Guía de Sanz (2005)',
        styles['SmallText']
    ))
    
    # Construir PDF
    doc.build(story)
    
    return output_path


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python generate_mmpi2_report.py <input_json> <output_pdf>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        result = generate_mmpi2_report(data, output_file)
        print(f"PDF generado: {result}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
