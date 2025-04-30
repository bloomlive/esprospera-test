import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Industry, ObjectStatus, RegulatoryElection } from './resident.model';

export const IndustryChangeApplicationStatus = {
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type IndustryChangeApplicationStatus =
  keyof typeof IndustryChangeApplicationStatus;

@Schema()
export class IndustryInfo {
  @Prop({ required: true })
  willWorkInPhysicalJurisdiction: boolean;

  @Prop({ enum: Industry })
  industry?: Industry;

  @Prop({ enum: RegulatoryElection })
  regulatoryElection?: RegulatoryElection;

  @Prop()
  regulatoryElectionSub?: string;
}

@Schema()
export class DecisionInfo {
  @Prop()
  decidedAt?: Date;

  @Prop()
  decidedBy?: string;

  @Prop()
  rejectionReason?: string;
}

@Schema({ timestamps: true })
export class IndustryChangeApplication extends Document {
  @Prop({ required: true })
  residentSub: string;

  @Prop({ required: true, type: IndustryInfo })
  current: IndustryInfo;

  @Prop({ required: true, type: IndustryInfo })
  requested: IndustryInfo;

  @Prop({ required: true, enum: IndustryChangeApplicationStatus })
  status: IndustryChangeApplicationStatus;

  @Prop({ required: true })
  submittedAt: Date;

  @Prop({ type: DecisionInfo })
  decision?: DecisionInfo;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop({ required: true, enum: ObjectStatus, default: ObjectStatus.CURRENT })
  objectStatus: ObjectStatus;
}

export const IndustryChangeApplicationSchema = SchemaFactory.createForClass(
  IndustryChangeApplication,
);
