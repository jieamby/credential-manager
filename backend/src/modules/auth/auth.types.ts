import { ApiProperty } from '@nestjs/swagger';

export interface JwtPayload {
  sub: string;
  email: string;
}

export class AuthUser {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique user ID',
  })
  id!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email!: string;
  @ApiProperty({
    example: 'Yahman',
    nullable: true,
    description: 'The name of the user',
  })
  name!: string | null;
}

export class AuthResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'JWT access token for authentication',
  })
  accessToken!: string;
  @ApiProperty({
    type: () => AuthUser,
    description: 'The authenticated user information',
  })
  user!: AuthUser;
}
