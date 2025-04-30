import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const shutdown = async () => {
    console.log('Closing application...');
    await app.close();
    console.log('Application closed');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  const server = await app.listen(process.env.PORT ?? 3000);

  server.setTimeout(3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
