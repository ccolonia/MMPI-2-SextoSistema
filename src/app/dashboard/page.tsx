'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogOut, Users, FileText, Brain, Plus, Search } from 'lucide-react'

interface User {
  id: string
  email: string
  nombre: string
  apellido: string | null
  matricula: string | null
  plan: string
  rol: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user) {
          router.push('/login')
        } else {
          setUser(data.user)
        }
        setLoading(false)
      })
      .catch(() => {
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
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/sexto-logo.png" alt="Sexto Sistema" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
                  Dashboard · <span className="text-cyan-400">Sexto Sistema</span>
                </h1>
                <p className="text-xs text-zinc-400">Plataforma de evaluación psicológica</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-white">{user.nombre} {user.apellido || ''}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
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
          <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            Hola, {user.nombre} 👋
          </h2>
          <p className="text-zinc-400">Gestioná tus evaluaciones y pacientes desde aquí.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-cyan-500/20 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Pacientes</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <Users className="w-10 h-10 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Evaluaciones</p>
                  <p className="text-3xl font-bold text-white">0</p>
                </div>
                <FileText className="w-10 h-10 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Plan actual</p>
                  <p className="text-2xl font-bold text-cyan-400 uppercase">{user.plan}</p>
                </div>
                <Brain className="w-10 h-10 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instrumentos disponibles */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Instrumentos disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-cyan-500/20 bg-card hover:border-cyan-500/50 transition-colors cursor-pointer" onClick={() => router.push('/instrumentos/mmpi2')}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Brain className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">MMPI-2</CardTitle>
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
            <Card className="border-zinc-800 bg-card/50 opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800">
                    <Brain className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div>
                    <CardTitle className="text-zinc-400">Bender</CardTitle>
                    <CardDescription>Test Gestáltico Visomotor (próximamente)</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-zinc-800 bg-card/50 opacity-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800">
                    <Brain className="w-6 h-6 text-zinc-600" />
                  </div>
                  <div>
                    <CardTitle className="text-zinc-400">HTP</CardTitle>
                    <CardDescription>House-Tree-Person (próximamente)</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Evaluaciones recientes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Evaluaciones recientes</h3>
            <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-400">
              <Search className="w-4 h-4 mr-2" />
              Ver todas
            </Button>
          </div>
          <Card className="border-cyan-500/20 bg-card">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">No tenés evaluaciones todavía</p>
              <Button className="btn-sexto" onClick={() => router.push('/instrumentos/mmpi2')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera evaluación
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
