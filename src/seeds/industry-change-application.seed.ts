import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IndustryChangeApplication,
  IndustryChangeApplicationStatus,
} from '../models/industry-change-application.model';
import {
  Resident,
  ObjectStatus,
  Industry,
  RegulatoryElection,
} from '../models/resident.model';

@Injectable()
export class IndustryChangeApplicationSeed {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
    @InjectModel(IndustryChangeApplication.name)
    private industryChangeApplicationModel: Model<IndustryChangeApplication>,
  ) {}

  @Command({
    command: 'create:industry-applications',
    describe: 'Create sample industry change applications',
  })
  async create() {
    try {
      // Drop existing applications
      console.log('Dropping all existing industry change applications...');
      await this.industryChangeApplicationModel.deleteMany({});
      console.log('All industry change applications dropped.');

      // Get all active residents
      const residents = await this.residentModel.find({
        status: 'ACTIVE',
        objectStatus: ObjectStatus.CURRENT,
      });

      if (residents.length === 0) {
        console.log(
          'No active residents found. Please create residents first.',
        );
        return;
      }

      console.log(
        `Found ${residents.length} active residents. Creating sample industry change applications...`,
      );

      // Create sample applications for each resident
      for (const resident of residents) {
        // Create an IN_REVIEW application
        const inReviewApplication = new this.industryChangeApplicationModel({
          residentSub: resident.sub,
          current: {
            willWorkInPhysicalJurisdiction:
              resident.willWorkInPhysicalJurisdiction,
            industry: resident.industry,
            regulatoryElection: resident.regulatoryElection,
            regulatoryElectionSub: resident.regulatoryElectionSub,
          },
          requested: {
            willWorkInPhysicalJurisdiction: true,
            industry:
              resident.industry === Industry.HEALTH
                ? Industry.FINANCE_AND_INSURANCE
                : Industry.HEALTH,
            regulatoryElection:
              resident.regulatoryElection === RegulatoryElection.USA
                ? RegulatoryElection.CANADA
                : RegulatoryElection.USA,
            regulatoryElectionSub: null,
          },
          status: IndustryChangeApplicationStatus.IN_REVIEW,
          submittedAt: new Date(),
          objectStatus: ObjectStatus.CURRENT,
          createdBy: 'seed',
          updatedBy: 'seed',
        });
        await inReviewApplication.save();

        // Create an APPROVED application
        const approvedApplication = new this.industryChangeApplicationModel({
          residentSub: resident.sub,
          current: {
            willWorkInPhysicalJurisdiction:
              resident.willWorkInPhysicalJurisdiction,
            industry: resident.industry,
            regulatoryElection: resident.regulatoryElection,
            regulatoryElectionSub: resident.regulatoryElectionSub,
          },
          requested: {
            willWorkInPhysicalJurisdiction: false,
            industry: null,
            regulatoryElection: null,
            regulatoryElectionSub: null,
          },
          status: IndustryChangeApplicationStatus.APPROVED,
          submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          decision: {
            decidedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
            decidedBy: 'Automatic',
          },
          objectStatus: ObjectStatus.CURRENT,
          createdBy: 'seed',
          updatedBy: 'seed',
        });
        await approvedApplication.save();

        // Create a REJECTED application (only for the first resident)
        if (resident.sub === 'auth0|12345') {
          const rejectedApplication = new this.industryChangeApplicationModel({
            residentSub: resident.sub,
            current: {
              willWorkInPhysicalJurisdiction:
                resident.willWorkInPhysicalJurisdiction,
              industry: resident.industry,
              regulatoryElection: resident.regulatoryElection,
              regulatoryElectionSub: resident.regulatoryElectionSub,
            },
            requested: {
              willWorkInPhysicalJurisdiction: true,
              industry: Industry.PRIVATE_SECURITY,
              regulatoryElection: RegulatoryElection.USA,
              regulatoryElectionSub: null,
            },
            status: IndustryChangeApplicationStatus.REJECTED,
            submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            decision: {
              decidedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000), // 58 days ago
              decidedBy: 'Admin',
              rejectionReason:
                'Industry change not approved due to regulatory concerns',
            },
            objectStatus: ObjectStatus.CURRENT,
            createdBy: 'seed',
            updatedBy: 'seed',
          });
          await rejectedApplication.save();
        }
      }

      console.log('Industry change applications created successfully!');
    } catch (error) {
      console.error('Error creating industry change applications:', error);
      throw error;
    }
  }
}
