// Script para migrar datos usando Prisma
// Este script extrae datos de la base de datos local y los inserta en la base de datos Docker

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Cliente para base de datos local 
const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL || "postgresql://postgres:1vaca@localhost:5432/ssmagt_bd?schema=public"
    }
  }
});

// Cliente para base de datos Docker
const prismaDocker = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DOCKER_DATABASE_URL || "postgresql://ssmagt_admin:SSMagt2024!SecurePass789@localhost:5432/ssmagt_production?schema=public"
    }
  }
});

interface MigrationLog {
  table: string;
  localCount: number;
  dockerCount: number;
  migrated: number;
  status: 'success' | 'error';
  error?: string;
}

async function migrateData() {
  console.log('🚀 Iniciando migración de datos...\n');
  
  const migrationLog: MigrationLog[] = [];
  
  try {
    // Verificar conexiones
    console.log('📡 Verificando conexiones...');
    await prismaLocal.$connect();
    await prismaDocker.$connect();
    console.log('✅ Conexiones establecidas\n');

    // Orden de migración (respetando dependencias)
    const migrations = [
      {
        name: 'rol',
        extract: () => prismaLocal.rol.findMany(),
        insert: (data: any[]) => prismaDocker.rol.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'estado',
        extract: () => prismaLocal.estado.findMany(),
        insert: (data: any[]) => prismaDocker.estado.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'tipo',
        extract: () => prismaLocal.tipo.findMany(),
        insert: (data: any[]) => prismaDocker.tipo.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'Instituto',
        extract: () => prismaLocal.instituto.findMany(),
        insert: (data: any[]) => prismaDocker.instituto.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'area',
        extract: () => prismaLocal.area.findMany(),
        insert: (data: any[]) => prismaDocker.area.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'usuario',
        extract: () => prismaLocal.usuario.findMany(),
        insert: (data: any[]) => prismaDocker.usuario.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'tarjeta',
        extract: () => prismaLocal.tarjeta.findMany(),
        insert: (data: any[]) => prismaDocker.tarjeta.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'solicitud_tarjeta',
        extract: () => prismaLocal.solicitud_tarjeta.findMany(),
        insert: (data: any[]) => prismaDocker.solicitud_tarjeta.createMany({ data, skipDuplicates: true })
      },
      {
        name: 'solicitud_despacho',
        extract: () => prismaLocal.solicitud_despacho.findMany(),
        insert: (data: any[]) => prismaDocker.solicitud_despacho.createMany({ data, skipDuplicates: true })
      }
    ];

    // Ejecutar migraciones
    for (const migration of migrations) {
      console.log(`📋 Migrando tabla: ${migration.name}`);
      
      try {
        // Extraer datos
        const localData = await migration.extract();
        const localCount = localData.length;
        
        if (localCount === 0) {
          console.log(`   ⚪ Tabla vacía, omitiendo...\n`);
          migrationLog.push({
            table: migration.name,
            localCount: 0,
            dockerCount: 0,
            migrated: 0,
            status: 'success'
          });
          continue;
        }

        console.log(`   📤 ${localCount} registros encontrados`);
        
        // Insertar datos
        const result = await migration.insert(localData);
        const migrated = result.count || localCount;
        
        // Verificar inserción
        const dockerCount = await (prismaDocker as any)[migration.name.toLowerCase()].count();
        
        console.log(`   ✅ ${migrated} registros migrados`);
        console.log(`   📊 Total en Docker: ${dockerCount}\n`);
        
        migrationLog.push({
          table: migration.name,
          localCount,
          dockerCount,
          migrated,
          status: 'success'
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
        migrationLog.push({
          table: migration.name,
          localCount: 0,
          dockerCount: 0,
          migrated: 0,
          status: 'error',
          error: error.message
        });
      }
    }

    // Resumen final
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log('═'.repeat(60));
    
    migrationLog.forEach(log => {
      const status = log.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${log.table.padEnd(20)} | Local: ${log.localCount.toString().padStart(4)} | Docker: ${log.dockerCount.toString().padStart(4)} | Migrados: ${log.migrated.toString().padStart(4)}`);
    });
    
    console.log('═'.repeat(60));
    
    const totalSuccess = migrationLog.filter(log => log.status === 'success').length;
    const totalErrors = migrationLog.filter(log => log.status === 'error').length;
    const totalMigrated = migrationLog.reduce((sum, log) => sum + log.migrated, 0);
    
    console.log(`\n🎯 Resultado: ${totalSuccess} exitosas, ${totalErrors} errores`);
    console.log(`📈 Total de registros migrados: ${totalMigrated}`);
    
    // Guardar log de migración
    fs.writeFileSync('migration-log.json', JSON.stringify(migrationLog, null, 2));
    console.log(`💾 Log guardado en: migration-log.json`);

  } catch (error) {
    console.error('💥 Error general:', error);
  } finally {
    await prismaLocal.$disconnect();
    await prismaDocker.$disconnect();
    console.log('\n🔌 Conexiones cerradas');
  }
}

// Ejecutar migración
migrateData()
  .then(() => console.log('\n🎉 Migración completada!'))
  .catch(console.error);