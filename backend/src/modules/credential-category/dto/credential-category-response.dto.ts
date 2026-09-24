import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CredentialCategoryResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique credential category ID.',
  })
  id!: string;
  @ApiProperty({ example: 'Work', description: 'Credential category name.' })
  name!: string;
  @ApiPropertyOptional({
    example: 'Credentials related to work applications.',
    description: 'Credential category description.',
    nullable: true,
  })
  description!: string | null;
  @ApiProperty({
    example: '2026-09-23T10:00:00.000Z',
    description: 'Credential category creation timestamp.',
  })
  createdAt!: Date;
  @ApiProperty({
    example: '2026-09-23T10:00:00.000Z',
    description: 'Credential category last update timestamp.',
  })
  updatedAt!: Date;
}
export class PaginatedCredentialCategoryResponseDto {
  @ApiProperty({ example: 1, description: 'Current page number.' })
  page!: number;
  @ApiProperty({ example: 10, description: 'Number of records per page.' })
  limit!: number;
  @ApiProperty({
    example: 25,
    description: 'Total number of active credential categories.',
  })
  total!: number;
  @ApiProperty({ example: 3, description: 'Total number of pages.' })
  totalPage!: number;
  @ApiProperty({
    type: [CredentialCategoryResponseDto],
    description: 'Credential category records.',
  })
  data!: CredentialCategoryResponseDto[];
}
