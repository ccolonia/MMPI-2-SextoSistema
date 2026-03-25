#!/usr/bin/env python3
"""
Generador de Informes MMPI-2 en PDF
Script para ser llamado desde la API
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
from reportlab.graphics.shapes import Drawing, Line, Rect
from reportlab.graphics.charts.barcharts import VerticalBarChart

# Registrar fuentes
try:
    pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
except:
    pass

try:
    pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
except:
    pass

try:
    pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
except:
    pass

# Registrar familias de fuentes
try:
    registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
except:
    pass

try:
    registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
except:
    pass

try:
    registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
except:
    pass

# Colores corporativos
HEADER_COLOR = colors.HexColor('#1F4E79')
HEADER_TEXT = colors.white
ROW_ODD = colors.HexColor('#F5F5F5')
ACCENT_COLOR = colors.HexColor('#2E7D32')
WARNING_COLOR = colors.HexColor('#F57C00')
DANGER_COLOR = colors.HexColor('#C62828')


def create_styles():
    """Crear estilos personalizados"""
    styles = getSampleStyleSheet()
    
    font_name = 'SimHei' if 'SimHei' in pdfmetrics.getRegisteredFontNames() else 'Helvetica'
    
    # Modificar estilos existentes
    styles['Normal'].fontName = font_name
    styles['Normal'].fontSize = 10
    styles['Normal'].leading = 14
    
    styles['BodyText'].fontName = font_name
    styles['BodyText'].fontSize = 10
    styles['BodyText'].leading = 14
    styles['BodyText'].alignment = TA_JUSTIFY
    
    # Agregar nuevos estilos
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName=font_name,
        fontSize=28,
        leading=34,
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=colors.HexColor('#1F4E79')
    ))
    
    styles.add(ParagraphStyle(
        name='SubTitle',
        fontName=font_name,
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor('#666666')
    ))
    
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName=font_name,
        fontSize=16,
        leading=20,
        alignment=TA_LEFT,
        spaceBefore=18,
        spaceAfter=12,
        textColor=colors.HexColor('#1F4E79'),
    ))
    
    styles.add(ParagraphStyle(
        name='TableText',
        fontName=font_name,
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
    ))
    
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName=font_name,
        fontSize=10,
        leading=12,
        alignment=TA_CENTER,
        textColor=colors.white
    ))
    
    styles.add(ParagraphStyle(
        name='SmallText',
        fontName=font_name,
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666')
    ))
    
    styles.add(ParagraphStyle(
        name='InterpretText',
        fontName=font_name,
        fontSize=10,
        leading=14,
        alignment=TA_LEFT,
        spaceAfter=6,
        leftIndent=20,
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
    """Obtener texto de elevación"""
    if t_score >= 80:
        return 'Muy elevado'
    elif t_score >= 65:
        return 'Elevado'
    elif t_score >= 55:
        return 'Ligeramente elevado'
    elif t_score >= 45:
        return 'Normal'
    else:
        return 'Bajo'


def create_cover_page(story, styles, data):
    """Crear portada"""
    story.append(Spacer(1, 2*inch))
    
    story.append(Paragraph('INFORME DE EVALUACION', styles['MainTitle']))
    story.append(Paragraph('MMPI-2', styles['MainTitle']))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph('Inventario Multifasico de Personalidad de Minnesota-2', styles['SubTitle']))
    story.append(Spacer(1, 0.5*inch))
    
    story.append(HRFlowable(width="60%", thickness=2, color=ACCENT_COLOR, spaceBefore=12, spaceAfter=12))
    story.append(Spacer(1, 0.5*inch))
    
    demograficos = data.get('demograficos', {})
    cover_data = [
        ['Evaluado:', demograficos.get('nombreEvaluado', 'No especificado')],
        ['Edad:', f"{demograficos.get('edad', 'N/A')} anios"],
        ['Sexo:', 'Masculino' if demograficos.get('sexo') == 'masculino' else 'Femenino'],
        ['Fecha:', demograficos.get('fechaEvaluacion', datetime.now().strftime('%Y-%m-%d'))],
    ]
    
    cover_table = Table(cover_data, colWidths=[2*inch, 4*inch])
    cover_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'SimHei'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#666666')),
        ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#333333')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(cover_table)
    
    story.append(Spacer(1, 1*inch))
    
    evaluador = demograficos.get('evaluador', '')
    institucion = demograficos.get('institucion', '')
    
    if evaluador:
        story.append(Paragraph(f"Evaluador: {evaluador}", styles['SubTitle']))
    if institucion:
        story.append(Paragraph(f"Institucion: {institucion}", styles['SubTitle']))
    
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph('Basado en la Guia de Sanz (2005) - Universidad de Buenos Aires', styles['SmallText']))
    
    story.append(PageBreak())


def create_validity_section(story, styles, data):
    """Crear sección de validez"""
    story.append(Paragraph('<b>ESCALAS DE VALIDEZ</b>', styles['SectionHeader']))
    
    validity_data = [
        [Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>Puntaje</b>', styles['TableHeader']),
         Paragraph('<b>Interpretacion</b>', styles['TableHeader'])]
    ]
    
    omisiones = data.get('omisiones', 0)
    f_t = data.get('fT', 50)
    l_bruto = data.get('lBruto', 0)
    k_bruto = data.get('kBruto', 0)
    
    omisiones_interp = 'Aceptable' if omisiones <= 10 else 'Elevado'
    f_interp = 'Normal' if f_t < 65 else 'Elevado' if f_t < 80 else 'Muy elevado'
    l_interp = 'Normal' if l_bruto <= 6 else 'Elevado'
    k_interp = 'Normal' if 8 <= k_bruto <= 18 else 'Elevado' if k_bruto > 18 else 'Bajo'
    
    validity_rows = [
        ('Omisiones (?)', str(omisiones), omisiones_interp),
        ('F (T)', str(f_t), f_interp),
        ('L (Bruto)', str(l_bruto), l_interp),
        ('K (Bruto)', str(k_bruto), k_interp),
    ]
    
    for escala, puntaje, interp in validity_rows:
        validity_data.append([
            Paragraph(escala, styles['TableText']),
            Paragraph(puntaje, styles['TableText']),
            Paragraph(interp, styles['TableText'])
        ])
    
    table = Table(validity_data, colWidths=[2*inch, 1*inch, 3.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 18))


def create_clinical_scales_section(story, styles, data):
    """Crear sección de escalas clínicas"""
    story.append(Paragraph('<b>ESCALAS CLINICAS BASICAS</b>', styles['SectionHeader']))
    
    escalas = data.get('escalasClinicas', {})
    
    escala_nombres = {
        'Hs': '1. Hipocondriasis',
        'D': '2. Depresion',
        'Hy': '3. Histeria',
        'Pd': '4. Desviacion Psicopatica',
        'Mf': '5. Masculinidad-Feminidad',
        'Pa': '6. Paranoia',
        'Pt': '7. Psicastenia',
        'Sc': '8. Esquizofrenia',
        'Ma': '9. Hipomania',
        'Si': '0. Interversion Social'
    }
    
    clinical_data = [
        [Paragraph('<b>Escala</b>', styles['TableHeader']),
         Paragraph('<b>T</b>', styles['TableHeader']),
         Paragraph('<b>Elevacion</b>', styles['TableHeader'])]
    ]
    
    for codigo in ['Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si']:
        t_score = escalas.get(codigo, 50)
        nombre = escala_nombres.get(codigo, codigo)
        elevacion = get_elevation_text(t_score)
        
        clinical_data.append([
            Paragraph(nombre, styles['TableText']),
            Paragraph(str(int(t_score)), styles['TableText']),
            Paragraph(elevacion, styles['TableText'])
        ])
    
    table = Table(clinical_data, colWidths=[3*inch, 1*inch, 2.5*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, ROW_ODD]),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 18))


def create_interpretation_section(story, styles, data, analysis_result):
    """Crear sección de interpretación"""
    story.append(Paragraph('<b>INTERPRETACION DEL PERFIL</b>', styles['SectionHeader']))
    
    if not analysis_result:
        story.append(Paragraph('No hay datos de analisis disponibles.', styles['BodyText']))
        return
    
    validez = analysis_result.get('validez', {})
    conclusion = validez.get('conclusionGeneral', 'No disponible')
    
    story.append(Paragraph(f"<b>Validez del Protocolo:</b> {conclusion}", styles['BodyText']))
    story.append(Spacer(1, 12))
    
    escalas_interp = analysis_result.get('escalasClinicasInterpretadas', [])
    if escalas_interp:
        story.append(Paragraph('<b>Escalas Elevadas:</b>', styles['BodyText']))
        
        for escala in escalas_interp[:5]:
            codigo = escala.get('codigo', '')
            nombre = escala.get('nombre', '')
            puntaje = escala.get('puntajeT', 0)
            interpretacion = escala.get('interpretacion', '')
            
            story.append(Paragraph(
                f"<b>{codigo} - {nombre}</b> (T={puntaje}): {interpretacion}",
                styles['InterpretText']
            ))
    
    story.append(Spacer(1, 12))
    
    formulacion = analysis_result.get('formulacionClinica', {})
    if formulacion:
        story.append(Paragraph('<b>Formulacion Clinica:</b>', styles['BodyText']))
        
        perfil = formulacion.get('perfilPersonalidad', '')
        if perfil:
            story.append(Paragraph(perfil, styles['InterpretText']))
        
        recomendaciones = formulacion.get('recomendacionesTerapeuticas', [])
        if recomendaciones:
            story.append(Spacer(1, 12))
            story.append(Paragraph('<b>Recomendaciones:</b>', styles['BodyText']))
            for rec in recomendaciones[:5]:
                story.append(Paragraph(f"- {rec}", styles['InterpretText']))


def generate_mmpi2_report(data, output_path):
    """Función principal"""
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=1*inch,
        leftMargin=1*inch,
        topMargin=1*inch,
        bottomMargin=1*inch,
        title='Informe_MMPI2',
        author='Z.ai',
        creator='Z.ai',
        subject='Informe MMPI-2'
    )
    
    styles = create_styles()
    story = []
    
    create_cover_page(story, styles, data)
    create_validity_section(story, styles, data)
    create_clinical_scales_section(story, styles, data)
    
    analysis_result = data.get('analysisResult', {})
    create_interpretation_section(story, styles, data, analysis_result)
    
    story.append(Spacer(1, 0.5*inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
    story.append(Paragraph(
        f'Informe generado el {datetime.now().strftime("%d/%m/%Y a las %H:%M")} | Z.ai',
        styles['SmallText']
    ))
    
    doc.build(story)
    
    return output_path


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Uso: python generate_report.py <input_json> <output_pdf>")
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
        sys.exit(1)
