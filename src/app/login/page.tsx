'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Lock, User, Phone, Building2, Award } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register state
  const [regNombre, setRegNombre] = useState('')
  const [regApellido, setRegApellido] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regMatricula, setRegMatricula] = useState('')
  const [regTelefono, setRegTelefono] = useState('')
  const [regInstitucion, setRegInstitucion] = useState('')
  const [regEspecialidad, setRegEspecialidad] = useState('')

  useEffect(() => {
    // Si ya está logueado, redirigir al dashboard
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: regNombre,
          apellido: regApellido,
          email: regEmail,
          password: regPassword,
          matricula: regMatricula,
          telefono: regTelefono,
          institucion: regInstitucion,
          especialidad: regEspecialidad,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Glow ambiental */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#85A28B]/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/sexto-logo.png" alt="Sexto Sistema" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#121E14]" style={{ fontFamily: 'var(--font-plus-jakarta)' }}>
            Plataforma <span className="text-[#4F6F52]">Profesional</span>
          </h1>
          <p className="text-sm text-[#6A8A70] mt-1">PsicoInformes Automatizados Six</p>
        </div>

        <Card className="border-[#85A28B]/30 bg-card/80 backdrop-blur">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-[#121E14]">Bienvenido de vuelta</CardTitle>
                <CardDescription>Ingresá con tu cuenta para continuar</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-sexto"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ingresar'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-[#121E14]">Crear cuenta profesional</CardTitle>
                <CardDescription>Registrá tu cuenta para acceder a la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-nombre">Nombre *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                        <Input
                          id="reg-nombre"
                          placeholder="Juan"
                          value={regNombre}
                          onChange={(e) => setRegNombre(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-apellido">Apellido</Label>
                      <Input
                        id="reg-apellido"
                        placeholder="Pérez"
                        value={regApellido}
                        onChange={(e) => setRegApellido(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-matricula">Matrícula</Label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                        <Input
                          id="reg-matricula"
                          placeholder="MP-1234"
                          value={regMatricula}
                          onChange={(e) => setRegMatricula(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-telefono">Teléfono</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                        <Input
                          id="reg-telefono"
                          placeholder="+54 9 11..."
                          value={regTelefono}
                          onChange={(e) => setRegTelefono(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-institucion">Institución/Consultorio</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6A8A70]" />
                      <Input
                        id="reg-institucion"
                        placeholder="Consultorio privado / Hospital X"
                        value={regInstitucion}
                        onChange={(e) => setRegInstitucion(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-especialidad">Especialidad</Label>
                    <Input
                      id="reg-especialidad"
                      placeholder="Clínica / Forense / Laboral"
                      value={regEspecialidad}
                      onChange={(e) => setRegEspecialidad(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-sexto"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear cuenta'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-[#6A8A70] mt-6">
          © 2026 Sexto Sistema · Plataforma de evaluación psicológica
        </p>
      </div>
    </div>
  )
}
