import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateIndustryChangeApplicationDto } from './dto/create-industry-change-application.dto';
import { QueryIndustryChangeApplicationsDto } from './dto/query-industry-change-applications.dto';
import { ResidentRegisterService } from './resident-register.service';

@Controller('resident-register')
export class ResidentRegisterController {
  constructor(
    private readonly residentRegisterService: ResidentRegisterService,
  ) {}

  @Post('industry-change-applications')
  async createIndustryChangeApplication(
    @Body() createDto: CreateIndustryChangeApplicationDto,
    @Res() response: Response,
  ) {
    try {
      const application =
        await this.residentRegisterService.createIndustryChangeApplication(
          createDto,
        );
      return response.status(HttpStatus.CREATED).json(application);
    } catch (error) {
      if (error instanceof HttpException) {
        return response
          .status(error.getStatus() || HttpStatus.BAD_REQUEST)
          .json({
            message: error.message,
          });
      }
    }
  }

  @Get('industry-change-applications/:id')
  async getIndustryChangeApplicationById(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      const application =
        await this.residentRegisterService.getIndustryChangeApplicationById(id);
      return response.status(HttpStatus.OK).json(application);
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        return response.status(error.getStatus() || HttpStatus.NOT_FOUND).json({
          message: error.message,
        });
      }
    }
  }

  @Get('industry-change-applications')
  async queryIndustryChangeApplications(
    @Query() queryDto: QueryIndustryChangeApplicationsDto,
    @Res() response: Response,
  ) {
    try {
      const applications =
        await this.residentRegisterService.queryIndustryChangeApplications(
          queryDto,
        );
      return response.status(HttpStatus.OK).json({
        industryChangeApplications: applications,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return response
          .status(error.getStatus() || HttpStatus.BAD_REQUEST)
          .json({
            message: error.message,
          });
      }
    }
  }

  @Delete('industry-change-applications/:id')
  async deleteIndustryChangeApplication(
    @Param('id') id: string,
    @Res() response: Response,
  ) {
    try {
      await this.residentRegisterService.deleteIndustryChangeApplication(id);

      return response.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof HttpException) {
        return response
          .status(error.getStatus() || HttpStatus.BAD_REQUEST)
          .json({
            message: error.message,
          });
      }
    }
  }
}
