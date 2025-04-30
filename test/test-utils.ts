import { Model } from 'mongoose';
import {
  Resident,
  ResidentStatus,
  TypeOfRegistration,
  ObjectStatus,
  Industry,
  RegulatoryElection,
} from '../src/models/resident.model';
import {
  IndustryChangeApplication,
  IndustryChangeApplicationStatus,
} from '../src/models/industry-change-application.model';

// Mock resident data
export const mockResidents = [
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
    ),
    profilePicture: 'base64encodedimage',
    status: ResidentStatus.ACTIVE,
    createdBy: 'system',
    updatedBy: 'system',
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
    ),
    profilePicture: 'base64encodedimage',
    status: ResidentStatus.ACTIVE,
    createdBy: 'system',
    updatedBy: 'system',
    objectStatus: ObjectStatus.CURRENT,
  },
];

// Mock applications data
export const mockIndustryChangeApplications = [
  {
    _id: 'app123',
    residentSub: 'auth0|12345',
    current: {
      willWorkInPhysicalJurisdiction: true,
      industry: Industry.HEALTH,
      regulatoryElection: RegulatoryElection.USA,
      regulatoryElectionSub: null,
    },
    requested: {
      willWorkInPhysicalJurisdiction: true,
      industry: Industry.FINANCE_AND_INSURANCE,
      regulatoryElection: RegulatoryElection.CANADA,
      regulatoryElectionSub: null,
    },
    status: IndustryChangeApplicationStatus.IN_REVIEW,
    submittedAt: new Date(),
    objectStatus: ObjectStatus.CURRENT,
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    _id: 'app456',
    residentSub: 'auth0|12345',
    current: {
      willWorkInPhysicalJurisdiction: true,
      industry: Industry.HEALTH,
      regulatoryElection: RegulatoryElection.USA,
      regulatoryElectionSub: null,
    },
    requested: {
      willWorkInPhysicalJurisdiction: false,
      industry: null,
      regulatoryElection: null,
      regulatoryElectionSub: null,
    },
    status: IndustryChangeApplicationStatus.APPROVED,
    submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    decision: {
      decidedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
      decidedBy: 'Automatic',
    },
    objectStatus: ObjectStatus.CURRENT,
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    _id: 'app789',
    residentSub: 'auth0|12345',
    current: {
      willWorkInPhysicalJurisdiction: true,
      industry: Industry.HEALTH,
      regulatoryElection: RegulatoryElection.USA,
      regulatoryElectionSub: null,
    },
    requested: {
      willWorkInPhysicalJurisdiction: true,
      industry: Industry.PRIVATE_SECURITY,
      regulatoryElection: RegulatoryElection.USA,
      regulatoryElectionSub: null,
    },
    status: IndustryChangeApplicationStatus.REJECTED,
    submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    decision: {
      decidedAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
      decidedBy: 'Admin',
      rejectionReason:
        'Industry change not approved due to regulatory concerns',
    },
    objectStatus: ObjectStatus.CURRENT,
    createdBy: 'system',
    updatedBy: 'system',
  },
  {
    _id: 'app101',
    residentSub: 'auth0|67890',
    current: {
      willWorkInPhysicalJurisdiction: false,
      industry: null,
      regulatoryElection: null,
      regulatoryElectionSub: null,
    },
    requested: {
      willWorkInPhysicalJurisdiction: true,
      industry: Industry.HEALTH,
      regulatoryElection: RegulatoryElection.USA,
      regulatoryElectionSub: null,
    },
    status: IndustryChangeApplicationStatus.IN_REVIEW,
    submittedAt: new Date(),
    objectStatus: ObjectStatus.CURRENT,
    createdBy: 'system',
    updatedBy: 'system',
  },
];

// Function to setup mock data in the models
export const setupMockData = async (
  residentModel: Model<Resident>,
  industryChangeApplicationModel: Model<IndustryChangeApplication>,
) => {
  // Clear existing data
  await residentModel.deleteMany({});
  await industryChangeApplicationModel.deleteMany({});

  // Add mock residents
  for (const residentData of mockResidents) {
    const resident = new residentModel(residentData);
    await resident.save();
  }

  // Add mock applications
  for (const appData of mockIndustryChangeApplications) {
    const app = new industryChangeApplicationModel(appData);
    await app.save();
  }
};

// Mock response object for controller tests
export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
