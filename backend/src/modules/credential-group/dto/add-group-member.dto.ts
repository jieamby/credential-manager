import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class AddGroupMemberDto {
  @ApiProperty({
    example: 'member@example.com',
    description: 'Email of the user to add into the group',
  })
  @IsEmail()
  email!: string;
}
