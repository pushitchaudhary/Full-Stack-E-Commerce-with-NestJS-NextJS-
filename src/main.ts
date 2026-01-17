import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { METHODS } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set a global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Set Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true }, // Enable implicit type conversion
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:3000',
    credentials: true,
    method : ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE','OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization','Accept','Origin','X-Requested-With','Access-Control-Allow-Origin'],
  });


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error starting server:', err);
  process.exit(1);
});
