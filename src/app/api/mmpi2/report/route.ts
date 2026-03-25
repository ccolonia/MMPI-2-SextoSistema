import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Crear directorio temporal si no existe
    const tmpDir = '/home/z/my-project/tmp';
    const downloadDir = '/home/z/my-project/download';
    
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      await fs.mkdir(downloadDir, { recursive: true });
    } catch {
      // Directorios ya existen
    }
    
    // Generar nombres de archivo únicos
    const timestamp = Date.now();
    const inputFile = path.join(tmpDir, `mmpi2_data_${timestamp}.json`);
    const outputFile = path.join(downloadDir, `Informe_MMPI2_${timestamp}.pdf`);
    
    // Guardar datos de entrada
    await fs.writeFile(inputFile, JSON.stringify(body, null, 2), 'utf-8');
    
    // Ejecutar script de generación de PDF
    const scriptPath = '/home/z/my-project/scripts/generate_mmpi2_report.py';
    
    try {
      const { stdout, stderr } = await execAsync(
        `python3 "${scriptPath}" "${inputFile}" "${outputFile}"`,
        { timeout: 60000 }
      );
      
      if (stderr && !stderr.includes('PDF generado')) {
        console.error('Script stderr:', stderr);
      }
      
      // Verificar que el PDF se generó
      try {
        await fs.access(outputFile);
      } catch {
        throw new Error('El archivo PDF no se generó correctamente');
      }
      
      // Leer el PDF generado
      const pdfBuffer = await fs.readFile(outputFile);
      
      // Limpiar archivos temporales
      try {
        await fs.unlink(inputFile);
        // Mantener el PDF en download, pero también lo enviamos
      } catch {
        // Ignorar errores de limpieza
      }
      
      // Devolver el PDF
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Informe_MMPI2_${timestamp}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
      
    } catch (execError: any) {
      console.error('Error ejecutando script:', execError);
      throw new Error(`Error al generar PDF: ${execError.message}`);
    }
    
  } catch (error: any) {
    console.error('Error en API de reporte:', error);
    return NextResponse.json(
      { error: 'Error al generar el informe PDF', details: error.message },
      { status: 500 }
    );
  }
}
