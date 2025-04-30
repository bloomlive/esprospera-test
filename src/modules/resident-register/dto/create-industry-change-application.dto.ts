import {
  IsBoolean,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Industry, RegulatoryElection } from '../../../models/resident.model';

export class CreateIndustryChangeApplicationDto {
  @IsString()
  @IsNotEmpty()
  residentSub: string;

  @IsBoolean()
  @IsNotEmpty()
  willWorkInPhysicalJurisdiction: boolean;

  @IsEnum(Industry)
  @ValidateIf(
    (o: CreateIndustryChangeApplicationDto) => o.willWorkInPhysicalJurisdiction,
  )
  @IsNotEmpty({
    message: 'Industry is required when working in physical jurisdiction',
  })
  industry?: Industry;

  @IsEnum(RegulatoryElection)
  @ValidateIf(
    (o: CreateIndustryChangeApplicationDto) => o.willWorkInPhysicalJurisdiction,
  )
  @IsNotEmpty({
    message:
      'Regulatory election is required when working in physical jurisdiction',
  })
  regulatoryElection?: RegulatoryElection | null;

  @IsString()
  @IsOptional()
  @ValidateIf(
    (o: CreateIndustryChangeApplicationDto) => o.willWorkInPhysicalJurisdiction,
  )
  regulatoryElectionSub?: string;
}
