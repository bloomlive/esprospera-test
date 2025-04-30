import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  IndustryChangeApplication,
  IndustryChangeApplicationSchema,
} from '../../models/industry-change-application.model';
import { Resident, ResidentSchema } from '../../models/resident.model';
import { ResidentRegisterController } from './resident-register.controller';
import { ResidentRegisterService } from './resident-register.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resident.name, schema: ResidentSchema },
      {
        name: IndustryChangeApplication.name,
        schema: IndustryChangeApplicationSchema,
      },
    ]),
  ],
  controllers: [ResidentRegisterController],
  providers: [ResidentRegisterService],
  exports: [ResidentRegisterService],
})
export class ResidentRegisterModule {}
