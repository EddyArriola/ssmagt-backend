// Cloudflare Workers adapter para NestJS
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ExecutionContext } from '@nestjs/common';

// Tipos para Cloudflare Workers
interface Env {
  DB: IDBDatabase;
  JWT_SECRET: string;
}

// Función principal del Worker
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Configurar variables de entorno para NestJS
      process.env.DATABASE_URL = 'sqlite://memory'; // D1 se maneja diferente
      process.env.JWT_SECRET = env.JWT_SECRET;
      process.env.NODE_ENV = 'production';

      // Crear la aplicación NestJS
      const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
      });

      // Configurar CORS
      app.enableCors({
        origin: [
          'https://tu-dominio.pages.dev',
          'https://tu-dominio-custom.com',
          'http://localhost:4200',
          'http://localhost:8080'
        ],
        credentials: true,
      });

      // Configurar prefijo global
      app.setGlobalPrefix('api');

      await app.init();

      // Adaptar Request de Cloudflare a Express-like
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      // Crear objeto req/res compatible
      const req = {
        method,
        url: path,
        headers: Object.fromEntries(request.headers.entries()),
        body: await request.text(),
        query: Object.fromEntries(url.searchParams.entries()),
      };

      // Procesar la solicitud con NestJS
      const httpAdapter = app.getHttpAdapter();
      
      // Simular respuesta Express
      let statusCode = 200;
      let responseHeaders = {};
      let responseBody = '';

      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          responseBody = JSON.stringify(data);
          responseHeaders['Content-Type'] = 'application/json';
          return res;
        },
        send: (data: any) => {
          responseBody = data;
          return res;
        },
        setHeader: (name: string, value: string) => {
          responseHeaders[name] = value;
          return res;
        },
        end: () => {
          // No hacer nada, se maneja al final
        }
      };

      // Procesar con NestJS
      await httpAdapter.reply(res, responseBody, statusCode);

      // Retornar Response de Cloudflare
      return new Response(responseBody, {
        status: statusCode,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};