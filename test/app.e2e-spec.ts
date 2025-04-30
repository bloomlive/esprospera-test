import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model, Types, Document } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { getModelToken } from '@nestjs/mongoose';

// Define type for MongoDB documents with _id
interface MongoDocument extends Document {
  _id: Types.ObjectId;
  [key: string]: any;
}

jest.setTimeout(30000); // Increase test timeout to 30 seconds globally

describe('ResidentRegister API (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let mongoConnection: Connection;
  let residentModel: Model<Resident>;
  let industryChangeApplicationModel: Model<IndustryChangeApplication>;

  // Sample resident data
  const testResident = {
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
  };

  // Sample inactive resident
  const inactiveResident = {
    ...testResident,
    sub: 'auth0|inactive',
    status: ResidentStatus.INACTIVE,
  };

  beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    mongoConnection = (await connect(mongoUri)).connection;

    // Create a testing module with our AppModule
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Mock the ConfigModule to provide our in-memory MongoDB URI
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ database: { uri: mongoUri } })],
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('database.uri'),
          }),
        }),
        AppModule,
      ],
    }).compile();

    // Create the NestJS application
    app = moduleFixture.createNestApplication();

    // Use validation pipe globally, just like in the main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    // Get the models from the Nest.js DI container
    residentModel = app.get<Model<Resident>>(getModelToken(Resident.name));
    industryChangeApplicationModel = app.get<Model<IndustryChangeApplication>>(
      getModelToken(IndustryChangeApplication.name),
    );

    // Seed test data
    await seedTestData();
  }, 30000); // Explicitly set timeout for beforeAll

  async function seedTestData(): Promise<void> {
    // Clear existing data
    await residentModel.deleteMany({});
    await industryChangeApplicationModel.deleteMany({});

    // Add test residents
    await residentModel.create(testResident);
    await residentModel.create(inactiveResident);

    // Add a second active resident
    await residentModel.create({
      ...testResident,
      sub: 'auth0|67890',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
      permitNumber: 67890,
      email: 'jane.smith@example.com',
      willWorkInPhysicalJurisdiction: false,
      industry: undefined,
      regulatoryElection: undefined,
    });

    // Add existing application for the test resident
    await industryChangeApplicationModel.create({
      residentSub: testResident.sub,
      current: {
        willWorkInPhysicalJurisdiction:
          testResident.willWorkInPhysicalJurisdiction,
        industry: testResident.industry,
        regulatoryElection: testResident.regulatoryElection,
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
    });

    // Add an APPROVED application
    await industryChangeApplicationModel.create({
      residentSub: testResident.sub,
      current: {
        willWorkInPhysicalJurisdiction:
          testResident.willWorkInPhysicalJurisdiction,
        industry: testResident.industry,
        regulatoryElection: testResident.regulatoryElection,
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
    });
  }

  afterAll(async () => {
    try {
      // Close the NestJS application
      if (app) {
        await app.close();
      }

      // Close the MongoDB connection
      if (mongoConnection) {
        await mongoConnection.close(true);
      }

      // Stop the in-memory MongoDB server
      if (mongoServer) {
        await mongoServer.stop();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, 30000); // Explicitly set timeout for afterAll

  describe('POST /resident-register/industry-change-applications', () => {
    it('should create an industry change application with IN_REVIEW status', async () => {
      const createDto = {
        residentSub: testResident.sub,
        willWorkInPhysicalJurisdiction: true,
        industry: Industry.MANUFACTURING, // Different from current
        regulatoryElection: RegulatoryElection.USA,
      };

      const response = await request(app.getHttpServer())
        .post('/resident-register/industry-change-applications')
        .send(createDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.residentSub).toEqual(createDto.residentSub);
      expect(response.body.requested.willWorkInPhysicalJurisdiction).toEqual(
        createDto.willWorkInPhysicalJurisdiction,
      );
      expect(response.body.requested.industry).toEqual(createDto.industry);
      expect(response.body.requested.regulatoryElection).toEqual(
        createDto.regulatoryElection,
      );
      expect(response.body.status).toEqual(
        IndustryChangeApplicationStatus.IN_REVIEW,
      );
      expect(response.body.submittedAt).toBeDefined();
      expect(response.body.decision).toBeUndefined();
    });

    it('should create an industry change application with APPROVED status when willWorkInPhysicalJurisdiction is false', async () => {
      const createDto = {
        residentSub: testResident.sub,
        willWorkInPhysicalJurisdiction: false,
      };

      const response = await request(app.getHttpServer())
        .post('/resident-register/industry-change-applications')
        .send(createDto)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.residentSub).toEqual(createDto.residentSub);
      expect(response.body.requested.willWorkInPhysicalJurisdiction).toEqual(
        createDto.willWorkInPhysicalJurisdiction,
      );
      expect(response.body.status).toEqual(
        IndustryChangeApplicationStatus.APPROVED,
      );
      expect(response.body.decision).toBeDefined();
      expect(response.body.decision.decidedBy).toEqual('Automatic');
      expect(response.body.decision.decidedAt).toBeDefined();
    });

    it('should return 400 when industry info is missing but willWorkInPhysicalJurisdiction is true', async () => {
      const createDto = {
        residentSub: testResident.sub,
        willWorkInPhysicalJurisdiction: true,
        // Missing industry and regulatoryElection
      };

      await request(app.getHttpServer())
        .post('/resident-register/industry-change-applications')
        .send(createDto)
        .expect(400);
    });

    it('should return 404 when resident is not found', async () => {
      const createDto = {
        residentSub: 'auth0|nonexistent',
        willWorkInPhysicalJurisdiction: true,
        industry: Industry.MANUFACTURING,
        regulatoryElection: RegulatoryElection.USA,
      };

      const response = await request(app.getHttpServer())
        .post('/resident-register/industry-change-applications')
        .send(createDto)
        .expect(404);

      expect(response.body.message).toContain(
        'Resident not found or not active',
      );
    });

    it('should return 404 when resident is inactive', async () => {
      const createDto = {
        residentSub: inactiveResident.sub,
        willWorkInPhysicalJurisdiction: true,
        industry: Industry.MANUFACTURING,
        regulatoryElection: RegulatoryElection.USA,
      };

      const response = await request(app.getHttpServer())
        .post('/resident-register/industry-change-applications')
        .send(createDto)
        .expect(404);

      expect(response.body.message).toContain(
        'Resident not found or not active',
      );
    });
  });

  describe('GET /resident-register/industry-change-applications/:id', () => {
    it('should return an application by ID', async () => {
      // First, get an application ID
      const applications = await industryChangeApplicationModel
        .find({ residentSub: testResident.sub })
        .exec();

      if (applications.length === 0) {
        fail('No applications found for testing');
        return;
      }

      // Properly cast document to access _id
      const applicationDoc = applications[0] as unknown as MongoDocument;
      const appId = applicationDoc._id.toString();

      const response = await request(app.getHttpServer())
        .get(`/resident-register/industry-change-applications/${appId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body._id).toBe(appId); // Use toBe instead of toEqual for string comparison
      expect(response.body.residentSub).toEqual(testResident.sub);
    });

    it('should return 404 when application is not found', async () => {
      const nonExistentId = new Types.ObjectId().toString(); // Random valid ObjectId

      const response = await request(app.getHttpServer())
        .get(`/resident-register/industry-change-applications/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toContain(
        'Industry change application not found',
      );
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app.getHttpServer())
        .get(`/resident-register/industry-change-applications/${invalidId}`)
        .expect(400);

      expect(response.body.message).toContain('Invalid application ID format');
    });
  });

  describe('GET /resident-register/industry-change-applications', () => {
    it('should return applications for a resident', async () => {
      const response = await request(app.getHttpServer())
        .get('/resident-register/industry-change-applications')
        .query({ residentSub: testResident.sub })
        .expect(200);

      expect(response.body.industryChangeApplications).toBeDefined();
      expect(response.body.industryChangeApplications.length).toBeGreaterThan(
        0,
      );
      expect(response.body.industryChangeApplications[0].residentSub).toEqual(
        testResident.sub,
      );
    });

    it('should filter applications by status', async () => {
      // Use string format for query parameters
      const response = await request(app.getHttpServer())
        .get('/resident-register/industry-change-applications')
        .query({
          residentSub: testResident.sub,
          statuses: IndustryChangeApplicationStatus.IN_REVIEW,
        })
        .expect(200);

      expect(response.body.industryChangeApplications).toBeDefined();
      expect(response.body.industryChangeApplications.length).toBeGreaterThan(
        0,
      );

      // Check all returned applications have IN_REVIEW status
      for (const app of response.body.industryChangeApplications) {
        expect(app.status).toBe(IndustryChangeApplicationStatus.IN_REVIEW);
      }
    });

    it('should return empty array when no applications match', async () => {
      const response = await request(app.getHttpServer())
        .get('/resident-register/industry-change-applications')
        .query({
          residentSub: 'auth0|nonexistent',
        })
        .expect(200);

      expect(response.body.industryChangeApplications).toBeDefined();
      expect(response.body.industryChangeApplications.length).toBe(0);
    });

    it('should return 400 when residentSub is not provided', async () => {
      await request(app.getHttpServer())
        .get('/resident-register/industry-change-applications')
        .expect(400);
    });
  });

  describe('DELETE /resident-register/industry-change-applications/:id', () => {
    it('should delete an IN_REVIEW application', async () => {
      // First, create an application to delete
      const createDto = {
        residentSub: testResident.sub,
        willWorkInPhysicalJurisdiction: true,
        industry: Industry.CONSTRUCTION,
        regulatoryElection: RegulatoryElection.USA,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/resident-register/industry-change-applications')
        .send(createDto)
        .expect(201);

      const appId = createResponse.body._id;

      // Now delete it
      await request(app.getHttpServer())
        .delete(`/resident-register/industry-change-applications/${appId}`)
        .expect(204);

      // Verify it was logically deleted
      const deletedApp = await industryChangeApplicationModel
        .findById(appId)
        .exec();

      expect(deletedApp).not.toBeNull();
      if (deletedApp) {
        expect(deletedApp.objectStatus).toEqual(ObjectStatus.DELETED);
      }
    });

    it('should return 400 when trying to delete an APPROVED application', async () => {
      // Find an APPROVED application
      const approvedAppDoc = await industryChangeApplicationModel
        .findOne({
          status: IndustryChangeApplicationStatus.APPROVED,
        })
        .exec();

      expect(approvedAppDoc).not.toBeNull();

      if (approvedAppDoc) {
        // Cast to the proper document type with _id
        const approvedApp = approvedAppDoc as unknown as MongoDocument;
        const appId = approvedApp._id.toString();

        const response = await request(app.getHttpServer())
          .delete(`/resident-register/industry-change-applications/${appId}`)
          .expect(400);

        expect(response.body.message).toContain(
          'Only applications in IN_REVIEW status can be deleted',
        );
      } else {
        // Skip the test if no approved application is found
        console.warn('No APPROVED application found for testing deletion');
      }
    });

    it('should return 404 when application is not found', async () => {
      const nonExistentId = new Types.ObjectId().toString(); // Generate valid ObjectId

      const response = await request(app.getHttpServer())
        .delete(
          `/resident-register/industry-change-applications/${nonExistentId}`,
        )
        .expect(404);

      expect(response.body.message).toContain(
        'Industry change application not found',
      );
    });
  });
});
