import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

const blankToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class CreateCredentialDto {
  @ApiProperty({
    example: 'GitHub',
    description: 'Nama layanan/akun, bukan nama orang',
    minLength: 2,
    maxLength: 150,
  })
  @Transform(blankToUndefined)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional({
    example: 'agus@example.com',
    description: 'Username atau email untuk login',
    maxLength: 255,
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  username?: string;

  @ApiPropertyOptional({
    example: 'https://github.com',
    description: 'Alamat situs akun. Harus http atau https.',
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'URL must start with http:// or https://' },
  )
  @MaxLength(500)
  url?: string;

  @ApiProperty({
    example: 'MySuperSecretPassword123!',
    description:
      'Credential password. It will be encrypted before being stored.',
    minLength: 8,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(1000)
  password!: string;

  @ApiPropertyOptional({
    example: 'Main GitHub account.',
    description: 'Optional credential notes.',
    maxLength: 2000,
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Optional credential group ID.',
    nullable: true,
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Optional credential category ID.',
    nullable: true,
  })
  @Transform(blankToUndefined)
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
