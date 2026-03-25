# MMPI-2 Sistema de Calificación e Interpretación

Sistema profesional para la calificación e interpretación del Inventario Multifásico de Personalidad de Minnesota-2 (MMPI-2), basado en la Guía de Sanz (2008) - Universidad de Buenos Aires.

## 🚀 Características

- **Dos modos de ingreso de datos:**
  - Manual: Ingreso directo de puntajes T
  - Cuestionario: Aplicación completa de 567 ítems

- **Importación de respuestas:** Carga masiva desde Excel/CSV
- **Análisis automático:** Interpretación de escalas clínicas y de validez
- **Informes profesionales:** Exportación a PDF
- **Persistencia:** Guardado de informes por paciente

## 📋 Formato de Excel para Importación

| Pregunta | Verdadero | Falso | No_Contesta |
|----------|-----------|-------|-------------|
| 1        | 1         | 0     | 0           |
| 2        | 0         | 1     | 0           |
| 3        | 0         | 0     | 1           |

Coloque **1** en la columna correspondiente a la respuesta elegida.

## 🛠️ Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/ccolonia/MMPI-2-SextoSistema.git
cd MMPI-2-SextoSistema

# Instalar dependencias
bun install

# Configurar base de datos
cp .env.example .env
# Edita .env con tus credenciales de base de datos
bun run db:push

# Iniciar servidor de desarrollo
bun run dev
```

## 🌐 Despliegue en Vercel

### Paso 1: Crear base de datos en Neon (Gratis)

1. Ve a https://neon.tech y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la **Connection string** (la que termina en `/neondb?sslmode=require`)

### Paso 2: Configurar Vercel

1. Ve a https://vercel.com e inicia sesión con GitHub
2. Importa el repositorio: `ccolonia/MMPI-2-SextoSistema`
3. En **Environment Variables**, agrega:
   - `DATABASE_URL` = `postgresql://...neon.tech/neondb?sslmode=require`
   - `DIRECT_DATABASE_URL` = `postgresql://...neon.tech/neondb?sslmode=require`
   *(Usa la misma URL para ambas variables)*

4. Haz clic en **Deploy**

### Paso 3: Verificar

1. Espera a que el build termine (2-3 minutos)
2. Visita tu aplicación: `https://tu-proyecto.vercel.app`
3. La base de datos se crea automáticamente durante el build

## 📊 Escalas Incluidas

### Escalas de Validez
- VRIN, TRIN, F, Fb, F(p), L, K

### Escalas Clínicas Básicas
1. Hs - Hipocondriasis
2. D - Depresión
3. Hy - Histeria
4. Pd - Desviación Psicopática
5. Mf - Masculinidad-Feminidad
6. Pa - Paranoia
7. Pt - Psicastenia
8. Sc - Esquizofrenia
9. Ma - Hipomanía
0. Si - Introversión Social

## 📚 Referencias

- Sanz, J. (2008). Guía para la interpretación del MMPI-2. Universidad de Buenos Aires.

## 📄 Licencia

MIT License
