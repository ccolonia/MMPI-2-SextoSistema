import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import os from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 })
    }
    
    // Guardar archivo temporalmente
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `respuestas_${Date.now()}.xlsx`)
    
    fs.writeFileSync(tempFilePath, buffer)
    
    try {
      // Ejecutar script Python para procesar el archivo
      const scriptPath = path.join(process.cwd(), 'scripts', 'import_respuestas.py')
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" "${tempFilePath}"`)
      
      // Limpiar archivo temporal
      fs.unlinkSync(tempFilePath)
      
      if (stderr && !stdout) {
        return NextResponse.json({ error: stderr }, { status: 500 })
      }
      
      const result = JSON.parse(stdout.trim())
      
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
      
      return NextResponse.json(result)
    } catch (processError: any) {
      // Limpiar archivo temporal si existe
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath)
      }
      throw processError
    }
  } catch (error: any) {
    console.error('Error procesando archivo:', error)
    return NextResponse.json({ error: error.message || 'Error al procesar el archivo' }, { status: 500 })
  }
}
