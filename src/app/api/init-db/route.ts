import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Para PostgreSQL (Neon), usamos db.$push o simplemente verificamos la conexión
    // Las tablas se crean automáticamente con prisma db push durante el build
    
    // Verificar que la conexión funciona
    await db.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Conexión a base de datos exitosa. Las tablas se crean automáticamente durante el build.',
      note: 'Si ves este mensaje, la base de datos está configurada correctamente.'
    });

  } catch (error: any) {
    console.error('Error conectando a la base de datos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      hint: 'Asegúrate de configurar DATABASE_URL y DIRECT_DATABASE_URL en Vercel con una base de datos PostgreSQL (Neon recomendado)'
    }, { status: 500 });
  }
}
