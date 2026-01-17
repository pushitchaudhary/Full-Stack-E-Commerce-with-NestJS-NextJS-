import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

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


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error starting server:', err);
  process.exit(1);
});
