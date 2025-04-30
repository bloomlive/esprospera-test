import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IndustryChangeApplicationStatus } from '../../../models/industry-change-application.model';
import { Transform } from 'class-transformer';

export class QueryIndustryChangeApplicationsDto {
  @IsOptional()
  @Transform(({ value }) => {
    // Handle string value (single status)
    if (typeof value === 'string') {
      return [value];
    }
    // Handle array value
    if (Array.isArray(value)) {
      return value;
    }
    // Return empty array if undefined to avoid validation errors
    return [];
  })
  @IsEnum(IndustryChangeApplicationStatus, { each: true })
  statuses?: IndustryChangeApplicationStatus[];

  @IsString()
  @IsNotEmpty()
  residentSub!: string;
}
