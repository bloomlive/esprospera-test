import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Resident,
  ResidentStatus,
  TypeOfRegistration,
  ObjectStatus,
  Industry,
  RegulatoryElection,
} from '../models/resident.model';

@Injectable()
export class ResidentSeed {
  constructor(
    @InjectModel(Resident.name) private residentModel: Model<Resident>,
  ) {}

  @Command({ command: 'create:resident', describe: 'Create sample residents' })
  async create() {
    try {
      // Drop existing residents
      console.log('Dropping all existing residents...');
      await this.residentModel.deleteMany({});
      console.log('All residents dropped.');

      // Create multiple sample residents for testing
      const residents = [
        {
          sub: 'auth0|12345',
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          permitNumber: 12345,
          permitNumberQrCode: 'base64encodedqrcode',
          dateOfBirth: new Date('1990-01-01'),
          countryOfBirth: 'United States',
          email: 'john.doe@example.com',
          citizenship: 'USA',
          gender: 'Male',
          address: {
            country: 'Honduras',
            city: 'Roatan',
            streetAddress: '123 Main St',
            zipCode: '12345',
            isVerifiedAddress: true,
          },
          phoneNumber: '+15551234567',
          typeOfRegistration: TypeOfRegistration.E_RESIDENCY,
          willWorkInPhysicalJurisdiction: true,
          industry: Industry.HEALTH,
          regulatoryElection: RegulatoryElection.USA,
          firstRegistrationDate: new Date(),
          nextSubscriptionPaymentDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ), // 30 days from now
          profilePicture: 'base64encodedimage',
          status: ResidentStatus.ACTIVE,
          createdBy: 'seed',
          updatedBy: 'seed',
          objectStatus: ObjectStatus.CURRENT,
        },
        {
          sub: 'auth0|67890',
          firstName: 'Jane',
          lastName: 'Smith',
          fullName: 'Jane Smith',
          permitNumber: 67890,
          permitNumberQrCode: 'base64encodedqrcode',
          dateOfBirth: new Date('1992-05-15'),
          countryOfBirth: 'Canada',
          email: 'jane.smith@example.com',
          citizenship: 'Canada',
          gender: 'Female',
          address: {
            country: 'Honduras',
            city: 'Roatan',
            streetAddress: '456 Oak St',
            zipCode: '67890',
            isVerifiedAddress: true,
          },
          phoneNumber: '+15559876543',
          typeOfRegistration: TypeOfRegistration.RESIDENCY,
          willWorkInPhysicalJurisdiction: false,
          firstRegistrationDate: new Date(),
          nextSubscriptionPaymentDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ), // 30 days from now
          profilePicture: 'base64encodedimage',
          status: ResidentStatus.ACTIVE,
          createdBy: 'seed',
          updatedBy: 'seed',
          objectStatus: ObjectStatus.CURRENT,
        },
        {
          sub: 'auth0|54321',
          firstName: 'Alice',
          lastName: 'Johnson',
          fullName: 'Alice Johnson',
          permitNumber: 54321,
          permitNumberQrCode: 'base64encodedqrcode',
          dateOfBirth: new Date('1985-08-20'),
          countryOfBirth: 'Germany',
          email: 'alice.johnson@example.com',
          citizenship: 'Germany',
          gender: 'Female',
          address: {
            country: 'Honduras',
            city: 'Roatan',
            streetAddress: '789 Pine St',
            zipCode: '54321',
            isVerifiedAddress: true,
          },
          phoneNumber: '+15552468013',
          typeOfRegistration: TypeOfRegistration.LIMITED_E_RESIDENCY,
          willWorkInPhysicalJurisdiction: true,
          industry: Industry.FINANCE_AND_INSURANCE,
          regulatoryElection: RegulatoryElection.GERMANY,
          firstRegistrationDate: new Date(),
          nextSubscriptionPaymentDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ), // 30 days from now
          profilePicture: 'base64encodedimage',
          status: ResidentStatus.ACTIVE,
          createdBy: 'seed',
          updatedBy: 'seed',
          objectStatus: ObjectStatus.CURRENT,
        },
      ];

      console.log(`Creating ${residents.length} sample residents...`);

      for (const residentData of residents) {
        const resident = new this.residentModel(residentData);
        await resident.save();
      }

      console.log('Residents created successfully!');
    } catch (error) {
      console.error('Error creating residents:', error);
      throw error;
    }
  }
}
