'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogOut, Users, FileText, Brain, Plus, Clock } from 'lucide-react'

interface User {
  id: string
  email: string
  nombre: string
  apellido: string | null
  matricula: string | null
  plan: string
  rol: string
}

interface DashboardData {
  stats: {
    totalPacientes: number
    totalEvaluaciones: number
    totalInformes: number
  }
  evaluacionesRecientes: Array<{
    id: string
    nombreEvaluado: string | null
    fechaEvaluacion: string | null
    evaluador: string | null
    createdAt: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar usuario y datos del dashboard en paralelo
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/dashboard', { credentials: 'include' }).then(r => r.json()),
    ]).then(([userData, dashData]) => {
      if (!userData.user) {
        router.push('/login')
      } else {
        setUser(userData.user)
        if (dashData.stats) setDashboardData(dashData)
      }
      setLoading(false)
    }).catch(() => {
      router.push('/login')
      setLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F6F52]" />
      </div>
    )
  }

  if (!user) return null

  const totalEval = dashboardData?.stats.totalInformes || 0
  const totalPac = dashboardData?.stats.totalPacientes || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[#85A28B]/30 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/sexto-logo.png" alt="Sexto Sistema" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[#121E14]" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                  Dashboard · <span className="text-[#4F6F52]">Sexto Sistema</span>
                </h1>
                <p className="text-xs text-[#6A8A70]">Plataforma de evaluación psicológica</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-[#121E14]">{user.nombre} {user.apellido || ''}</p>
                <p className="text-xs text-[#6A8A70]">{user.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-[#85A28B]/40 text-[#4F6F52] hover:bg-[#85A28B]/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#121E14] mb-2" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            Hola, {user.nombre} 👋
          </h2>
          <p className="text-[#6A8A70]">Gestioná tus evaluaciones y pacientes desde aquí.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#85A28B]/30 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6A8A70]">Pacientes</p>
                  <p className="text-3xl font-bold text-[#121E14]">{totalPac}</p>
                </div>
                <Users className="w-10 h-10 text-[#4F6F52]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#85A28B]/30 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6A8A70]">Informes MMPI-2</p>
                  <p className="text-3xl font-bold text-[#121E14]">{totalEval}</p>
                </div>
                <FileText className="w-10 h-10 text-[#4F6F52]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#85A28B]/30 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6A8A70]">Plan actual</p>
                  <p className="text-2xl font-bold text-[#4F6F52] uppercase">{user.plan}</p>
                </div>
                <Brain className="w-10 h-10 text-[#4F6F52]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrumentos disponibles */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#121E14] mb-4">Instrumentos disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-[#85A28B]/30 bg-card hover:border-[#85A28B]/60 transition-colors cursor-pointer" onClick={() => router.push('/instrumentos/mmpi2')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#85A28B]/10">
                    <Brain className="w-6 h-6 text-[#4F6F52]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#121E14]">MMPI-2</CardTitle>
                    <CardDescription>Inventario Multifásico de Personalidad de Minnesota-2</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full btn-sexto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva evaluación
                </Button>
              </CardContent>
            </Card>

            {/* Placeholder para futuros instrumentos */}
            <Card className="border-[#85A28B]/20 bg-card/50 opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2E4230]">
                    <Brain className="w-6 h-6 text-[#85A28B]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#6A8A70]">Bender</CardTitle>
                    <CardDescription>Test Gestáltico Visomotor (próximamente)</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-[#85A28B]/20 bg-card/50 opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#2E4230]">
                    <Brain className="w-6 h-6 text-[#85A28B]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#6A8A70]">HTP</CardTitle>
                    <CardDescription>House-Tree-Person (próximamente)</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Evaluaciones recientes */}
        <div>
          <h3 className="text-xl font-bold text-[#121E14] mb-4">Evaluaciones recientes</h3>
          <Card className="border-[#85A28B]/30 bg-card">
            {totalEval === 0 ? (
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-[#85A28B] mx-auto mb-4" />
                <p className="text-[#6A8A70] mb-4">No tenés evaluaciones todavía</p>
                <Button className="btn-sexto" onClick={() => router.push('/instrumentos/mmpi2')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera evaluación
                </Button>
              </CardContent>
            ) : (
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {dashboardData?.evaluacionesRecientes.map((evaluacion) => (
                    <div
                      key={evaluacion.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-[#85A28B]/20 hover:bg-[#85A28B]/5 transition-colors cursor-pointer"
                      onClick={() => router.push('/instrumentos/mmpi2')}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-[#121E14]">{evaluacion.nombreEvaluado || 'Sin nombre'}</p>
                        <p className="text-sm text-[#6A8A70] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(evaluacion.createdAt).toLocaleString('es-AR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                            timeZone: 'America/Buenos_Aires'
                          })}
                        </p>
                      </div>
                      <FileText className="w-5 h-5 text-[#4F6F52]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
