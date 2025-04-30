import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  IndustryChangeApplication,
  IndustryChangeApplicationStatus,
  IndustryInfo,
} from '../../models/industry-change-application.model';
import { ObjectStatus, Resident } from '../../models/resident.model';
import { CreateIndustryChangeApplicationDto } from './dto/create-industry-change-application.dto';
import { QueryIndustryChangeApplicationsDto } from './dto/query-industry-change-applications.dto';

@Injectable()
export class ResidentRegisterService {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(IndustryChangeApplication.name)
    private industryChangeApplicationModel: Model<IndustryChangeApplication>,
  ) {}

  async createIndustryChangeApplication(
    createDto: CreateIndustryChangeApplicationDto,
  ): Promise<IndustryChangeApplication> {
    const resident = await this.residentModel.findOne({
      sub: createDto.residentSub,
      status: 'ACTIVE',
      objectStatus: ObjectStatus.CURRENT,
    });

    if (!resident) {
      throw new HttpException(
        'Resident not found or not active',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if there are actual changes
    let hasChanges = false;

    // Always check if willWorkInPhysicalJurisdiction is changing
    if (
      resident.willWorkInPhysicalJurisdiction !==
      createDto.willWorkInPhysicalJurisdiction
    ) {
      hasChanges = true;
    } else {
      // Same willWorkInPhysicalJurisdiction status
      if (createDto.willWorkInPhysicalJurisdiction) {
        // If true, check industry & regulatory elections
        if (
          resident.industry !== createDto.industry ||
          resident.regulatoryElection !== createDto.regulatoryElection
        ) {
          hasChanges = true;
        }
      }
      // If both are false, there's no change as industry data doesn't matter
    }

    // If nothing is changing, return error
    if (!hasChanges) {
      throw new HttpException(
        'Requested industry information is the same as current information',
        HttpStatus.BAD_REQUEST,
      );
    }

    const status = createDto.willWorkInPhysicalJurisdiction
      ? IndustryChangeApplicationStatus.IN_REVIEW
      : IndustryChangeApplicationStatus.APPROVED;

    const current: IndustryInfo = {
      willWorkInPhysicalJurisdiction: resident.willWorkInPhysicalJurisdiction,
      industry: resident.industry,
      regulatoryElection: resident.regulatoryElection,
      regulatoryElectionSub: resident.regulatoryElectionSub,
    };

    const requested: IndustryInfo = {
      willWorkInPhysicalJurisdiction: createDto.willWorkInPhysicalJurisdiction,
      industry: createDto.industry,
      regulatoryElection: undefined,
      regulatoryElectionSub: undefined,
    };

    if (createDto.regulatoryElection) {
      requested.regulatoryElection = createDto.regulatoryElection;
      requested.regulatoryElectionSub = createDto.regulatoryElectionSub;
    }

    const application = new this.industryChangeApplicationModel({
      residentSub: createDto.residentSub,
      current,
      requested,
      status,
      submittedAt: new Date(),
      objectStatus: ObjectStatus.CURRENT,
      createdBy: 'system',
      updatedBy: 'system',
    });

    if (status === IndustryChangeApplicationStatus.APPROVED) {
      await this.residentModel.updateOne(
        { sub: createDto.residentSub },
        {
          willWorkInPhysicalJurisdiction:
            createDto.willWorkInPhysicalJurisdiction,
          industry: createDto.industry,
          regulatoryElection: createDto.regulatoryElection,
          regulatoryElectionSub: createDto.regulatoryElectionSub,
          updatedBy: 'system',
        },
      );

      application.decision = {
        decidedAt: new Date(),
        decidedBy: 'Automatic',
      };
    }

    return await application.save();
  }

  async getIndustryChangeApplicationById(
    id: string,
  ): Promise<IndustryChangeApplication> {
    // Validate ObjectId format before querying
    if (!isValidObjectId(id)) {
      throw new HttpException(
        'Invalid application ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const application = await this.industryChangeApplicationModel.findOne({
      _id: id,
      objectStatus: ObjectStatus.CURRENT,
    });

    if (!application) {
      throw new HttpException(
        'Industry change application not found',
        HttpStatus.NOT_FOUND,
      );
    }

    return application;
  }

  async queryIndustryChangeApplications(
    queryDto: QueryIndustryChangeApplicationsDto,
  ): Promise<IndustryChangeApplication[]> {
    // Validate required parameters
    if (!queryDto.residentSub) {
      throw new HttpException(
        'Resident ID (residentSub) is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const query: Record<string, unknown> = {
      residentSub: queryDto.residentSub,
      objectStatus: ObjectStatus.CURRENT,
    };

    // Properly handle statuses array
    if (queryDto.statuses && queryDto.statuses.length > 0) {
      query.status = { $in: queryDto.statuses };
    }

    return this.industryChangeApplicationModel.find(query);
  }

  async deleteIndustryChangeApplication(id: string): Promise<void> {
    // Validate ObjectId format before querying
    if (!isValidObjectId(id)) {
      throw new HttpException(
        'Invalid application ID format',
        HttpStatus.BAD_REQUEST,
      );
    }

    const application = await this.industryChangeApplicationModel.findOne({
      _id: id,
      objectStatus: ObjectStatus.CURRENT,
    });

    if (!application) {
      throw new HttpException(
        'Industry change application not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (application.status !== IndustryChangeApplicationStatus.IN_REVIEW) {
      throw new HttpException(
        'Only applications in IN_REVIEW status can be deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.industryChangeApplicationModel.updateOne(
      { _id: id },
      {
        objectStatus: ObjectStatus.DELETED,
        updatedBy: 'system',
      },
    );
  }
}
