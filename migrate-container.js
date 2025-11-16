const { PrismaClient } = require('@prisma/client');

const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:1vaca@host.docker.internal:5432/ssmagt_bd?schema=public"
    }
  }
});

const prismaDocker = new PrismaClient();

async function migrateDataInContainer() {
  try {
    console.log('🚀 Iniciando migración desde contenedor...');
    
    await prismaLocal.$connect();
    await prismaDocker.$connect();
    console.log('✅ Conexiones establecidas');

    const tables = ['rol', 'estado', 'tipo', 'area', 'instituto', 'usuario', 'solicitud_tarjeta', 'tarjeta', 'solicitud_despacho'];
    let totalMigrated = 0;

    for (const table of tables) {
      try {
        console.log(`📋 Migrando ${table}...`);
        
        const data = await prismaLocal[table].findMany();
        
        if (data.length === 0) {
          console.log(`   ⚪ ${table}: sin datos`);
          continue;
        }

        const result = await prismaDocker[table].createMany({
          data: data,
          skipDuplicates: true
        });
        
        console.log(`   ✅ ${table}: ${result.count || data.length} registros migrados`);
        totalMigrated += result.count || data.length;
        
      } catch (error) {
        console.log(`   ❌ Error en ${table}: ${error.message}`);
      }
    }

    console.log(`🎯 Total migrado: ${totalMigrated} registros`);

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prismaLocal.$disconnect();
    await prismaDocker.$disconnect();
  }
}

migrateDataInContainer();