import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CredentialGroupResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: 'Development',
  })
  name!: string;

  @ApiPropertyOptional({
    example: 'Development related',
    nullable: true,
  })
  description!: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  parentId!: string | null;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  categoryId!: string | null;

  @ApiProperty({
    example: '2026-09-23T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-09-23T10:00:00.000Z',
  })
  updatedAt!: Date;
}

export class PaginatedCredentialGroupResponseDto {
  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    example: 15,
  })
  total!: number;

  @ApiProperty({
    example: 2,
  })
  totalPage!: number;

  @ApiProperty({
    type: [CredentialGroupResponseDto],
  })
  data!: CredentialGroupResponseDto[];
}
