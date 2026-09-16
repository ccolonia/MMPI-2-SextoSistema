'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Brain, ArrowLeft, FileDown, CheckCircle, AlertTriangle } from 'lucide-react'
import { ITEMS_CALIFICACION, INDICADORES_EMOCIONALES, DCM_TIPO_1, DCM_TIPO_2 } from '@/lib/bender/items'
import { BenderProtocol, BenderAnalysisResult } from '@/lib/bender/types'
import { analizarBender } from '@/lib/bender/analyzer'

export default function BenderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BenderAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<'ingreso' | 'resultados'>('ingreso')

  // Datos demográficos
  const [nombre, setNombre] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [edadAnios, setEdadAnios] = useState(7)
  const [edadMeses, setEdadMeses] = useState(6)
  const [escolaridad, setEscolaridad] = useState('')
  const [institucion, setInstitucion] = useState('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [evaluador, setEvaluador] = useState('')
  const [fechaEvaluacion, setFechaEvaluacion] = useState(new Date().toISOString().split('T')[0])

  // Observaciones
  const [tiempoTotal, setTiempoTotal] = useState('')
  const [tiempoMinutos, setTiempoMinutos] = useState(0)
  const [lateralidad, setLateralidad] = useState('Diestro')
  const [usoBorrador, setUsoBorrador] = useState('0 intentos')
  const [anclaje, setAnclaje] = useState(false)
  const [subverbalizacion, setSubverbalizacion] = useState(false)
  const [observacionesConducta, setObservacionesConducta] = useState('')

  // Items de calificación (30 ítems)
  const [items, setItems] = useState<Record<string, number>>({})
  
  // Indicadores emocionales
  const [ieSeleccionados, setIeSeleccionados] = useState<number[]>([])
  
  // DCM
  const [dcmSeleccionados, setDcmSeleccionados] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setItems(prev => ({ ...prev, [id]: prev[id] === 1 ? 0 : 1 }))
  }

  const toggleIE = (id: number) => {
    setIeSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleDCM = (id: string) => {
    setDcmSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleAnalizar = () => {
    setLoading(true)
    try {
      const protocol: BenderProtocol = {
        demograficos: {
          nombreEvaluado: nombre,
          fechaNacimiento,
          edadCronologica: `${edadAnios} años, ${edadMeses} meses (${edadAnios}:${edadMeses})`,
          edadAnios,
          edadMeses,
          escolaridad,
          institucion,
          motivoConsulta,
          evaluador,
          fechaEvaluacion,
        },
        observaciones: {
          tiempoTotal,
          tiempoMinutos,
          lateralidad,
          usoBorrador,
          conductaAnclaje: anclaje,
          conductaSubverbalizacion: subverbalizacion,
          observacionesConducta,
        },
        items,
        indicadoresEmocionales: ieSeleccionados,
        indicadoresDCM: dcmSeleccionados,
      }

      const analisis = analizarBender(protocol)
      setResult(analisis)
      setActiveTab('resultados')
    } catch (error) {
      console.error('Error en análisis:', error)
    } finally {
      setLoading(false)
    }
  }

  // Agrupar items por figura
  const figuras = ['A', '1', '2', '3', '4', '5', '6', '7', '8'] as const

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#85A28B]/30 bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/sexto-logo.png" alt="Sexto Sistema" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#4F6F52]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                  Bender-Koppitz · <span className="text-[#85A28B]">Sexto Sistema</span>
                </h1>
                <p className="text-xs text-[#6A8A70]">Test Gestáltico Visomotor — Sistema Koppitz</p>
              </div>
            </div>
            <a href="/dashboard" className="text-xs text-[#6A8A70] hover:text-[#4F6F52] transition-colors">
              ← Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === 'ingreso' && (
          <div className="space-y-6">
            {/* Datos del evaluado */}
            <Card className="border-[#85A28B]/30 bg-card">
              <CardHeader>
                <CardTitle className="text-[#4F6F52]">Datos del Evaluado</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Evaluado</Label>
                  <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ezequiel M." />
                </div>
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Edad (años)</Label>
                    <Input type="number" value={edadAnios} onChange={e => setEdadAnios(parseInt(e.target.value) || 0)} min={3} max={15} />
                  </div>
                  <div>
                    <Label>Edad (meses)</Label>
                    <Input type="number" value={edadMeses} onChange={e => setEdadMeses(parseInt(e.target.value) || 0)} min={0} max={11} />
                  </div>
                </div>
                <div>
                  <Label>Escolaridad / Grado</Label>
                  <Input value={escolaridad} onChange={e => setEscolaridad(e.target.value)} placeholder="2.º Grado de Primaria" />
                </div>
                <div>
                  <Label>Institución</Label>
                  <Input value={institucion} onChange={e => setInstitucion(e.target.value)} placeholder="Colegio..." />
                </div>
                <div>
                  <Label>Evaluador</Label>
                  <Input value={evaluador} onChange={e => setEvaluador(e.target.value)} placeholder="Lic. ..." />
                </div>
                <div>
                  <Label>Fecha de Evaluación</Label>
                  <Input type="date" value={fechaEvaluacion} onChange={e => setFechaEvaluacion(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Motivo de Consulta</Label>
                  <Textarea value={motivoConsulta} onChange={e => setMotivoConsulta(e.target.value)} placeholder="Dificultades en lectoescritura..." />
                </div>
              </CardContent>
            </Card>

            {/* Observaciones de aplicación */}
            <Card className="border-[#85A28B]/30 bg-card">
              <CardHeader>
                <CardTitle className="text-[#4F6F52]">Observaciones de Aplicación</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tiempo Total Empleado</Label>
                  <Input value={tiempoTotal} onChange={e => setTiempoTotal(e.target.value)} placeholder="3 min 15 seg" />
                </div>
                <div>
                  <Label>Tiempo en Minutos (para análisis)</Label>
                  <Input type="number" step="0.25" value={tiempoMinutos} onChange={e => setTiempoMinutos(parseFloat(e.target.value) || 0)} placeholder="3.25" />
                </div>
                <div>
                  <Label>Lateralidad</Label>
                  <select className="w-full px-3 py-2 rounded-md border border-[#85A28B]/40 bg-background" value={lateralidad} onChange={e => setLateralidad(e.target.value)}>
                    <option>Diestro</option>
                    <option>Zurdo</option>
                    <option>Ambidiestro</option>
                  </select>
                </div>
                <div>
                  <Label>Uso del Borrador</Label>
                  <select className="w-full px-3 py-2 rounded-md border border-[#85A28B]/40 bg-background" value={usoBorrador} onChange={e => setUsoBorrador(e.target.value)}>
                    <option>0 intentos</option>
                    <option>1-2 intentos</option>
                    <option>3+ intentos</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="anclaje" checked={anclaje} onChange={e => setAnclaje(e.target.checked)} className="w-4 h-4" />
                  <Label htmlFor="anclaje">Conducta de Anclaje (dedo en tarjeta)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="subverb" checked={subverbalizacion} onChange={e => setSubverbalizacion(e.target.checked)} className="w-4 h-4" />
                  <Label htmlFor="subverb">Sub-verbalización</Label>
                </div>
                <div className="md:col-span-2">
                  <Label>Observaciones Conductuales</Label>
                  <Textarea value={observacionesConducta} onChange={e => setObservacionesConducta(e.target.value)} placeholder="Conducta durante la aplicación..." />
                </div>
              </CardContent>
            </Card>

            {/* Calificación - 30 ítems por figura */}
            <Card className="border-[#85A28B]/30 bg-card">
              <CardHeader>
                <CardTitle className="text-[#4F6F52]">Escala de Maduración — Calificación (30 Ítems)</CardTitle>
                <CardDescription>Marcar 1 si el error está presente, 0 si está ausente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {figuras.map(figura => {
                  const itemsFigura = ITEMS_CALIFICACION.filter(i => i.figura === figura)
                  if (itemsFigura.length === 0) return null
                  return (
                    <div key={figura} className="border border-[#85A28B]/20 rounded-lg p-3">
                      <h4 className="font-semibold text-[#4F6F52] mb-2" style={{ fontFamily: 'var(--font-playfair), serif' }}>Figura {figura}</h4>
                      <div className="space-y-2">
                        {itemsFigura.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-[#DDE9DB]/30">
                            <button
                              onClick={() => toggleItem(item.id)}
                              className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                items[item.id] === 1
                                  ? 'bg-[#8A3D3D] border-[#8A3D3D] text-white'
                                  : 'bg-background border-[#85A28B]/40 hover:border-[#85A28B]'
                              }`}
                            >
                              {items[item.id] === 1 && '✓'}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-[#4F6F52]">Ítem {item.id}</span>
                                <Badge variant="outline" className="text-xs">{item.tipo}</Badge>
                                {item.significanciaDCM && (
                                  <Badge className="text-xs bg-[#8A3D3D]/10 text-[#8A3D3D] border-[#8A3D3D]/30">DCM</Badge>
                                )}
                              </div>
                              <p className="text-sm text-[#121E14] mt-1">{item.descripcion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Indicadores Emocionales */}
            <Card className="border-[#85A28B]/30 bg-card">
              <CardHeader>
                <CardTitle className="text-[#4F6F52]">Indicadores Emocionales (12 IE de Koppitz)</CardTitle>
                <CardDescription>Marcar los indicadores emocionales presentes en el protocolo</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {INDICADORES_EMOCIONALES.map(ie => (
                  <div key={ie.id} className="flex items-start gap-3 p-2 rounded hover:bg-[#DDE9DB]/30">
                    <button
                      onClick={() => toggleIE(ie.id)}
                      className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        ieSeleccionados.includes(ie.id)
                          ? 'bg-[#85A28B] border-[#85A28B] text-white'
                          : 'bg-background border-[#85A28B]/40 hover:border-[#85A28B]'
                      }`}
                    >
                      {ieSeleccionados.includes(ie.id) && '✓'}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#4F6F52]">{ie.id}.</span>
                        <span className="text-sm font-medium text-[#121E14]">{ie.nombre}</span>
                      </div>
                      <p className="text-xs text-[#6A8A70] mt-0.5">{ie.definicion}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Botón analizar */}
            <div className="flex justify-center pb-8">
              <Button
                onClick={handleAnalizar}
                disabled={loading || !nombre}
                size="lg"
                className="px-8 py-6 text-lg btn-sexto gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analizando...</>
                ) : (
                  <><Brain className="w-5 h-5" /> Generar Informe Bender-Koppitz</>
                )}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'resultados' && result && (
          <div className="space-y-6">
            {/* Resultados */}
            <Card className="border-[#85A28B]/30 bg-card">
              <CardHeader>
                <CardTitle className="text-[#4F6F52]">Resultados — {nombre}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Eje I */}
                <div>
                  <h3 className="text-lg font-bold text-[#4F6F52] mb-3">Eje I: Madurez Perceptivo-Motriz</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-[#F5F1E8] p-3 rounded-lg text-center">
                      <p className="text-xs text-[#6A8A70]">Puntaje Directo</p>
                      <p className="text-2xl font-bold text-[#4F6F52]">{result.puntajeDirecto}</p>
                      <p className="text-xs text-[#6A8A70]">errores / 30</p>
                    </div>
                    <div className="bg-[#F5F1E8] p-3 rounded-lg text-center">
                      <p className="text-xs text-[#6A8A70]">Edad Maduración</p>
                      <p className="text-sm font-bold text-[#4F6F52]">{result.edadMaduracionEquivalente}</p>
                    </div>
                    <div className="bg-[#F5F1E8] p-3 rounded-lg text-center">
                      <p className="text-xs text-[#6A8A70]">Nivel Grado</p>
                      <p className="text-xs font-bold text-[#4F6F52]">{result.nivelRendimientoGrado}</p>
                    </div>
                    <div className="bg-[#8A3D3D]/10 p-3 rounded-lg text-center border border-[#8A3D3D]/20">
                      <p className="text-xs text-[#8A3D3D]">Retraso</p>
                      <p className="text-sm font-bold text-[#8A3D3D]">{result.retrasoMeses > 0 ? result.retrasoMeses + ' meses' : 'Sin retraso'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#121E14]">{result.retrasoInterpretacion}</p>
                  
                  {/* Errores por categoría */}
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-[#DDE9DB]/50 rounded">
                      <p className="text-xs text-[#6A8A70]">Distorsión</p>
                      <p className="text-lg font-bold text-[#4F6F52]">{result.erroresPorCategoria.distorsion}</p>
                    </div>
                    <div className="text-center p-2 bg-[#DDE9DB]/50 rounded">
                      <p className="text-xs text-[#6A8A70]">Rotación</p>
                      <p className="text-lg font-bold text-[#4F6F52]">{result.erroresPorCategoria.rotacion}</p>
                    </div>
                    <div className="text-center p-2 bg-[#DDE9DB]/50 rounded">
                      <p className="text-xs text-[#6A8A70]">Integración</p>
                      <p className="text-lg font-bold text-[#4F6F52]">{result.erroresPorCategoria.integracion}</p>
                    </div>
                    <div className="text-center p-2 bg-[#DDE9DB]/50 rounded">
                      <p className="text-xs text-[#6A8A70]">Perseveración</p>
                      <p className="text-lg font-bold text-[#4F6F52]">{result.erroresPorCategoria.perseveracion}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Eje II: DCM */}
                <div>
                  <h3 className="text-lg font-bold text-[#4F6F52] mb-3">Eje II: Indicadores de DCM / Organicidad</h3>
                  {result.dcmIndicadores.length > 0 ? (
                    <div className="space-y-2">
                      {result.dcmIndicadores.map((dcm, i) => (
                        <div key={i} className="p-3 rounded-lg bg-[#8A3D3D]/5 border border-[#8A3D3D]/20">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-[#8A3D3D]" />
                            <span className="font-medium text-[#8A3D3D]">{dcm.figura} — {dcm.item}</span>
                            <Badge className="bg-[#8A3D3D]/10 text-[#8A3D3D]">{dcm.nivel}</Badge>
                          </div>
                          <p className="text-sm text-[#121E14]">{dcm.criterio}</p>
                          <p className="text-xs text-[#6A8A70] mt-1">{dcm.interpretacion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-[#DDE9DB]/30">
                      <p className="text-sm text-[#6A8A70]">No se identifican indicadores de DCM significativos.</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Eje III: Emocional */}
                <div>
                  <h3 className="text-lg font-bold text-[#4F6F52] mb-3">Eje III: Indicadores de Desajuste Emocional</h3>
                  <div className="p-3 rounded-lg bg-[#F5F1E8] mb-3">
                    <p className="text-sm text-[#121E14]"><strong>{result.ieTotal}</strong> indicador(es) emocional(es) detectado(s).</p>
                    <p className="text-sm text-[#6A8A70] mt-1">{result.ieSignificacion}</p>
                  </div>
                  {result.ieDetalle.length > 0 && (
                    <div className="space-y-2">
                      {result.ieDetalle.map((ie) => (
                        <div key={ie.id} className="p-3 rounded-lg bg-[#DDE9DB]/30 border border-[#85A28B]/20">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-[#4F6F52]">{ie.id}.</span>
                            <span className="text-sm font-medium text-[#121E14]">{ie.nombre}</span>
                          </div>
                          <p className="text-xs text-[#6A8A70]">{ie.definicion}</p>
                          <p className="text-sm text-[#121E14] mt-1">{ie.interpretacion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Síntesis */}
                <div>
                  <h3 className="text-lg font-bold text-[#4F6F52] mb-3">Síntesis Diagnóstica</h3>
                  <div className="p-4 rounded-lg bg-[#F5F1E8] border border-[#85A28B]/20">
                    <p className="text-sm text-[#121E14] whitespace-pre-line">{result.sintesis}</p>
                  </div>
                </div>

                <Separator />

                {/* Recomendaciones */}
                <div>
                  <h3 className="text-lg font-bold text-[#4F6F52] mb-3">Recomendaciones</h3>
                  <ul className="space-y-2">
                    {result.recomendaciones.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[#DDE9DB]/30">
                        <CheckCircle className="w-4 h-4 text-[#85A28B] mt-0.5 shrink-0" />
                        <span className="text-sm text-[#121E14]">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Botones */}
            <div className="flex justify-center gap-4 pb-8">
              <Button onClick={() => setActiveTab('ingreso')} variant="outline" className="border-[#85A28B]/40 text-[#4F6F52]">
                <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Calificación
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#121E14] text-[#EBE4D6] mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm font-semibold text-[#F5F1E8]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
            Sexto Sistema · Bender-Koppitz
          </p>
          <p className="text-xs text-[#A8C3A0] mt-1">© 2026 Sexto Sistema · PsicoInformes Automatizados</p>
        </div>
      </footer>
    </div>
  )
}
