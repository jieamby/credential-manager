import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CredentialService } from './credential.service';
import {
  CredentialResponseDto,
  PaginatedCredentialResponseDto,
} from './dto/credential-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { QueryCredentialDto } from './dto/query-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { AuthUser } from '../auth/auth.types';

@ApiTags('Credentials')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  @ApiOperation({
    summary: 'Create credential',
    description:
      'Create a credential. Password is encrypted before being stored.',
  })
  @ApiResponse({
    status: 201,
    description: 'Credential created successfully.',
    type: CredentialResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credential group or category not found.',
  })
  @ApiResponse({
    status: 404,
    description: 'Unauthorized.',
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCredentialDto,
  ): Promise<CredentialResponseDto> {
    return this.credentialService.create(user.id, dto);
  }
  @Get()
  @ApiOperation({
    summary: 'Get credentials',
    description:
      'Get authenticated user credentials with pagination, search and filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'Credentials retrieved successfully.',
    type: PaginatedCredentialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Unauthorized.',
  })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryCredentialDto,
  ): Promise<PaginatedCredentialResponseDto> {
    return this.credentialService.findAll(user.id, query);
  }
  @Get(':id')
  @ApiOperation({
    summary: 'Get credential by ID',
    description: 'Get one credential owned by the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential UUID.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential retrieved successfully.',
    type: CredentialResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Credential not found.',
  })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CredentialResponseDto> {
    return this.credentialService.findOne(user.id, id);
  }
  @Get(':id/reveal')
  @ApiOperation({ summary: 'Reveal decrypted credential password' })
  reveal(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ password: string }> {
    return this.credentialService.reveal(user.id, id);
  }
  @Patch(':id')
  @ApiOperation({
    summary: 'Update credential',
    description: 'Update credential. Password is re-encrypted when changed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential UUID.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential updated successfully.',
    type: CredentialResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Credential, group or category not found.',
  })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCredentialDto,
  ): Promise<CredentialResponseDto> {
    return this.credentialService.update(user.id, id, dto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete credential',
    description: 'Soft delete a credential. The database record is retained.',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential UUID.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Credential deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Credential not found.',
  })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.credentialService.remove(user.id, id);
  }
}
