import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { SeedModule } from './seeds/command.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const commandService = app.select(CommandModule).get(CommandService);

    await commandService.exec();
    console.log('Seed commands executed successfully');

    await app.close();
  } catch (error) {
    console.error('Error running seed commands:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap();
