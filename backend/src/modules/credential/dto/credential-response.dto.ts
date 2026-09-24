import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CredentialResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;
  @ApiProperty({
    example: 'GitHub',
  })
  title!: string;
  @ApiPropertyOptional({
    example: 'agus',
    nullable: true,
  })
  username!: string | null;
  @ApiPropertyOptional({
    example: 'https://github.com',
    nullable: true,
  })
  url!: string | null;
  @ApiPropertyOptional({
    example: 'Main GitHub account.',
    nullable: true,
  })
  notes!: string | null;
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  groupId!: string | null;
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  categoryId!: string | null;
  @ApiProperty({
    example: '2026-09-24T10:00:00.000Z',
  })
  createdAt!: Date;
  @ApiProperty({
    example: '2026-09-24T10:00:00.000Z',
  })
  updatedAt!: Date;
}
export class PaginatedCredentialResponseDto {
  @ApiProperty({
    example: 1,
  })
  page!: number;
  @ApiProperty({
    example: 10,
  })
  limit!: number;
  @ApiProperty({
    example: 25,
  })
  total!: number;
  @ApiProperty({
    example: 3,
  })
  totalPage!: number;
  @ApiProperty({
    type: [CredentialResponseDto],
  })
  data!: CredentialResponseDto[];
}
