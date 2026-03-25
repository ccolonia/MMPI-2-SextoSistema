import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const filePath = body.filePath || '/home/z/my-project/upload/MMPI-2_VS_BB_terceros.xls'
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 400 })
    }
    
    // Ejecutar el script de Python
    const scriptPath = path.join(process.cwd(), 'scripts', 'read_mmpi2_excel.py')
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${filePath}"`)
    
    if (stderr && !stdout) {
      return NextResponse.json({ error: stderr }, { status: 500 })
    }
    
    const result = JSON.parse(stdout.trim())
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing Excel:', error)
    return NextResponse.json({ error: 'Error procesando archivo Excel' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const defaultPath = '/home/z/my-project/upload/MMPI-2_VS_BB_terceros.xls'
    
    if (!fs.existsSync(defaultPath)) {
      return NextResponse.json({ error: 'Archivo predeterminado no encontrado' }, { status: 404 })
    }
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'read_mmpi2_excel.py')
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${defaultPath}"`)
    
    if (stderr && !stdout) {
      return NextResponse.json({ error: stderr }, { status: 500 })
    }
    
    const result = JSON.parse(stdout.trim())
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error loading default Excel:', error)
    return NextResponse.json({ error: 'Error cargando archivo Excel' }, { status: 500 })
  }
}
