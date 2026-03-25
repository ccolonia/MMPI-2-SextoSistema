'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Brain,
  Activity,
  Users,
  HeartPulse,
  ClipboardList,
  Download,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
  RotateCcw,
  Cloud,
  CloudOff,
  FileDown,
  Eye,
  X,
  Upload,
  FileSpreadsheet
} from 'lucide-react'
import { calificarMMPI2, RespuestaItem } from '@/lib/mmpi2/calificacion'
import { convertirAT } from '@/lib/mmpi2/tablas-conversion'

// Importar preguntas directamente del JSON
import preguntasData from '@/lib/mmpi2/preguntas.json'

// Tipos locales
interface DemographicData {
  sexo: 'masculino' | 'femenino'
  edad: number
  contextoEvaluacion: 'clinico' | 'forense' | 'laboral' | 'investigacion'
  motivoConsulta: string
  fechaEvaluacion: string
  nombreEvaluado: string
  evaluador: string
  institucion: string
}

interface MMPI2Protocol {
  demograficos: DemographicData
  omisiones: number
  vrint: number
  trint: number
  fBruto: number
  fT: number
  fbT: number
  fpBruto: number
  f_K: number
  lBruto: number
  kBruto: number
  escalasClinicas: {
    Hs: number; D: number; Hy: number; Pd: number; Mf: number
    Pa: number; Pt: number; Sc: number; Ma: number; Si: number
  }
  escalasSuplementarias?: {
    A: number; R: number; Es: number; MACR: number; OH: number
    PK: number; PS: number; Do: number; Re: number
  }
  escalasContenido?: {
    ANX: number; FRS: number; OBS: number; DEP: number; HEA: number
    BIZ: number; ANG: number; CYN: number; ASP: number; TPA: number
    LSE: number; SOD: number; FAM: number; WRK: number; TRT: number
  }
}

interface AnalysisResult {
  validez: {
    omisionesStatus: string; omisionesMensaje: string
    vrinStatus: string; vrinMensaje: string
    trinStatus: string; trinMensaje: string
    fStatus: string; fMensaje: string
    fbStatus: string; fbMensaje: string
    fFbConsistencia: string; fFbMensaje: string
    fpStatus: string; fpMensaje: string
    fKStatus: string; fKMensaje: string
    lStatus: string; lMensaje: string
    kStatus: string; kMensaje: string
    conclusionGeneral: string; justificacionValidez: string
  }
  escalasClinicasInterpretadas: Array<{
    codigo: string; nombre: string; puntajeT: number
    elevacion: string; interpretacion: string
    correlatos: string[]; recomendaciones: string[]
  }>
  escalasElevadas: string[]
  codigoPerfil: {
    codigo: string; escalasInvolucradas: string[]
    definicion: string; interpretacion: string
    correlatosClinicos: string[]; pronostico: string
  } | null
  interpretacionSuplementarias: Array<{
    codigo: string; nombre: string; puntajeT: number
    elevacion: string; interpretacion: string
    correlatos: string[]; recomendaciones: string[]
  }>
  formulacionClinica: {
    validezProtocolo: string; perfilPersonalidad: string
    areasAfectadas: {
      cognitivo: string; afectivo: string; conductual: string
      interpersonal: string; somatico: string
    }
    recursosFortalezas: string[]; riesgos: string[]
    pronostico: string; recomendacionesTerapeuticas: string[]
  }
}

// Estado inicial
const initialProtocol: MMPI2Protocol = {
  demograficos: {
    sexo: 'masculino', edad: 30, contextoEvaluacion: 'clinico',
    motivoConsulta: '', fechaEvaluacion: new Date().toISOString().split('T')[0],
    nombreEvaluado: '', evaluador: '', institucion: ''
  },
  omisiones: 0, vrint: 50, trint: 50, fBruto: 10, fT: 50,
  fbT: 50, fpBruto: 3, f_K: 0, lBruto: 3, kBruto: 12,
  escalasClinicas: { Hs: 50, D: 50, Hy: 50, Pd: 50, Mf: 50, Pa: 50, Pt: 50, Sc: 50, Ma: 50, Si: 50 },
  escalasSuplementarias: { A: 50, R: 50, Es: 50, MACR: 50, OH: 50, PK: 50, PS: 50, Do: 50, Re: 50 },
  escalasContenido: { ANX: 50, FRS: 50, OBS: 50, DEP: 50, HEA: 50, BIZ: 50, ANG: 50, CYN: 50, ASP: 50, TPA: 50, LSE: 50, SOD: 50, FAM: 50, WRK: 50, TRT: 50 }
}

// Constantes
const TOTAL_PREGUNTAS = 567
const PREGUNTAS_POR_SECCION = 50
const TOTAL_SECCIONES = Math.ceil(TOTAL_PREGUNTAS / PREGUNTAS_POR_SECCION)
const STORAGE_KEY_RESPUESTAS = 'mmpi2_respuestas'
const STORAGE_KEY_DEMOGRAFICOS = 'mmpi2_demograficos'
const STORAGE_KEY_SECCION = 'mmpi2_seccion'

export default function Home() {
  const [protocol, setProtocol] = useState<MMPI2Protocol>(initialProtocol)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [activeTab, setActiveTab] = useState('ingreso')
  const [mode, setMode] = useState<'manual' | 'cuestionario'>('manual')
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [loadingExcel, setLoadingExcel] = useState(false)
  const [dataLoadedFromExcel, setDataLoadedFromExcel] = useState(false)
  
  // Estado para informes guardados
  const [informesGuardados, setInformesGuardados] = useState<Array<any>>([])
  const [loadingInformes, setLoadingInformes] = useState(false)
  const [savingInforme, setSavingInforme] = useState(false)
  const [showSavedInformes, setShowSavedInformes] = useState(false)
  
  // Estado para importar respuestas
  const [importingRespuestas, setImportingRespuestas] = useState(false)
  const [importFormatInfo, setImportFormatInfo] = useState(false)
  
  // Estado del cuestionario
  const [respuestas, setRespuestas] = useState<Map<number, boolean | null>>(new Map())
  const [currentSection, setCurrentSection] = useState(1)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Calcular progreso
  const answeredCount = Array.from(respuestas.values()).filter(r => r !== null && r !== undefined).length
  const progressPercent = (answeredCount / TOTAL_PREGUNTAS) * 100

  // Preguntas cargadas directamente
  const preguntas = preguntasData as Array<{number: number; text: string}>

  // Cargar progreso guardado al iniciar
  useEffect(() => {
    try {
      const savedRespuestas = localStorage.getItem(STORAGE_KEY_RESPUESTAS)
      const savedDemograficos = localStorage.getItem(STORAGE_KEY_DEMOGRAFICOS)
      const savedSeccion = localStorage.getItem(STORAGE_KEY_SECCION)

      if (savedRespuestas) {
        const parsed = JSON.parse(savedRespuestas)
        const map = new Map<number, boolean | null>()
        Object.entries(parsed).forEach(([key, value]) => {
          map.set(parseInt(key), value as boolean | null)
        })
        setRespuestas(map)
      }

      if (savedDemograficos) {
        const parsed = JSON.parse(savedDemograficos)
        setProtocol(prev => ({
          ...prev,
          demograficos: { ...prev.demograficos, ...parsed }
        }))
      }

      if (savedSeccion) {
        setCurrentSection(parseInt(savedSeccion))
      }

      setIsLoaded(true)
    } catch (error) {
      console.error('Error cargando progreso:', error)
      setIsLoaded(true)
    }
  }, [])

  // Cargar datos desde Excel
  const handleLoadFromExcel = useCallback(async () => {
    setLoadingExcel(true)
    try {
      const response = await fetch('/api/mmpi2/upload-excel')
      const data = await response.json()
      
      if (data.error) {
        console.log('No se pudo cargar Excel:', data.error)
        setLoadingExcel(false)
        return
      }
      
      // Actualizar todo el protocolo de una vez
      setProtocol(prev => {
        const nuevasEscalas = { ...prev.escalasClinicas }
        
        // Actualizar escalas clínicas
        if (data.escalasClinicas) {
          const mapping: Record<string, string> = {
            'Hs': 'Hs', 'D': 'D', 'Hy': 'Hy', 'Pd': 'Pd', 'Mf': 'Mf',
            'Pa': 'Pa', 'Pt': 'Pt', 'Sc': 'Sc', 'Ma': 'Ma', 'Si': 'Si'
          }
          
          for (const [key, escala] of Object.entries(data.escalasClinicas)) {
            const mappedKey = mapping[key]
            if (mappedKey && escala && typeof escala === 'object' && 'T' in escala) {
              nuevasEscalas[mappedKey] = (escala as { T: number }).T
            }
          }
        }
        
        return {
          ...prev,
          // Escalas de validez
          omisiones: data.escalasValidez?.omisiones ?? prev.omisiones,
          vrint: data.escalasValidez?.vrint ?? prev.vrint,
          trint: data.escalasValidez?.trint ?? prev.trint,
          fBruto: data.escalasValidez?.fBruto ?? prev.fBruto,
          fT: data.escalasValidez?.fT ?? prev.fT,
          fbT: data.escalasValidez?.fbT ?? prev.fbT,
          fpBruto: data.escalasValidez?.fpBruto ?? prev.fpBruto,
          f_K: data.escalasValidez?.f_K ?? prev.f_K,
          lBruto: data.escalasValidez?.lBruto ?? prev.lBruto,
          kBruto: data.escalasValidez?.kBruto ?? prev.kBruto,
          // Escalas clínicas
          escalasClinicas: nuevasEscalas,
          // Sexo
          demograficos: {
            ...prev.demograficos,
            sexo: data.sexo || prev.demograficos.sexo
          }
        }
      })
      
      setDataLoadedFromExcel(true)
      console.log('Datos cargados automáticamente desde Excel')
    } catch (error) {
      console.error('Error cargando Excel:', error)
    } finally {
      setLoadingExcel(false)
    }
  }, [])

  // Cargar datos del Excel automáticamente al iniciar en modo manual
  useEffect(() => {
    if (isLoaded && mode === 'manual' && !dataLoadedFromExcel) {
      handleLoadFromExcel()
    }
  }, [isLoaded, mode, dataLoadedFromExcel, handleLoadFromExcel])

  // Guardar progreso automáticamente
  const saveProgress = useCallback(() => {
    try {
      const respuestasObj = Object.fromEntries(respuestas)
      localStorage.setItem(STORAGE_KEY_RESPUESTAS, JSON.stringify(respuestasObj))
      localStorage.setItem(STORAGE_KEY_DEMOGRAFICOS, JSON.stringify(protocol.demograficos))
      localStorage.setItem(STORAGE_KEY_SECCION, currentSection.toString())
      setLastSaved(new Date())
    } catch (error) {
      console.error('Error guardando progreso:', error)
    }
  }, [respuestas, protocol.demograficos, currentSection])

  // Auto-guardar cada 30 segundos
  useEffect(() => {
    if (!isLoaded) return
    const interval = setInterval(saveProgress, 30000)
    return () => clearInterval(interval)
  }, [isLoaded, saveProgress])

  // Guardar al cambiar respuestas
  useEffect(() => {
    if (!isLoaded) return
    saveProgress()
  }, [respuestas, isLoaded, saveProgress])

  // Limpiar progreso
  const clearProgress = () => {
    if (confirm('¿Está seguro de que desea borrar todo el progreso? Esta acción no se puede deshacer.')) {
      localStorage.removeItem(STORAGE_KEY_RESPUESTAS)
      localStorage.removeItem(STORAGE_KEY_DEMOGRAFICOS)
      localStorage.removeItem(STORAGE_KEY_SECCION)
      setRespuestas(new Map())
      setCurrentSection(1)
      setProtocol(initialProtocol)
      setLastSaved(null)
    }
  }

  // 🔧 FUNCIÓN DE PRUEBA: Cargar respuestas aleatorias para la sección actual
  const loadRandomAnswersForSection = () => {
    const start = (currentSection - 1) * PREGUNTAS_POR_SECCION + 1
    const end = Math.min(currentSection * PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS)
    
    const newRespuestas = new Map(respuestas)
    for (let i = start; i <= end; i++) {
      const randomValue = Math.random() > 0.5
      newRespuestas.set(i, randomValue)
    }
    
    setRespuestas(newRespuestas)
    
    // Avanzar a la siguiente sección automáticamente
    if (currentSection < TOTAL_SECCIONES) {
      setTimeout(() => {
        setCurrentSection(currentSection + 1)
      }, 300)
    }
  }

  // Actualizar respuesta
  const handleRespuesta = (numPregunta: number, valor: boolean | null) => {
    setRespuestas(prev => {
      const newMap = new Map(prev)
      newMap.set(numPregunta, valor)
      return newMap
    })
  }

  // Calificar y convertir
  const handleCalificar = async () => {
    setLoading(true)
    try {
      // Convertir respuestas a formato de calificación
      const respuestasArray: RespuestaItem[] = Array.from(respuestas.entries()).map(([num, val]) => ({
        numero: num,
        verdadero: val
      }))

      // Completar con las que faltan (null)
      for (let i = 1; i <= TOTAL_PREGUNTAS; i++) {
        if (!respuestas.has(i)) {
          respuestasArray.push({ numero: i, verdadero: null })
        }
      }

      // Calificar
      const puntajesBrutos = calificarMMPI2(respuestasArray, protocol.demograficos.sexo)

      // Convertir a T
      const escalasT = {
        Hs: convertirAT('Hs', puntajesBrutos.hsBruto, protocol.demograficos.sexo),
        D: convertirAT('D', puntajesBrutos.dBruto, protocol.demograficos.sexo),
        Hy: convertirAT('Hy', puntajesBrutos.hyBruto, protocol.demograficos.sexo),
        Pd: convertirAT('Pd', puntajesBrutos.pdBruto, protocol.demograficos.sexo),
        Mf: convertirAT('Mf', puntajesBrutos.mfBruto, protocol.demograficos.sexo),
        Pa: convertirAT('Pa', puntajesBrutos.paBruto, protocol.demograficos.sexo),
        Pt: convertirAT('Pt', puntajesBrutos.ptBruto, protocol.demograficos.sexo),
        Sc: convertirAT('Sc', puntajesBrutos.scBruto, protocol.demograficos.sexo),
        Ma: convertirAT('Ma', puntajesBrutos.maBruto, protocol.demograficos.sexo),
        Si: convertirAT('Si', puntajesBrutos.siBruto, protocol.demograficos.sexo),
      }

      // Actualizar protocolo con resultados
      const protocolWithResults = {
        ...protocol,
        omisiones: puntajesBrutos.omisiones,
        fBruto: puntajesBrutos.fBruto,
        fT: convertirAT('F', puntajesBrutos.fBruto, protocol.demograficos.sexo),
        lBruto: puntajesBrutos.lBruto,
        kBruto: puntajesBrutos.kBruto,
        escalasClinicas: escalasT
      }

      setProtocol(protocolWithResults)

      // Enviar a análisis
      const response = await fetch('/api/mmpi2/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocolWithResults)
      })
      
      const result = await response.json()
      setAnalysisResult(result)
      setActiveTab('resultados')
    } catch (error) {
      console.error('Error en calificación:', error)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar datos demográficos
  const updateDemograficos = (field: keyof DemographicData, value: string | number) => {
    setProtocol(prev => ({
      ...prev,
      demograficos: { ...prev.demograficos, [field]: value }
    }))
  }

  // Actualizar escalas de validez
  const updateValidez = (field: string, value: number) => {
    setProtocol(prev => ({ ...prev, [field]: value }))
  }

  // Actualizar escalas clínicas
  const updateEscalaClinica = (escala: string, value: number) => {
    setProtocol(prev => ({
      ...prev,
      escalasClinicas: { ...prev.escalasClinicas, [escala]: value }
    }))
  }

  // Enviar análisis (modo manual)
  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mmpi2/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocol)
      })
      const result = await response.json()
      setAnalysisResult(result)
      setActiveTab('resultados')
    } catch (error) {
      console.error('Error en análisis:', error)
    } finally {
      setLoading(false)
    }
  }

  // Exportar a PDF
  const handleExportPdf = async () => {
    if (!analysisResult) return
    
    setExportingPdf(true)
    try {
      // Preparar datos completos para el PDF
      const pdfData = {
        demograficos: protocol.demograficos,
        omisiones: protocol.omisiones,
        vrint: protocol.vrint,
        trint: protocol.trint,
        fT: protocol.fT,
        fbT: protocol.fbT,
        fpBruto: protocol.fpBruto,
        f_K: protocol.f_K,
        lBruto: protocol.lBruto,
        kBruto: protocol.kBruto,
        escalasClinicas: protocol.escalasClinicas,
        escalasSuplementarias: protocol.escalasSuplementarias,
        escalasContenido: protocol.escalasContenido,
        analysisResult: analysisResult
      }
      
      const response = await fetch('/api/mmpi2/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pdfData)
      })
      
      if (!response.ok) {
        throw new Error('Error al generar PDF')
      }
      
      // Descargar el PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Informe_MMPI2_${protocol.demograficos.nombreEvaluado || 'Evaluado'}_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exportando PDF:', error)
      alert('Error al generar el PDF. Por favor intente nuevamente.')
    } finally {
      setExportingPdf(false)
    }
  }

  // Vista previa del PDF
  const handlePreviewPdf = async () => {
    if (!analysisResult) return
    
    setExportingPdf(true)
    try {
      // Preparar datos completos para el PDF
      const pdfData = {
        demograficos: protocol.demograficos,
        omisiones: protocol.omisiones,
        vrint: protocol.vrint,
        trint: protocol.trint,
        fT: protocol.fT,
        fbT: protocol.fbT,
        fpBruto: protocol.fpBruto,
        f_K: protocol.f_K,
        lBruto: protocol.lBruto,
        kBruto: protocol.kBruto,
        escalasClinicas: protocol.escalasClinicas,
        escalasSuplementarias: protocol.escalasSuplementarias,
        escalasContenido: protocol.escalasContenido,
        analysisResult: analysisResult
      }
      
      const response = await fetch('/api/mmpi2/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pdfData)
      })
      
      if (!response.ok) {
        throw new Error('Error al generar PDF')
      }
      
      // Crear URL para la vista previa
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setPdfPreviewUrl(url)
    } catch (error) {
      console.error('Error generando vista previa:', error)
      alert('Error al generar la vista previa. Por favor intente nuevamente.')
    } finally {
      setExportingPdf(false)
    }
  }

  // Cerrar vista previa
  const closePreview = () => {
    if (pdfPreviewUrl) {
      window.URL.revokeObjectURL(pdfPreviewUrl)
    }
    setPdfPreviewUrl(null)
  }

  // Función para guardar informe en la base de datos
  const handleSaveInforme = async () => {
    if (!analysisResult) {
      alert('Primero debe generar un análisis antes de guardar')
      return
    }
    
    setSavingInforme(true)
    try {
      const response = await fetch('/api/informes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demograficos: protocol.demograficos,
          omisiones: protocol.omisiones,
          vrint: protocol.vrint,
          trint: protocol.trint,
          fBruto: protocol.fBruto,
          fT: protocol.fT,
          fbT: protocol.fbT,
          fpBruto: protocol.fpBruto,
          f_K: protocol.f_K,
          lBruto: protocol.lBruto,
          kBruto: protocol.kBruto,
          escalasClinicas: protocol.escalasClinicas,
          escalasSuplementarias: protocol.escalasSuplementarias,
          escalasContenido: protocol.escalasContenido,
          analysisResult: analysisResult
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`Informe guardado correctamente para ${protocol.demograficos.nombreEvaluado || 'el evaluado'}`)
        loadInformesGuardados()
      } else {
        alert('Error al guardar el informe: ' + (result.error || 'Error desconocido'))
      }
    } catch (error) {
      console.error('Error guardando informe:', error)
      alert('Error al guardar el informe')
    } finally {
      setSavingInforme(false)
    }
  }

  // Función para cargar informes guardados
  const loadInformesGuardados = async () => {
    setLoadingInformes(true)
    try {
      const response = await fetch('/api/informes')
      const informes = await response.json()
      setInformesGuardados(informes)
    } catch (error) {
      console.error('Error cargando informes:', error)
    } finally {
      setLoadingInformes(false)
    }
  }

  // Función para cargar un informe específico
  const handleLoadInforme = async (id: string) => {
    try {
      const response = await fetch(`/api/informes?id=${id}`)
      const informes = await response.json()
      
      if (informes && informes.length > 0) {
        const informe = informes[0] as any
        
        // Cargar datos demográficos
        setProtocol(prev => ({
          ...prev,
          demograficos: {
            ...prev.demograficos,
            nombreEvaluado: informe.nombreEvaluado || '',
            edad: informe.edad || 30,
            sexo: informe.sexo || 'masculino',
            contextoEvaluacion: informe.contextoEvaluacion || 'clinico',
            motivoConsulta: informe.motivoConsulta || '',
            fechaEvaluacion: informe.fechaEvaluacion || new Date().toISOString().split('T')[0],
            evaluador: informe.evaluador || '',
            institucion: informe.institucion || ''
          },
          omisiones: informe.omisiones || 0,
          vrint: informe.vrint || 50,
          trint: informe.trint || 50,
          fBruto: informe.fBruto || 0,
          fT: informe.fT || 50,
          fbT: informe.fbT || 50,
          fpBruto: informe.fpBruto || 0,
          f_K: informe.f_K || 0,
          lBruto: informe.lBruto || 0,
          kBruto: informe.kBruto || 0,
          escalasClinicas: {
            Hs: informe.hsT || 50,
            D: informe.dT || 50,
            Hy: informe.hyT || 50,
            Pd: informe.pdT || 50,
            Mf: informe.mfT || 50,
            Pa: informe.paT || 50,
            Pt: informe.ptT || 50,
            Sc: informe.scT || 50,
            Ma: informe.maT || 50,
            Si: informe.siT || 50
          }
        }))
        
        // Cargar resultado del análisis
        if (informe.analysisResult) {
          try {
            const parsed = JSON.parse(informe.analysisResult)
            setAnalysisResult(parsed)
          } catch (e) {
            console.error('Error parseando analysisResult:', e)
          }
        }
        
        setShowSavedInformes(false)
        setActiveTab('resultados')
        setDataLoadedFromExcel(true)
      }
    } catch (error) {
      console.error('Error cargando informe:', error)
      alert('Error al cargar el informe')
    }
  }

  // Función para eliminar un informe
  const handleDeleteInforme = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar el informe de "${nombre}"?`)) return
    
    try {
      const response = await fetch(`/api/informes?id=${id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        loadInformesGuardados()
      } else {
        alert('Error al eliminar el informe')
      }
    } catch (error) {
      console.error('Error eliminando informe:', error)
      alert('Error al eliminar el informe')
    }
  }

  // Función para importar respuestas desde Excel
  const handleImportRespuestas = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setImportingRespuestas(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/mmpi2/import-respuestas', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.error) {
        alert('Error al importar: ' + result.error)
        return
      }
      
      // Cargar las respuestas importadas
      const newRespuestas = new Map<number, boolean | null>()
      result.respuestas.forEach((r: { numero: number; valor: boolean | null }) => {
        newRespuestas.set(r.numero, r.valor)
      })
      
      setRespuestas(newRespuestas)
      alert(`Se importaron ${result.total} respuestas correctamente`)
    } catch (error) {
      console.error('Error importando respuestas:', error)
      alert('Error al importar las respuestas')
    } finally {
      setImportingRespuestas(false)
      // Reset the input
      event.target.value = ''
    }
  }

  // Función para descargar plantilla Excel
  const downloadTemplate = () => {
    // Descargar el archivo Excel desde la carpeta public
    const link = document.createElement('a')
    link.href = '/download/plantilla_respuestas_mmpi2.xlsx'
    link.download = 'plantilla_respuestas_mmpi2.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Cargar informes al montar el componente
  useEffect(() => {
    loadInformesGuardados()
  }, [])

  // Función para obtener color según puntaje T
  const getColorByT = (t: number): string => {
    if (t >= 80) return 'bg-red-500'
    if (t >= 65) return 'bg-orange-500'
    if (t >= 55) return 'bg-yellow-500'
    if (t >= 45) return 'bg-green-500'
    return 'bg-blue-500'
  }

  // Función para obtener badge según status
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: React.ReactNode; label: string }> = {
      confiable: { variant: 'default', icon: <CheckCircle className="w-4 h-4" />, label: 'Confiable' },
      normal: { variant: 'default', icon: <CheckCircle className="w-4 h-4" />, label: 'Normal' },
      valido: { variant: 'default', icon: <CheckCircle className="w-4 h-4" />, label: 'Válido' },
      elevado: { variant: 'secondary', icon: <AlertCircle className="w-4 h-4" />, label: 'Elevado' },
      invalido: { variant: 'destructive', icon: <XCircle className="w-4 h-4" />, label: 'Inválido' },
      consistente: { variant: 'default', icon: <CheckCircle className="w-4 h-4" />, label: 'Consistente' },
    }
    const config = variants[status] || { variant: 'outline' as const, icon: <AlertCircle className="w-4 h-4" />, label: status }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}{config.label}
      </Badge>
    )
  }

  // Obtener preguntas de la sección actual
  const getCurrentSectionQuestions = () => {
    const start = (currentSection - 1) * PREGUNTAS_POR_SECCION
    const end = Math.min(start + PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS)
    return preguntas.slice(start, end).map(p => ({
      num: p.number,
      texto: p.text
    }))
  }

  // Verificar si una sección está completa
  const isSectionComplete = (sec: number): boolean => {
    const start = (sec - 1) * PREGUNTAS_POR_SECCION + 1
    const end = Math.min(sec * PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS)
    for (let i = start; i <= end; i++) {
      if (!respuestas.has(i) || respuestas.get(i) === null || respuestas.get(i) === undefined) {
        return false
      }
    }
    return true
  }

  // Obtener cantidad de preguntas respondidas en una sección
  const getSectionAnsweredCount = (sec: number): number => {
    const start = (sec - 1) * PREGUNTAS_POR_SECCION + 1
    const end = Math.min(sec * PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS)
    let count = 0
    for (let i = start; i <= end; i++) {
      if (respuestas.has(i) && respuestas.get(i) !== null && respuestas.get(i) !== undefined) {
        count++
      }
    }
    return count
  }

  // Verificar si se puede navegar a una sección (solo secciones completadas o la siguiente pendiente)
  const canNavigateToSection = (sec: number): boolean => {
    // Siempre se puede ir a la sección actual
    if (sec === currentSection) return true
    
    // Se puede ir a secciones ya completadas
    if (isSectionComplete(sec)) return true
    
    // Encontrar la primera sección incompleta
    let firstIncompleteSection = 1
    for (let i = 1; i <= TOTAL_SECCIONES; i++) {
      if (!isSectionComplete(i)) {
        firstIncompleteSection = i
        break
      }
    }
    
    // Solo se puede ir a la primera sección incompleta (donde debería estar trabajando)
    return sec === firstIncompleteSection
  }

  // Obtener la primera sección incompleta
  const getFirstIncompleteSection = (): number => {
    for (let i = 1; i <= TOTAL_SECCIONES; i++) {
      if (!isSectionComplete(i)) {
        return i
      }
    }
    return TOTAL_SECCIONES // Todas están completas
  }

  // Formatear hora de último guardado
  const formatLastSaved = () => {
    if (!lastSaved) return null
    return lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                  MMPI-2 | Sistema de Calificación e Interpretación
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Basado en la Guía de Sanz (2008) - Universidad de Buenos Aires
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ingreso" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Ingreso de Datos
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex items-center gap-2" disabled={!analysisResult}>
              <FileText className="w-4 h-4" />
              Resultados del Análisis
            </TabsTrigger>
          </TabsList>

          {/* Tab de Ingreso */}
          <TabsContent value="ingreso" className="space-y-4">
            {/* Selector de modo */}
            <Card>
              <CardHeader>
                <CardTitle>Modo de Ingreso</CardTitle>
                <CardDescription>
                  Seleccione cómo desea ingresar los datos del MMPI-2
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    variant={mode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setMode('manual')}
                    className={mode === 'manual' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    Ingreso Manual de Puntajes T
                  </Button>
                  <Button
                    variant={mode === 'cuestionario' ? 'default' : 'outline'}
                    onClick={() => setMode('cuestionario')}
                    className={mode === 'cuestionario' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    Aplicar Cuestionario (567 ítems)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Datos Demográficos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Datos del Evaluado
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Evaluado</Label>
                  <Input id="nombre" value={protocol.demograficos.nombreEvaluado}
                    onChange={(e) => updateDemograficos('nombreEvaluado', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad</Label>
                  <Input id="edad" type="number" value={protocol.demograficos.edad}
                    onChange={(e) => updateDemograficos('edad', parseInt(e.target.value) || 0)} min="18" max="100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={protocol.demograficos.sexo} onValueChange={(v) => updateDemograficos('sexo', v as 'masculino' | 'femenino')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contexto">Contexto de Evaluación</Label>
                  <Select value={protocol.demograficos.contextoEvaluacion} onValueChange={(v) => updateDemograficos('contextoEvaluacion', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinico">Clínico</SelectItem>
                      <SelectItem value="forense">Forense</SelectItem>
                      <SelectItem value="laboral">Laboral</SelectItem>
                      <SelectItem value="investigacion">Investigación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de Evaluación</Label>
                  <Input id="fecha" type="date" value={protocol.demograficos.fechaEvaluacion}
                    onChange={(e) => updateDemograficos('fechaEvaluacion', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evaluador">Evaluador</Label>
                  <Input id="evaluador" value={protocol.demograficos.evaluador}
                    onChange={(e) => updateDemograficos('evaluador', e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="motivo">Motivo de Consulta/Evaluación</Label>
                  <Textarea id="motivo" value={protocol.demograficos.motivoConsulta}
                    onChange={(e) => updateDemograficos('motivoConsulta', e.target.value)} rows={2} />
                </div>
              </CardContent>
            </Card>

            {mode === 'cuestionario' ? (
              /* MODO CUESTIONARIO */
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <ClipboardList className="w-6 h-6" />
                        Cuestionario MMPI-2 Completo
                      </CardTitle>
                      <CardDescription className="text-emerald-100 mt-1">
                        Responda cada ítem como Verdadero (V) o Falso (F) - Total: {TOTAL_PREGUNTAS} preguntas
                      </CardDescription>
                    </div>
                    {/* Estado de guardado */}
                    <div className="flex items-center gap-2 text-sm">
                      {lastSaved ? (
                        <div className="flex items-center gap-1 bg-emerald-800/50 px-3 py-1 rounded-full">
                          <Cloud className="w-4 h-4" />
                          <span>Guardado {formatLastSaved()}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-emerald-800/50 px-3 py-1 rounded-full">
                          <CloudOff className="w-4 h-4" />
                          <span>Sin guardar</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progreso: {answeredCount} de {TOTAL_PREGUNTAS} preguntas respondidas</span>
                      <span className="text-lg">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-3 bg-emerald-800" />
                    {answeredCount >= 400 && (
                      <div className="flex items-center gap-1 text-emerald-200 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Mínimo de preguntas alcanzado para análisis confiable</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Navegación de secciones */}
                  <div className="bg-slate-100 dark:bg-slate-700 p-4 border-b flex items-center justify-between">
                    <Button variant="outline" onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                      disabled={currentSection === 1} className="gap-2">
                      <ArrowLeft className="w-4 h-4" /> Anterior
                    </Button>
                    
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-semibold">
                        Sección {currentSection} de {TOTAL_SECCIONES}
                      </span>
                      <span className="text-sm text-slate-500">
                        (Preguntas {(currentSection - 1) * PREGUNTAS_POR_SECCION + 1} - {Math.min(currentSection * PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS)})
                      </span>
                      <span className="text-sm font-medium text-emerald-600">
                        {getSectionAnsweredCount(currentSection)} de {Math.min(PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS - (currentSection - 1) * PREGUNTAS_POR_SECCION)} respondidas
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        if (isSectionComplete(currentSection)) {
                          setCurrentSection(Math.min(TOTAL_SECCIONES, currentSection + 1))
                        }
                      }}
                      disabled={currentSection === TOTAL_SECCIONES || !isSectionComplete(currentSection)} 
                      className="gap-2"
                    >
                      Siguiente <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Mensaje de advertencia si la sección no está completa */}
                  {!isSectionComplete(currentSection) && currentSection < TOTAL_SECCIONES && (
                    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-amber-700 font-medium">
                        Debe completar todas las preguntas de esta sección antes de avanzar a la siguiente.
                        Faltan {Math.min(PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS - (currentSection - 1) * PREGUNTAS_POR_SECCION) - getSectionAnsweredCount(currentSection)} preguntas.
                      </span>
                    </div>
                  )}

                  {/* Selector rápido de secciones */}
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 border-b">
                    <div className="flex flex-wrap gap-1 justify-center mb-2">
                      {Array.from({ length: TOTAL_SECCIONES }, (_, i) => i + 1).map((sec) => {
                        const isComplete = isSectionComplete(sec)
                        const canNavigate = canNavigateToSection(sec)
                        const sectionAnswered = getSectionAnsweredCount(sec)
                        const totalInSection = Math.min(PREGUNTAS_POR_SECCION, TOTAL_PREGUNTAS - (sec - 1) * PREGUNTAS_POR_SECCION)
                        
                        return (
                          <button
                            key={sec}
                            onClick={() => {
                              if (canNavigate) {
                                setCurrentSection(sec)
                              }
                            }}
                            disabled={!canNavigate}
                            title={!canNavigate ? 'Complete las secciones anteriores primero' : `Sección ${sec}: ${sectionAnswered}/${totalInSection}`}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${
                              currentSection === sec
                                ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-400'
                                : isComplete
                                  ? 'bg-green-200 text-green-800 hover:bg-green-300 cursor-pointer'
                                  : canNavigate
                                    ? sectionAnswered > 0
                                      ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 cursor-pointer'
                                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer ring-2 ring-amber-300'
                                    : 'bg-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            {sec}
                          </button>
                        )
                      })}
                    </div>
                    <div className="text-center text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 mr-3"><span className="w-3 h-3 rounded bg-green-200"></span> Completa</span>
                      <span className="inline-flex items-center gap-1 mr-3"><span className="w-3 h-3 rounded bg-yellow-200"></span> En progreso</span>
                      <span className="inline-flex items-center gap-1 mr-3"><span className="w-3 h-3 rounded bg-slate-300"></span> Bloqueada</span>
                    </div>
                  </div>

                  {/* Lista de preguntas - MÁS GRANDE */}
                  <ScrollArea className="h-[650px]">
                    <div className="p-4 space-y-4">
                      {!isLoaded ? (
                        <div className="text-center py-8 text-slate-500">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                          Cargando progreso guardado...
                        </div>
                      ) : (
                        getCurrentSectionQuestions().map((pregunta) => {
                          const currentValue = respuestas.get(pregunta.num)
                          return (
                          <div key={pregunta.num} className={`p-4 rounded-lg border transition-all ${
                            respuestas.has(pregunta.num) && respuestas.get(pregunta.num) !== null && respuestas.get(pregunta.num) !== undefined
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200'
                              : respuestas.has(pregunta.num) && respuestas.get(pregunta.num) === null
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200'
                                : 'bg-white dark:bg-slate-800 border-slate-200'
                          }`}>
                            <div className="flex items-start gap-4">
                              <span className="font-mono text-base font-bold text-slate-400 w-10 shrink-0 pt-1">
                                {pregunta.num}.
                              </span>
                              <div className="flex-1">
                                <p className="text-lg mb-3 leading-relaxed">{pregunta.texto}</p>
                                <RadioGroup 
                                  value={currentValue === null ? 'nc' : currentValue?.toString() ?? ''} 
                                  onValueChange={(v) => {
                                    if (v === 'nc') {
                                      handleRespuesta(pregunta.num, null)
                                    } else {
                                      handleRespuesta(pregunta.num, v === 'true')
                                    }
                                  }}
                                  className="flex flex-wrap gap-4 md:gap-6"
                                >
                                  <div className="flex items-center space-x-3 px-4 py-2 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                                    <RadioGroupItem value="true" id={`v-${pregunta.num}`} className="w-5 h-5 text-green-600" />
                                    <Label htmlFor={`v-${pregunta.num}`} className="text-base cursor-pointer font-medium text-green-700">
                                      Verdadero (V)
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-3 px-4 py-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                                    <RadioGroupItem value="false" id={`f-${pregunta.num}`} className="w-5 h-5 text-red-600" />
                                    <Label htmlFor={`f-${pregunta.num}`} className="text-base cursor-pointer font-medium text-red-700">
                                      Falso (F)
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-3 px-4 py-2 rounded-lg border border-amber-400 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer">
                                    <RadioGroupItem value="nc" id={`nc-${pregunta.num}`} className="w-5 h-5 border-amber-500 text-amber-600" />
                                    <Label htmlFor={`nc-${pregunta.num}`} className="text-base cursor-pointer font-medium text-amber-700">
                                      No Contesta (NC)
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          </div>
                        )})
                      )}
                    </div>
                  </ScrollArea>

                  {/* Footer con botones */}
                  <div className="bg-slate-100 dark:bg-slate-700 p-4 border-t">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={saveProgress} className="gap-2">
                          <Save className="w-4 h-4" />
                          Guardar Progreso
                        </Button>
                        <Button variant="outline" onClick={clearProgress} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <RotateCcw className="w-4 h-4" />
                          Borrar Todo
                        </Button>
                        {/* Importar respuestas desde Excel */}
                        <div className="relative">
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleImportRespuestas}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={importingRespuestas}
                          />
                          <Button 
                            variant="outline" 
                            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                            disabled={importingRespuestas}
                          >
                            {importingRespuestas ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
                            ) : (
                              <><Upload className="w-4 h-4" /> Importar Respuestas</>
                            )}
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={downloadTemplate}
                          className="gap-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 border-teal-300"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          Descargar Plantilla
                        </Button>
                        {/* BOTÓN DE PRUEBA */}
                        <Button variant="outline" onClick={loadRandomAnswersForSection} className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300">
                          🧪 Cargar Aleatorio
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {answeredCount} de {TOTAL_PREGUNTAS} respondidas
                        </div>
                        <Button 
                          onClick={handleCalificar} 
                          disabled={loading || answeredCount < 400}
                          size="lg" 
                          className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700 gap-2"
                        >
                          {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Calificando...</>
                          ) : (
                            <><Brain className="w-5 h-5" /> Calificar y Analizar</>
                          )}
                        </Button>
                      </div>
                    </div>
                    {answeredCount < 400 && (
                      <p className="text-center text-sm text-amber-600 mt-3">
                        ⚠️ Responda al menos 400 preguntas para generar un análisis confiable (faltan {400 - answeredCount})
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* MODO MANUAL */
              <>
                {/* Indicador de datos cargados desde Excel */}
                {dataLoadedFromExcel && (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                            ✓ Datos cargados automáticamente desde Excel
                          </h3>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Archivo: MMPI-2_VS_BB_terceros.xls - Las escalas de validez y clínicas han sido cargadas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Botón para cargar desde Excel */}
                <Card className={`bg-gradient-to-r ${dataLoadedFromExcel ? 'from-gray-50 to-gray-100' : 'from-blue-50 to-indigo-50'} dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                          {dataLoadedFromExcel ? 'Recargar datos desde Excel' : 'Cargar datos desde archivo Excel'}
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Lee automáticamente las escalas del archivo MMPI-2_VS_BB_terceros.xls
                        </p>
                      </div>
                      <Button
                        onClick={handleLoadFromExcel}
                        disabled={loadingExcel}
                        className={`${dataLoadedFromExcel ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white gap-2`}
                        size="lg"
                      >
                        {loadingExcel ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <FileSpreadsheet className="w-5 h-5" />
                            {dataLoadedFromExcel ? 'Recargar Excel' : 'Cargar desde Excel'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Escalas de Validez */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Escalas de Validez
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {[
                        { id: 'omisiones', label: 'Omisiones (?)', value: protocol.omisiones },
                        { id: 'vrint', label: 'VRIN (T)', value: protocol.vrint },
                        { id: 'trint', label: 'TRIN (T)', value: protocol.trint },
                        { id: 'fBruto', label: 'F (Bruto)', value: protocol.fBruto },
                        { id: 'fT', label: 'F (T)', value: protocol.fT },
                        { id: 'fbT', label: 'Fb (T)', value: protocol.fbT },
                        { id: 'fpBruto', label: 'F(p) (Bruto)', value: protocol.fpBruto },
                        { id: 'f_K', label: 'Índice F-K', value: protocol.f_K },
                        { id: 'lBruto', label: 'L (Bruto)', value: protocol.lBruto },
                        { id: 'kBruto', label: 'K (Bruto)', value: protocol.kBruto },
                      ].map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <Input id={field.id} type="number" value={field.value}
                            onChange={(e) => updateValidez(field.id, parseInt(e.target.value) || 0)} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Escalas Clínicas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5" />
                      Escalas Clínicas Básicas (Puntajes T)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(protocol.escalasClinicas).map(([codigo, valor]) => {
                        const nombres: Record<string, string> = {
                          Hs: '1. Hipocondriasis', D: '2. Depresión', Hy: '3. Histeria',
                          Pd: '4. Desv. Psicopática', Mf: '5. Masc-Fem', Pa: '6. Paranoia',
                          Pt: '7. Psicastenia', Sc: '8. Esquizofrenia', Ma: '9. Hipomanía', Si: '0. Introversión'
                        }
                        return (
                          <div key={codigo} className="space-y-2">
                            <Label htmlFor={`escala-${codigo}`} className="text-xs">{nombres[codigo]}</Label>
                            <div className="flex items-center gap-2">
                              <Input id={`escala-${codigo}`} type="number" value={valor}
                                onChange={(e) => updateEscalaClinica(codigo, parseInt(e.target.value) || 0)}
                                className={`text-center font-bold ${valor >= 65 ? 'border-orange-500' : ''}`} />
                              <div className={`w-3 h-3 rounded-full ${getColorByT(valor)}`} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Botón de Análisis */}
                <div className="flex justify-center py-4">
                  <Button onClick={handleAnalyze} disabled={loading}
                    size="lg" className="px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analizando...</>
                    ) : (
                      <><Brain className="w-5 h-5 mr-2" /> Generar Análisis MMPI-2</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab de Resultados */}
          <TabsContent value="resultados" className="space-y-4">
            {analysisResult && (
              <>
                {/* Botones de acción - Guardar y Ver Informes */}
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                          Gestión del Informe
                        </h3>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          Guarde el informe actual o consulte informes anteriores
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveInforme}
                          disabled={savingInforme || !analysisResult}
                          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                          size="lg"
                        >
                          {savingInforme ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Guardar Informe
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            loadInformesGuardados()
                            setShowSavedInformes(!showSavedInformes)
                          }}
                          variant="outline"
                          className="border-purple-300 text-purple-700 hover:bg-purple-50 gap-2"
                          size="lg"
                        >
                          <FileText className="w-5 h-5" />
                          Ver Informes ({informesGuardados.length})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de informes guardados */}
                {showSavedInformes && (
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Informes Guardados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingInformes ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        </div>
                      ) : informesGuardados.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">
                          No hay informes guardados
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {informesGuardados.map((informe: any) => (
                            <div 
                              key={informe.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{informe.nombreEvaluado || 'Sin nombre'}</p>
                                <p className="text-sm text-slate-500">
                                  {informe.fechaEvaluacion || informe.createdAt?.split('T')[0]} - {informe.evaluador || 'Sin evaluador'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleLoadInforme(informe.id)}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Cargar
                                </Button>
                                <Button
                                  onClick={() => handleDeleteInforme(informe.id, informe.nombreEvaluado || 'Sin nombre')}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Vista Previa del PDF - DIRECTAMENTE EN LA PÁGINA */}
                <Card className="border-emerald-200 dark:border-emerald-800">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <FileText className="w-6 h-6" />
                          Vista Previa del Informe MMPI-2
                        </CardTitle>
                        <p className="text-emerald-100 mt-1">
                          {protocol.demograficos.nombreEvaluado || 'Evaluado'} - {protocol.demograficos.fechaEvaluacion}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!pdfPreviewUrl && (
                          <Button
                            onClick={handlePreviewPdf}
                            disabled={exportingPdf}
                            variant="secondary"
                            className="gap-2"
                            size="lg"
                          >
                            {exportingPdf ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generando...
                              </>
                            ) : (
                              <>
                                <Eye className="w-5 h-5" />
                                Generar Vista Previa
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          onClick={handleExportPdf}
                          disabled={exportingPdf}
                          className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2"
                          size="lg"
                        >
                          {exportingPdf ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Generando PDF...
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5" />
                              Descargar PDF
                            </>
                          )}
                        </Button>
                        {pdfPreviewUrl && (
                          <Button
                            onClick={closePreview}
                            variant="outline"
                            className="border-white text-white hover:bg-emerald-800 gap-2"
                          >
                            <X className="w-5 h-5" />
                            Cerrar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {pdfPreviewUrl ? (
                      <div className="w-full" style={{ height: '800px' }}>
                        <iframe
                          src={pdfPreviewUrl}
                          className="w-full h-full border-0"
                          title="Vista previa del informe MMPI-2"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                        <FileText className="w-16 h-16 mb-4 opacity-30" />
                        <p className="text-lg mb-2">Vista previa del informe</p>
                        <p className="text-sm text-center max-w-md">
                          Haga clic en "Generar Vista Previa" para visualizar el informe PDF completo directamente en esta página.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resumen de Validez */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      FASE 1: Evaluación de Validez del Protocolo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: 'Omisiones', status: analysisResult.validez.omisionesStatus, msg: analysisResult.validez.omisionesMensaje },
                        { label: 'VRIN', status: analysisResult.validez.vrinStatus, msg: analysisResult.validez.vrinMensaje },
                        { label: 'TRIN', status: analysisResult.validez.trinStatus, msg: analysisResult.validez.trinMensaje },
                        { label: 'Escala F', status: analysisResult.validez.fStatus, msg: analysisResult.validez.fMensaje },
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{item.label}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="text-sm text-slate-600">{item.msg}</p>
                        </div>
                      ))}
                    </div>
                    <Alert className={
                      analysisResult.validez.conclusionGeneral === 'valido' ? 'border-green-500 bg-green-50' :
                      analysisResult.validez.conclusionGeneral === 'invalido' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="font-bold">
                        Conclusión: {analysisResult.validez.conclusionGeneral === 'valido' ? 'PROTOCOLO VÁLIDO' :
                          analysisResult.validez.conclusionGeneral === 'invalido' ? 'PROTOCOLO INVÁLIDO' : 'VÁLIDO CON RESERVAS'}
                      </AlertTitle>
                      <AlertDescription>{analysisResult.validez.justificacionValidez}</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Perfil Gráfico */}
                <Card>
                  <CardHeader>
                    <CardTitle>FASE 2: Perfil de Escalas Clínicas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysisResult.escalasClinicasInterpretadas.map((escala) => (
                        <div key={escala.codigo} className="flex items-center gap-4">
                          <span className="w-20 text-sm font-medium">{escala.codigo}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                            <div className={`h-6 rounded-full transition-all ${getColorByT(escala.puntajeT)}`}
                              style={{ width: `${Math.min(100, (escala.puntajeT / 120) * 100)}%` }} />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-white">
                              T={escala.puntajeT}
                            </span>
                          </div>
                          {escala.elevacion !== 'normal' && <Badge variant="destructive">Elevada</Badge>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>30T</span>
                      <span className="text-orange-500">65T (Elevación)</span>
                      <span>80T (Significativa)</span>
                      <span>120T</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Código de Perfil */}
                {analysisResult.codigoPerfil && (
                  <Card>
                    <CardHeader><CardTitle>FASE 3: Código de Perfil</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold text-emerald-600">{analysisResult.codigoPerfil.codigo}</span>
                        <Badge variant="outline">{analysisResult.codigoPerfil.definicion.replace('_', ' ')}</Badge>
                      </div>
                      <Alert>
                        <AlertTitle>Interpretación del Código</AlertTitle>
                        <AlertDescription className="mt-2">{analysisResult.codigoPerfil.interpretacion}</AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Correlatos Clínicos</h4>
                          <ul className="list-disc list-inside text-sm text-slate-600">
                            {analysisResult.codigoPerfil.correlatosClinicos.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Pronóstico</h4>
                          <p className="text-sm text-slate-600">{analysisResult.codigoPerfil.pronostico}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Formulación Clínica */}
                <Card>
                  <CardHeader>
                    <CardTitle>FASE 6: Formulación Clínica Integrada</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Validez del Protocolo</h4>
                      <p className="text-slate-700">{analysisResult.formulacionClinica.validezProtocolo}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Perfil de Personalidad</h4>
                      <p className="text-slate-700">{analysisResult.formulacionClinica.perfilPersonalidad}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-4">Áreas Afectadas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analysisResult.formulacionClinica.areasAfectadas).map(([area, desc]) => (
                          <div key={area} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                            <h5 className="font-medium mb-2 capitalize">{area}</h5>
                            <p className="text-sm text-slate-600">{desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <h4 className="font-semibold text-green-700 mb-2">Recursos y Fortalezas</h4>
                        <ul className="list-disc list-inside text-sm text-green-600">
                          {analysisResult.formulacionClinica.recursosFortalezas.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <h4 className="font-semibold text-red-700 mb-2">Riesgos</h4>
                        <ul className="list-disc list-inside text-sm text-red-600">
                          {analysisResult.formulacionClinica.riesgos.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Pronóstico</h4>
                      <p className="text-slate-700">{analysisResult.formulacionClinica.pronostico}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Recomendaciones Terapéuticas</h4>
                      <ul className="list-disc list-inside text-slate-700">
                        {analysisResult.formulacionClinica.recomendacionesTerapeuticas.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

    </div>
  )
}
