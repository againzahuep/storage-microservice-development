import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ImageFilter } from '../filters/image.filter';

export class PaginationDto {
  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ default: 2 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number;

  filter?: ImageFilter;
}
