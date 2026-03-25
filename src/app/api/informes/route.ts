import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// GET - Listar todos los informes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (id) {
      // Obtener un informe específico
      const informe = await prisma.$queryRaw`
        SELECT * FROM InformeMMPI2 WHERE id = ${id}
      `
      return NextResponse.json(informe)
    }
    
    // Listar todos los informes ordenados por fecha descendente
    const informes = await prisma.$queryRaw`
      SELECT id, nombreEvaluado, fechaEvaluacion, evaluador, createdAt 
      FROM InformeMMPI2 
      ORDER BY createdAt DESC
    `
    
    return NextResponse.json(informes)
  } catch (error) {
    console.error('Error obteniendo informes:', error)
    return NextResponse.json({ error: 'Error al obtener informes' }, { status: 500 })
  }
}

// POST - Guardar nuevo informe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = uuidv4()
    
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
    
    await prisma.$executeRaw`
      INSERT INTO InformeMMPI2 (
        id, nombreEvaluado, edad, sexo, contextoEvaluacion, motivoConsulta,
        fechaEvaluacion, evaluador, institucion,
        omisiones, vrint, trint, fBruto, fT, fbT, fpBruto, f_K, lBruto, kBruto,
        hsT, dT, hyT, pdT, mfT, paT, ptT, scT, maT, siT,
        analysisResult, createdAt, updatedAt
      ) VALUES (
        ${id},
        ${demograficos?.nombreEvaluado || null},
        ${demograficos?.edad || null},
        ${demograficos?.sexo || null},
        ${demograficos?.contextoEvaluacion || null},
        ${demograficos?.motivoConsulta || null},
        ${demograficos?.fechaEvaluacion || null},
        ${demograficos?.evaluador || null},
        ${demograficos?.institucion || null},
        ${omisiones || 0},
        ${vrint || 50},
        ${trint || 50},
        ${fBruto || 0},
        ${fT || 50},
        ${fbT || 50},
        ${fpBruto || 0},
        ${f_K || 0},
        ${lBruto || 0},
        ${kBruto || 0},
        ${escalasClinicas?.Hs || 50},
        ${escalasClinicas?.D || 50},
        ${escalasClinicas?.Hy || 50},
        ${escalasClinicas?.Pd || 50},
        ${escalasClinicas?.Mf || 50},
        ${escalasClinicas?.Pa || 50},
        ${escalasClinicas?.Pt || 50},
        ${escalasClinicas?.Sc || 50},
        ${escalasClinicas?.Ma || 50},
        ${escalasClinicas?.Si || 50},
        ${JSON.stringify(analysisResult)},
        datetime('now'),
        datetime('now')
      )
    `
    
    return NextResponse.json({ 
      success: true, 
      id,
      message: 'Informe guardado correctamente' 
    })
  } catch (error) {
    console.error('Error guardando informe:', error)
    return NextResponse.json({ error: 'Error al guardar el informe' }, { status: 500 })
  }
}

// DELETE - Eliminar informe
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    await prisma.$executeRaw`
      DELETE FROM InformeMMPI2 WHERE id = ${id}
    `
    
    return NextResponse.json({ success: true, message: 'Informe eliminado' })
  } catch (error) {
    console.error('Error eliminando informe:', error)
    return NextResponse.json({ error: 'Error al eliminar el informe' }, { status: 500 })
  }
}
