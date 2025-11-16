const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarDatos() {
  try {
    console.log('=== VERIFICACION DE DATOS EN DOCKER ===');
    
    const tablas = ['rol', 'estado', 'tipo', 'instituto', 'area', 'usuario', 'tarjeta', 'solicitud_tarjeta', 'solicitud_despacho'];
    
    for (const tabla of tablas) {
      try {
        const count = await prisma[tabla].count();
        console.log(`${tabla}: ${count} registros`);
        
        if (count > 0) {
          const sample = await prisma[tabla].findFirst();
          console.log(`  Ejemplo: ${JSON.stringify(sample, null, 2).substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`${tabla}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDatos();