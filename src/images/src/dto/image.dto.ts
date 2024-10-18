import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class ImageDto {
  @IsString()
  @ApiProperty()
  originalFileName: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  firebaseFileName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  tenant?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  searchableFileName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  folderName?: string;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional()
  @Type(() => Date)
  uploadDate?: Date;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  @Type(() => Number)
  originalSize?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  @Type(() => Number)
  compressedSize?: number;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  url?: string;

  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Buffer)
  buffer?: Buffer;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  @Type(() => Number)
  userId?: number;
}
