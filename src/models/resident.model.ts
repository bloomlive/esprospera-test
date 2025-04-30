import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ResidentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum TypeOfRegistration {
  E_RESIDENCY = 'E_RESIDENCY',
  RESIDENCY = 'RESIDENCY',
  LIMITED_E_RESIDENCY = 'LIMITED_E_RESIDENCY',
}

export enum TypeOfRegistrationSub {
  HONDURAN = 'HONDURAN',
  INTERNATIONAL = 'INTERNATIONAL',
}

export enum Industry {
  AGRICULTURAL = 'AGRICULTURAL',
  CONSTRUCTION = 'CONSTRUCTION',
  ENERGY = 'ENERGY',
  FINANCE_AND_INSURANCE = 'FINANCE_AND_INSURANCE',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  MANUFACTURING = 'MANUFACTURING',
  MINING_AND_SUBSURFACE = 'MINING_AND_SUBSURFACE',
  PRIVATE_SECURITY = 'PRIVATE_SECURITY',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
}

export enum RegulatoryElection {
  AUSTRALIA = 'AUSTRALIA',
  AUSTRIA = 'AUSTRIA',
  BELGIUM = 'BELGIUM',
  CANADA = 'CANADA',
  CHILE = 'CHILE',
  ROATAN_COMMON_LAW_CODE = 'ROATAN_COMMON_LAW_CODE',
  DENMARK = 'DENMARK',
  DUBAI = 'DUBAI',
  ESTONIA = 'ESTONIA',
  FINLAND = 'FINLAND',
  FRANCE = 'FRANCE',
  GERMANY = 'GERMANY',
  HONDURAS = 'HONDURAS',
  HONG_KONG = 'HONG_KONG',
  ICELAND = 'ICELAND',
  IRELAND = 'IRELAND',
  ISRAEL = 'ISRAEL',
  ITALY = 'ITALY',
  JAPAN = 'JAPAN',
  LUXEMBOURG = 'LUXEMBOURG',
  MEXICO = 'MEXICO',
  NETHERLANDS = 'NETHERLANDS',
  NEW_ZEALAND = 'NEW_ZEALAND',
  NORWAY = 'NORWAY',
  PETITION_FOR_TAILORED_REGULATION_GRANTED = 'PETITION_FOR_TAILORED_REGULATION_GRANTED',
  PETITION_FOR_TAILORED_REGULATION_PENDING = 'PETITION_FOR_TAILORED_REGULATION_PENDING',
  POLAND = 'POLAND',
  SINGAPORE = 'SINGAPORE',
  SOUTH_KOREA = 'SOUTH_KOREA',
  SPAIN = 'SPAIN',
  SWEDEN = 'SWEDEN',
  SWITZERLAND = 'SWITZERLAND',
  UK = 'UK',
  USA = 'USA',
}

export enum ObjectStatus {
  CURRENT = 'CURRENT',
  DELETED = 'DELETED',
}

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  state?: string;

  @Prop({ required: true })
  streetAddress: string;

  @Prop({ required: true })
  zipCode: string;

  @Prop({ required: true, default: false })
  isVerifiedAddress: boolean;
}

@Schema({ timestamps: true })
export class Resident extends Document {
  @Prop({ required: true, unique: true })
  sub: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  permitNumber: number;

  @Prop()
  permitNumberQrCode?: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ required: true })
  countryOfBirth: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  citizenship: string;

  @Prop({ required: true })
  gender: string;

  @Prop({ required: true, type: Address })
  address: Address;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true, enum: TypeOfRegistration })
  typeOfRegistration: TypeOfRegistration;

  @Prop({ enum: TypeOfRegistrationSub })
  typeOfRegistrationSub?: TypeOfRegistrationSub;

  @Prop({ enum: Industry })
  industry?: Industry;

  @Prop({ required: true })
  willWorkInPhysicalJurisdiction: boolean;

  @Prop({ enum: RegulatoryElection })
  regulatoryElection?: RegulatoryElection;

  @Prop()
  regulatoryElectionSub?: string;

  @Prop({ required: true })
  firstRegistrationDate: Date;

  @Prop({ required: true })
  nextSubscriptionPaymentDate: Date;

  @Prop({ required: true })
  profilePicture: string;

  @Prop({ required: true, enum: ResidentStatus })
  status: ResidentStatus;

  @Prop()
  residencyEndDate?: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop({ required: true, enum: ObjectStatus, default: ObjectStatus.CURRENT })
  objectStatus: ObjectStatus;
}

export const ResidentSchema = SchemaFactory.createForClass(Resident);
