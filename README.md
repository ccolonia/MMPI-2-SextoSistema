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
git clone https://github.com/TU_USUARIO/mmpi2-sistema.git
cd mmpi2-sistema

# Instalar dependencias
bun install

# Configurar base de datos
cp .env.example .env
bun run db:push

# Iniciar servidor de desarrollo
bun run dev
```

## 🌐 Despliegue en Vercel

1. Fork este repositorio
2. Conecta tu cuenta de Vercel con GitHub
3. Importa el proyecto desde Vercel
4. Configura las variables de entorno:
   - `DATABASE_URL`: URL de tu base de datos (recomendado: Turso, Neon, o Vercel Postgres)
5. ¡Despliega!

### Recomendación para Base de Datos

Para producción en Vercel, se recomienda usar una base de datos persistente:

- **Turso** (SQLite compatible, gratis): https://turso.tech
- **Neon** (PostgreSQL serverless, gratis): https://neon.tech
- **Vercel Postgres**: Disponible en el dashboard de Vercel

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
