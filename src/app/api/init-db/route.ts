import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ejecutar raw SQL para crear las tablas
    // Esto es necesario porque Turso/libSQL no soporta prisma db push directamente
    
    await prisma.$executeRawUnsafe(`
      -- Tabla de preguntas MMPI-2
      CREATE TABLE IF NOT EXISTS PreguntaMMPI2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER UNIQUE,
        texto TEXT,
        orden INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- Tabla de evaluados/pacientes
      CREATE TABLE IF NOT EXISTS Evaluado (
        id TEXT PRIMARY KEY,
        nombre TEXT,
        edad INTEGER,
        sexo TEXT,
        nivelEduc TEXT,
        ocupacion TEXT,
        motivoConsulta TEXT,
        contextoEval TEXT,
        evaluador TEXT,
        institucion TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- Tabla de protocolos MMPI-2
      CREATE TABLE IF NOT EXISTS ProtocoloMMPI2 (
        id TEXT PRIMARY KEY,
        evaluadoId TEXT,
        fechaEvaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        completado INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (evaluadoId) REFERENCES Evaluado(id)
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- Tabla de respuestas individuales
      CREATE TABLE IF NOT EXISTS Respuesta (
        id TEXT PRIMARY KEY,
        protocoloId TEXT NOT NULL,
        preguntaId INTEGER NOT NULL,
        verdadero INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (protocoloId) REFERENCES ProtocoloMMPI2(id),
        FOREIGN KEY (preguntaId) REFERENCES PreguntaMMPI2(id),
        UNIQUE(protocoloId, preguntaId)
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- Tabla de puntajes brutos
      CREATE TABLE IF NOT EXISTS PuntajeBruto (
        id TEXT PRIMARY KEY,
        protocoloId TEXT UNIQUE,
        omisiones INTEGER DEFAULT 0,
        lBruto INTEGER DEFAULT 0,
        fBruto INTEGER DEFAULT 0,
        kBruto INTEGER DEFAULT 0,
        fbBruto INTEGER DEFAULT 0,
        fpBruto INTEGER DEFAULT 0,
        vrinBruto INTEGER DEFAULT 0,
        trinBruto INTEGER DEFAULT 0,
        dsBruto INTEGER DEFAULT 0,
        dsRBruto INTEGER DEFAULT 0,
        sBruto INTEGER DEFAULT 0,
        sdBruto INTEGER DEFAULT 0,
        soBruto INTEGER DEFAULT 0,
        hsBruto INTEGER DEFAULT 0,
        dBruto INTEGER DEFAULT 0,
        hyBruto INTEGER DEFAULT 0,
        pdBruto INTEGER DEFAULT 0,
        mfBruto INTEGER DEFAULT 0,
        paBruto INTEGER DEFAULT 0,
        ptBruto INTEGER DEFAULT 0,
        scBruto INTEGER DEFAULT 0,
        maBruto INTEGER DEFAULT 0,
        siBruto INTEGER DEFAULT 0,
        aBruto INTEGER DEFAULT 0,
        rBruto INTEGER DEFAULT 0,
        esBruto INTEGER DEFAULT 0,
        macRBruto INTEGER DEFAULT 0,
        ohBruto INTEGER DEFAULT 0,
        doBruto INTEGER DEFAULT 0,
        reBruto INTEGER DEFAULT 0,
        mtBruto INTEGER DEFAULT 0,
        gmBruto INTEGER DEFAULT 0,
        gfBruto INTEGER DEFAULT 0,
        pkBruto INTEGER DEFAULT 0,
        psBruto INTEGER DEFAULT 0,
        mdsBruto INTEGER DEFAULT 0,
        apsBruto INTEGER DEFAULT 0,
        aasBruto INTEGER DEFAULT 0,
        anxBruto INTEGER DEFAULT 0,
        frsBruto INTEGER DEFAULT 0,
        obsBruto INTEGER DEFAULT 0,
        depBruto INTEGER DEFAULT 0,
        heaBruto INTEGER DEFAULT 0,
        bizBruto INTEGER DEFAULT 0,
        angBruto INTEGER DEFAULT 0,
        cynBruto INTEGER DEFAULT 0,
        aspBruto INTEGER DEFAULT 0,
        tpaBruto INTEGER DEFAULT 0,
        lseBruto INTEGER DEFAULT 0,
        sodBruto INTEGER DEFAULT 0,
        famBruto INTEGER DEFAULT 0,
        wrkBruto INTEGER DEFAULT 0,
        trtBruto INTEGER DEFAULT 0,
        d1Bruto INTEGER DEFAULT 0,
        d2Bruto INTEGER DEFAULT 0,
        d3Bruto INTEGER DEFAULT 0,
        d4Bruto INTEGER DEFAULT 0,
        d5Bruto INTEGER DEFAULT 0,
        hy1Bruto INTEGER DEFAULT 0,
        hy2Bruto INTEGER DEFAULT 0,
        hy3Bruto INTEGER DEFAULT 0,
        hy4Bruto INTEGER DEFAULT 0,
        hy5Bruto INTEGER DEFAULT 0,
        pd1Bruto INTEGER DEFAULT 0,
        pd2Bruto INTEGER DEFAULT 0,
        pd3Bruto INTEGER DEFAULT 0,
        pd4Bruto INTEGER DEFAULT 0,
        pd5Bruto INTEGER DEFAULT 0,
        pa1Bruto INTEGER DEFAULT 0,
        pa2Bruto INTEGER DEFAULT 0,
        pa3Bruto INTEGER DEFAULT 0,
        sc1Bruto INTEGER DEFAULT 0,
        sc2Bruto INTEGER DEFAULT 0,
        sc3Bruto INTEGER DEFAULT 0,
        sc4Bruto INTEGER DEFAULT 0,
        sc5Bruto INTEGER DEFAULT 0,
        sc6Bruto INTEGER DEFAULT 0,
        ma1Bruto INTEGER DEFAULT 0,
        ma2Bruto INTEGER DEFAULT 0,
        ma3Bruto INTEGER DEFAULT 0,
        ma4Bruto INTEGER DEFAULT 0,
        si1Bruto INTEGER DEFAULT 0,
        si2Bruto INTEGER DEFAULT 0,
        si3Bruto INTEGER DEFAULT 0,
        dOBruto INTEGER DEFAULT 0,
        dSBruto INTEGER DEFAULT 0,
        hyOBruto INTEGER DEFAULT 0,
        hySBruto INTEGER DEFAULT 0,
        pdOBruto INTEGER DEFAULT 0,
        pdSBruto INTEGER DEFAULT 0,
        paOBruto INTEGER DEFAULT 0,
        paSBruto INTEGER DEFAULT 0,
        maOBruto INTEGER DEFAULT 0,
        maSBruto INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (protocoloId) REFERENCES ProtocoloMMPI2(id)
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- Tabla de puntajes T
      CREATE TABLE IF NOT EXISTS PuntajeT (
        id TEXT PRIMARY KEY,
        protocoloId TEXT UNIQUE,
        lT INTEGER DEFAULT 0,
        fT INTEGER DEFAULT 0,
        kT INTEGER DEFAULT 0,
        fbT INTEGER DEFAULT 0,
        fpT INTEGER DEFAULT 0,
        vrinT INTEGER DEFAULT 0,
        trinT INTEGER DEFAULT 0,
        hsT INTEGER DEFAULT 0,
        dT INTEGER DEFAULT 0,
        hyT INTEGER DEFAULT 0,
        pdT INTEGER DEFAULT 0,
        mfT INTEGER DEFAULT 0,
        paT INTEGER DEFAULT 0,
        ptT INTEGER DEFAULT 0,
        scT INTEGER DEFAULT 0,
        maT INTEGER DEFAULT 0,
        siT INTEGER DEFAULT 0,
        aT INTEGER DEFAULT 0,
        rT INTEGER DEFAULT 0,
        esT INTEGER DEFAULT 0,
        macRT INTEGER DEFAULT 0,
        ohT INTEGER DEFAULT 0,
        doT INTEGER DEFAULT 0,
        reT INTEGER DEFAULT 0,
        mtT INTEGER DEFAULT 0,
        gmT INTEGER DEFAULT 0,
        gfT INTEGER DEFAULT 0,
        pkT INTEGER DEFAULT 0,
        psT INTEGER DEFAULT 0,
        mdsT INTEGER DEFAULT 0,
        apsT INTEGER DEFAULT 0,
        aasT INTEGER DEFAULT 0,
        anxT INTEGER DEFAULT 0,
        frsT INTEGER DEFAULT 0,
        obsT INTEGER DEFAULT 0,
        depT INTEGER DEFAULT 0,
        heaT INTEGER DEFAULT 0,
        bizT INTEGER DEFAULT 0,
        angT INTEGER DEFAULT 0,
        cynT INTEGER DEFAULT 0,
        aspT INTEGER DEFAULT 0,
        tpaT INTEGER DEFAULT 0,
        lseT INTEGER DEFAULT 0,
        sodT INTEGER DEFAULT 0,
        famT INTEGER DEFAULT 0,
        wrkT INTEGER DEFAULT 0,
        trtT INTEGER DEFAULT 0,
        d1T INTEGER DEFAULT 0,
        d2T INTEGER DEFAULT 0,
        d3T INTEGER DEFAULT 0,
        d4T INTEGER DEFAULT 0,
        d5T INTEGER DEFAULT 0,
        hy1T INTEGER DEFAULT 0,
        hy2T INTEGER DEFAULT 0,
        hy3T INTEGER DEFAULT 0,
        hy4T INTEGER DEFAULT 0,
        hy5T INTEGER DEFAULT 0,
        pd1T INTEGER DEFAULT 0,
        pd2T INTEGER DEFAULT 0,
        pd3T INTEGER DEFAULT 0,
        pd4T INTEGER DEFAULT 0,
        pd5T INTEGER DEFAULT 0,
        pa1T INTEGER DEFAULT 0,
        pa2T INTEGER DEFAULT 0,
        pa3T INTEGER DEFAULT 0,
        sc1T INTEGER DEFAULT 0,
        sc2T INTEGER DEFAULT 0,
        sc3T INTEGER DEFAULT 0,
        sc4T INTEGER DEFAULT 0,
        sc5T INTEGER DEFAULT 0,
        sc6T INTEGER DEFAULT 0,
        ma1T INTEGER DEFAULT 0,
        ma2T INTEGER DEFAULT 0,
        ma3T INTEGER DEFAULT 0,
        ma4T INTEGER DEFAULT 0,
        si1T INTEGER DEFAULT 0,
        si2T INTEGER DEFAULT 0,
        si3T INTEGER DEFAULT 0,
        dOT INTEGER DEFAULT 0,
        dST INTEGER DEFAULT 0,
        hyOT INTEGER DEFAULT 0,
        hyST INTEGER DEFAULT 0,
        pdOT INTEGER DEFAULT 0,
        pdST INTEGER DEFAULT 0,
        paOT INTEGER DEFAULT 0,
        paST INTEGER DEFAULT 0,
        maOT INTEGER DEFAULT 0,
        maST INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (protocoloId) REFERENCES ProtocoloMMPI2(id)
      );
    `);

    await prisma.$executeRawUnsafe(`
      -- Tabla de informes guardados
      CREATE TABLE IF NOT EXISTS InformeMMPI2 (
        id TEXT PRIMARY KEY,
        nombreEvaluado TEXT,
        edad INTEGER,
        sexo TEXT,
        contextoEvaluacion TEXT,
        motivoConsulta TEXT,
        fechaEvaluacion TEXT,
        evaluador TEXT,
        institucion TEXT,
        omisiones INTEGER DEFAULT 0,
        vrint INTEGER DEFAULT 50,
        trint INTEGER DEFAULT 50,
        fBruto INTEGER DEFAULT 0,
        fT INTEGER DEFAULT 50,
        fbT INTEGER DEFAULT 50,
        fpBruto INTEGER DEFAULT 0,
        f_K INTEGER DEFAULT 0,
        lBruto INTEGER DEFAULT 0,
        kBruto INTEGER DEFAULT 0,
        hsT INTEGER DEFAULT 50,
        dT INTEGER DEFAULT 50,
        hyT INTEGER DEFAULT 50,
        pdT INTEGER DEFAULT 50,
        mfT INTEGER DEFAULT 50,
        paT INTEGER DEFAULT 50,
        ptT INTEGER DEFAULT 50,
        scT INTEGER DEFAULT 50,
        maT INTEGER DEFAULT 50,
        siT INTEGER DEFAULT 50,
        analysisResult TEXT,
        pdfPath TEXT,
        notas TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: '✅ Base de datos inicializada correctamente',
      tables: ['PreguntaMMPI2', 'Evaluado', 'ProtocoloMMPI2', 'Respuesta', 'PuntajeBruto', 'PuntajeT', 'InformeMMPI2']
    });

  } catch (error: any) {
    console.error('Error inicializando base de datos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
