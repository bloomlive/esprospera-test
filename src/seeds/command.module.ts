import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandModule } from 'nestjs-command';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resident, ResidentSchema } from '../models/resident.model';
import {
  IndustryChangeApplication,
  IndustryChangeApplicationSchema,
} from '../models/industry-change-application.model';
import { ResidentSeed } from './resident.seed';
import databaseConfig from '../config/database.config';
import { IndustryChangeApplicationSeed } from './industry-change-application.seed';

@Module({
  imports: [
    CommandModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      {
        name: IndustryChangeApplication.name,
        schema: IndustryChangeApplicationSchema,
      },
    ]),
  ],
  providers: [ResidentSeed, IndustryChangeApplicationSeed],
  exports: [ResidentSeed, IndustryChangeApplicationSeed],
})
export class SeedModule {}
