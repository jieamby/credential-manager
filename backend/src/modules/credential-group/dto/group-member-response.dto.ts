import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupMemberResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId!: string;

  @ApiProperty({
    example: 'member@example.com',
  })
  email!: string;

  @ApiPropertyOptional({
    example: 'Agus',
    nullable: true,
  })
  name!: string | null;

  @ApiProperty({
    example: 'owner',
    description: 'Member role: owner or member',
  })
  role!: string;

  @ApiProperty({
    example: '2026-09-23T10:00:00.000Z',
  })
  createdAt!: Date;
}
