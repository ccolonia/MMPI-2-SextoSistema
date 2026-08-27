import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'sexto-sistema-mmpi2-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  rol: string
  nombre: string
}

/**
 * Hashea una contraseña con bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Genera un JWT token para el usuario
 */
export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 días
    .setIssuer('sexto-sistema-mmpi2')
    .sign(secret)
}

/**
 * Verifica un JWT token y retorna el payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'sexto-sistema-mmpi2',
    })
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Obtiene el usuario actual desde el request (cookie)
 */
export async function getCurrentUser(request: Request): Promise<JWTPayload | null> {
  try {
    // Intentar obtener el token de la cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...val] = c.split('=')
        return [key, val.join('=')]
      })
    )

    const token = cookies['auth-token']
    if (!token) return null

    return verifyToken(token)
  } catch {
    return null
  }
}

/**
 * Validación de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validación de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  return true
}
