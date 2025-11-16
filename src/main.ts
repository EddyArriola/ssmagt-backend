import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configurado: permite orígenes concretos y headers necesarios
  const allowedOrigins = [
    'http://localhost:4200',       // frontend local dev
    'http://localhost:8080',       // frontend Docker production
    'http://localhost:80',         // frontend Docker (puerto 80)
    'http://frontend:80',          // comunicación entre contenedores
    'https://strand-polished-programme-done.trycloudflare.com',    // producción externa
    'https://ssmagt-frontend-hccab8eshbc0crg7.canadacentral-01.azurewebsites.net'  // Azure frontend
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // permitir peticiones sin origin (ej. curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Origin not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true,      // habilitar si usas cookies o withCredentials
    maxAge: 600             // cache preflight en segundos (opcional)
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 🔥 Esto es clave
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();