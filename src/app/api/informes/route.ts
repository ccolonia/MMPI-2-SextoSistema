import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - Listar informes del profesional logueado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (id) {
      // Obtener un informe específico (verificando ownership)
      const informe = await db.informeMMPI2.findFirst({
        where: {
          id,
          profesionalId: user.userId,
        }
      })

      if (!informe) {
        return NextResponse.json({ error: 'Informe no encontrado' }, { status: 404 })
      }

      return NextResponse.json(informe)
    }

    // Listar todos los informes DEL PROFESIONAL LOGUEADO
    const informes = await db.informeMMPI2.findMany({
      where: {
        profesionalId: user.userId,
      },
      select: {
        id: true,
        nombreEvaluado: true,
        fechaEvaluacion: true,
        evaluador: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return NextResponse.json(informes)
  } catch (error) {
    console.error('Error obteniendo informes:', error)
    return NextResponse.json({ error: 'Error al obtener informes' }, { status: 500 })
  }
}

// POST - Guardar nuevo informe (asociado al profesional logueado)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()

    const {
      demograficos,
      omisiones,
      vrint,
      trint,
      fBruto,
      fT,
      fbT,
      fpBruto,
      f_K,
      lBruto,
      kBruto,
      escalasClinicas,
      analysisResult
    } = body

    // Crear informe asociado al profesional logueado
    const informe = await db.informeMMPI2.create({
      data: {
        profesionalId: user.userId,
        nombreEvaluado: demograficos?.nombreEvaluado || null,
        edad: demograficos?.edad || null,
        sexo: demograficos?.sexo || null,
        contextoEvaluacion: demograficos?.contextoEvaluacion || null,
        motivoConsulta: demograficos?.motivoConsulta || null,
        fechaEvaluacion: demograficos?.fechaEvaluacion || null,
        evaluador: demograficos?.evaluador || null,
        institucion: demograficos?.institucion || null,
        omisiones: omisiones || 0,
        vrint: vrint || 50,
        trint: trint || 50,
        fBruto: fBruto || 0,
        fT: fT || 50,
        fbT: fbT || 50,
        fpBruto: fpBruto || 0,
        f_K: f_K || 0,
        lBruto: lBruto || 0,
        kBruto: kBruto || 0,
        hsT: escalasClinicas?.Hs || 50,
        dT: escalasClinicas?.D || 50,
        hyT: escalasClinicas?.Hy || 50,
        pdT: escalasClinicas?.Pd || 50,
        mfT: escalasClinicas?.Mf || 50,
        paT: escalasClinicas?.Pa || 50,
        ptT: escalasClinicas?.Pt || 50,
        scT: escalasClinicas?.Sc || 50,
        maT: escalasClinicas?.Ma || 50,
        siT: escalasClinicas?.Si || 50,
        analysisResult: JSON.stringify(analysisResult),
      },
      select: {
        id: true,
        nombreEvaluado: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      id: informe.id,
      message: 'Informe guardado correctamente'
    })
  } catch (error: any) {
    console.error('Error guardando informe:', error)
    return NextResponse.json({
      error: 'Error al guardar el informe',
      details: error.message
    }, { status: 500 })
  }
}

// DELETE - Eliminar informe (verificando ownership)
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Verificar que el informe pertenece al profesional
    const informe = await db.informeMMPI2.findFirst({
      where: {
        id,
        profesionalId: user.userId,
      }
    })

    if (!informe) {
      return NextResponse.json({ error: 'Informe no encontrado o sin permisos' }, { status: 404 })
    }

    await db.informeMMPI2.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Informe eliminado' })
  } catch (error) {
    console.error('Error eliminando informe:', error)
    return NextResponse.json({ error: 'Error al eliminar el informe' }, { status: 500 })
  }
}
