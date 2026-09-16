'use client'

import React from 'react'
import { BenderAnalysisResult, BenderProtocol } from '@/lib/bender/types'
import { Printer } from 'lucide-react'

interface InformeViewProps {
  protocol: BenderProtocol
  result: BenderAnalysisResult
  imagenesFigura: Record<string, string>
}

export const InformeBenderView: React.FC<InformeViewProps> = ({ protocol, result, imagenesFigura }) => {
  const d = protocol.demograficos
  const o = protocol.observaciones

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow-lg rounded-xl border border-[#85A28B]/30 my-4 space-y-6 print:shadow-none print:border-none print:p-0 print:max-w-full">
      
      {/* Botones de acción superior */}
      <div className="flex justify-end gap-3 print:hidden">
        <button 
          onClick={handlePrint}
          className="btn-sexto px-5 py-2.5 rounded-lg font-medium text-sm transition flex items-center gap-2 shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Guardar como PDF
        </button>
      </div>

      {/* Cabecera Institucional */}
      <div className="border-b-2 border-[#4F6F52] pb-4 text-center space-y-2">
        <h1 className="text-lg font-bold tracking-wide text-[#121E14] uppercase" style={{ fontFamily: 'var(--font-playfair), serif' }}>
          INFORME DE EVALUACIÓN NEUROPSICOPEDAGÓGICA
        </h1>
        <p className="text-sm text-[#4F6F52]">Test Gestáltico Visomotor de Bender — Sistema de Calificación de E. M. Koppitz</p>
        <p className="text-xs text-[#6A8A70] font-semibold tracking-wider">CONFIDENCIAL — USO PROFESIONAL EXCLUSIVO</p>
      </div>

      {/* Secc. 1: Datos de Identificación */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">1. DATOS DE IDENTIFICACIÓN Y REGISTRO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1.5 gap-x-6 text-sm text-[#121E14] px-2">
          <div><strong>Nombre del Evaluado:</strong> {d.nombreEvaluado}</div>
          <div><strong>Fecha de Nacimiento:</strong> {d.fechaNacimiento || '—'}</div>
          <div><strong>Edad Cronológica:</strong> {d.edadCronologica}</div>
          <div><strong>Fecha de Evaluación:</strong> {d.fechaEvaluacion}</div>
          <div><strong>Escolaridad / Grado:</strong> {d.escolaridad || '—'}</div>
          <div><strong>Institución:</strong> {d.institucion || '—'}</div>
          <div className="md:col-span-2"><strong>Motivo de Consulta:</strong> {d.motivoConsulta || '—'}</div>
          <div><strong>Evaluador:</strong> {d.evaluador || '—'}</div>
        </div>
      </div>

      {/* Secc. 2: Motivo y Actitud */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">2. MOTIVO DE EVALUACIÓN Y ACTITUD ANTE LA PRUEBA</h2>
        <div className="px-2">
          <p className="text-sm text-[#121E14] mb-2">{d.motivoConsulta || 'El evaluado fue derivado a evaluación por dificultades en el ámbito académico.'}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-[#85A28B]/30">
              <thead>
                <tr className="bg-[#DDE9DB] text-[#121E14]">
                  <th className="border border-[#85A28B]/30 p-2">Métrica de Aplicación</th>
                  <th className="border border-[#85A28B]/30 p-2">Valor Registrado</th>
                  <th className="border border-[#85A28B]/30 p-2">Interpretación Clínica</th>
                </tr>
              </thead>
              <tbody className="text-[#121E14]">
                <tr>
                  <td className="border border-[#85A28B]/30 p-2 font-medium">Tiempo Total Empleado</td>
                  <td className="border border-[#85A28B]/30 p-2">{o.tiempoTotal || '—'}</td>
                  <td className="border border-[#85A28B]/30 p-2 text-[#6A8A70]">
                    {o.tiempoMinutos > 0 && o.tiempoMinutos < 4 ? 'Tiempo crítico corto: Impulsividad y falta de concentración.' : 
                     o.tiempoMinutos > 9 ? 'Tiempo prolongado: Perfeccionismo o esfuerzo compensatorio.' :
                     'Dentro del rango esperado (4-9 min).'}
                  </td>
                </tr>
                <tr>
                  <td className="border border-[#85A28B]/30 p-2 font-medium">Lateralidad</td>
                  <td className="border border-[#85A28B]/30 p-2">{o.lateralidad}</td>
                  <td className="border border-[#85A28B]/30 p-2 text-[#6A8A70]">{o.lateralidad === 'Diestro' ? 'Adecuado agarre del lápiz (trípode).' : 'Lateralidad no diestra — monitorear.'}</td>
                </tr>
                <tr>
                  <td className="border border-[#85A28B]/30 p-2 font-medium">Uso del Borrador</td>
                  <td className="border border-[#85A28B]/30 p-2">{o.usoBorrador}</td>
                  <td className="border border-[#85A28B]/30 p-2 text-[#6A8A70]">{o.usoBorrador === '0 intentos' ? 'Omisión total de autocorrección.' : 'Autocorrección presente.'}</td>
                </tr>
                <tr>
                  <td className="border border-[#85A28B]/30 p-2 font-medium">Conducta de Anclaje</td>
                  <td className="border border-[#85A28B]/30 p-2">{o.conductaAnclaje ? 'Presente' : 'Ausente'}</td>
                  <td className="border border-[#85A28B]/30 p-2 text-[#6A8A70]">{o.conductaAnclaje ? 'Estrategia compensatoria para déficit perceptual.' : 'No recurre a estrategias compensatorias.'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Galería de Dibujos del Paciente — protegido contra cortes de página */}
      {Object.keys(imagenesFigura).length > 0 && (
        <section className="space-y-2 break-inside-avoid page-break-inside-avoid">
          <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">REGISTRO GRÁFICO DEL PROTOCOLO (ANEXO VISUAL)</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 px-2">
            {Object.entries(imagenesFigura).map(([key, url]) => (
              <div key={key} className="border border-[#85A28B]/30 rounded-lg p-2 bg-[#F5F1E8] text-center space-y-1 break-inside-avoid">
                <span className="text-xs font-bold text-[#4F6F52] uppercase">Figura {key}</span>
                <div className="h-24 w-full flex items-center justify-center overflow-hidden bg-white rounded border border-[#85A28B]/20">
                  <img src={url as string} alt={`Figura ${key}`} className="object-contain h-full w-full" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Secc. 3: Resultados Cuantitativos */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">3. RESULTADOS CUANTITATIVOS — ESCALA DE MADURACIÓN VISOMOTRIZ</h2>
        <div className="overflow-x-auto px-2">
          <table className="w-full text-left text-sm border-collapse border border-[#85A28B]/30">
            <thead>
              <tr className="bg-[#DDE9DB] text-[#121E14]">
                <th className="border border-[#85A28B]/30 p-2.5">Indicador Escalar</th>
                <th className="border border-[#85A28B]/30 p-2.5">Resultado Obtenido</th>
                <th className="border border-[#85A28B]/30 p-2.5">Significación Diagnóstica</th>
              </tr>
            </thead>
            <tbody className="text-[#121E14]">
              <tr>
                <td className="border border-[#85A28B]/30 p-2.5 font-medium">Puntaje Directo (Total Errores)</td>
                <td className="border border-[#85A28B]/30 p-2.5 font-bold text-[#8A3D3D]">{result.puntajeDirecto} errores (de 30 ítems)</td>
                <td className="border border-[#85A28B]/30 p-2.5 text-[#6A8A70]">A mayor cantidad de errores, menor nivel de madurez visomotriz.</td>
              </tr>
              <tr>
                <td className="border border-[#85A28B]/30 p-2.5 font-medium">Edad de Maduración Visomotriz Equivalente</td>
                <td className="border border-[#85A28B]/30 p-2.5 font-bold text-[#4F6F52]">{result.edadMaduracionEquivalente}</td>
                <td className="border border-[#85A28B]/30 p-2.5 text-[#6A8A70]">{result.retrasoInterpretacion}</td>
              </tr>
              <tr>
                <td className="border border-[#85A28B]/30 p-2.5 font-medium">Nivel de Rendimiento por Grado Escolar</td>
                <td className="border border-[#85A28B]/30 p-2.5">{result.nivelRendimientoGrado}</td>
                <td className="border border-[#85A28B]/30 p-2.5 text-[#6A8A70]">
                  {d.edadAnios >= 5 && d.edadAnios <= 11 
                    ? 'Inmadurez visomotora relevante para las exigencias del grado actual.' 
                    : 'Análisis cualitativo aplicable a población adulta.'}
                </td>
              </tr>
              <tr>
                <td className="border border-[#85A28B]/30 p-2.5 font-medium">Desglose por Categoría de Error</td>
                <td className="border border-[#85A28B]/30 p-2.5">
                  Distorsión: {result.erroresPorCategoria.distorsion} · 
                  Rotación: {result.erroresPorCategoria.rotacion} · 
                  Integración: {result.erroresPorCategoria.integracion} · 
                  Perseveración: {result.erroresPorCategoria.perseveracion}
                </td>
                <td className="border border-[#85A28B]/30 p-2.5 text-[#6A8A70]">Distribución cualitativa de los errores detectados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Secc. 4: Interpretación de los Tres Ejes */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">4. INTERPRETACIÓN CUALITATIVA DE LOS TRES EJES DIAGNÓSTICOS</h2>
        
        {/* Eje I: Errores detallados */}
        <div className="px-2">
          <p className="text-sm font-bold text-[#4F6F52] mb-1">A) Eje de Madurez Perceptivo-Motriz (Desglose de Errores)</p>
          <p className="text-sm text-[#121E14] mb-2">El evaluado acumuló un total de {result.puntajeDirecto} errores de maduración computados objetivamente en el protocolo:</p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-[#121E14]">
            {result.erroresDetalle.map((err, i) => (
              <li key={i}>
                <strong>Figura {err.figura} (Ítem {err.item} — {err.tipo}):</strong> {err.descripcion}
              </li>
            ))}
            {result.erroresDetalle.length === 0 && <li>No se detectaron errores de maduración significativos.</li>}
          </ul>
        </div>

        {/* Eje II: DCM */}
        <div className="px-2">
          <p className="text-sm font-bold text-[#4F6F52] mb-1">B) Eje de Indicadores de Disfunción Cerebral Mínima (DCM) / Organicidad</p>
          {result.dcmIndicadores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-[#85A28B]/30">
                <thead>
                  <tr className="bg-[#DDE9DB] text-[#121E14]">
                    <th className="border border-[#85A28B]/30 p-2">Figura / Ítem</th>
                    <th className="border border-[#85A28B]/30 p-2">Criterio Koppitz</th>
                    <th className="border border-[#85A28B]/30 p-2">Nivel</th>
                    <th className="border border-[#85A28B]/30 p-2">Valor Diagnóstico</th>
                  </tr>
                </thead>
                <tbody className="text-[#121E14]">
                  {result.dcmIndicadores.map((dcm, i) => (
                    <tr key={i}>
                      <td className="border border-[#85A28B]/30 p-2 font-medium">{dcm.figura} — {dcm.item}</td>
                      <td className="border border-[#85A28B]/30 p-2">{dcm.criterio}</td>
                      <td className="border border-[#85A28B]/30 p-2 font-bold text-[#8A3D3D]">{dcm.nivel}</td>
                      <td className="border border-[#85A28B]/30 p-2 text-[#6A8A70]">{dcm.interpretacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#6A8A70]">No se identifican indicadores de DCM significativos en el protocolo.</p>
          )}
          <p className="text-xs text-[#6A8A70] mt-1 italic">Nota clínica: Un protocolo indicativo de DCM establece únicamente una hipótesis funcional neuropsicológica que debe contrastarse con la historia clínica del desarrollo.</p>
        </div>

        {/* Eje III: Emocional */}
        <div className="px-2">
          <p className="text-sm font-bold text-[#4F6F52] mb-1">C) Eje de Indicadores de Desajuste Emocional (IE)</p>
          <p className="text-sm text-[#121E14] mb-2">{result.ieSignificacion}</p>
          {result.ieDetalle.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-[#85A28B]/30">
                <thead>
                  <tr className="bg-[#DDE9DB] text-[#121E14]">
                    <th className="border border-[#85A28B]/30 p-2">Indicador</th>
                    <th className="border border-[#85A28B]/30 p-2">Definición</th>
                    <th className="border border-[#85A28B]/30 p-2">Interpretación Clínica</th>
                  </tr>
                </thead>
                <tbody className="text-[#121E14]">
                  {result.ieDetalle.map((ie) => (
                    <tr key={ie.id}>
                      <td className="border border-[#85A28B]/30 p-2 font-medium">{ie.id}. {ie.nombre}</td>
                      <td className="border border-[#85A28B]/30 p-2">{ie.definicion}</td>
                      <td className="border border-[#85A28B]/30 p-2 text-[#6A8A70]">{ie.interpretacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Secc. 5: Síntesis */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">5. SÍNTESIS DIAGNÓSTICA E INTEGRACIÓN DE HALLAZGOS</h2>
        <p className="text-sm text-[#121E14] leading-relaxed px-2 whitespace-pre-line">{result.sintesis}</p>
      </div>

      {/* Secc. 6: Recomendaciones */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-white bg-[#4F6F52] px-4 py-2 rounded">6. RECOMENDACIONES PEDAGÓGICAS Y TERAPÉUTICAS</h2>
        <ul className="list-disc pl-6 space-y-1.5 text-sm text-[#121E14] px-2">
          {result.recomendaciones.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* Firma — protegida para que no se separe en hojas distintas */}
      <div className="mt-10 grid grid-cols-2 gap-8 break-inside-avoid page-break-inside-avoid pt-8 border-t border-dashed border-[#85A28B]/40 text-center text-sm text-[#121E14]">
        <div>
          <div className="h-12 border-b border-[#121E14]/40 mx-8 mb-2"></div>
          <p className="font-bold">{d.evaluador || 'Lic. en Psicología / Neuropsicología'}</p>
          <p className="text-xs text-[#6A8A70]">Matrícula Prof. N.º ____</p>
        </div>
        <div>
          <div className="h-12 border-b border-[#121E14]/40 mx-8 mb-2"></div>
          <p className="font-bold">Departamento de Orientación / Psicopedagogía</p>
          <p className="text-xs text-[#6A8A70]">Firma y Sello Profesional</p>
        </div>
      </div>

      {/* Footer del informe */}
      <div className="border-t border-[#85A28B]/20 pt-2 text-center">
        <p className="text-xs text-[#6A8A70]">
          Modelo de Informe Clínico-Psicopedagógico estandarizado según la revisión de E. M. Koppitz.
        </p>
        <p className="text-xs text-[#6A8A70] mt-1">
          © 2026 Sexto Sistema · PsicoInformes Automatizados Six · Confidencial
        </p>
      </div>
    </div>
  )
}
