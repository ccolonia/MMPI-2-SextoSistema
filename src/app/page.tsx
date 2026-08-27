import { redirect } from 'next/navigation'

// La raíz redirige al dashboard
// Si no está logueado, el dashboard lo manda a /login
export default function RootPage() {
  redirect('/dashboard')
}
