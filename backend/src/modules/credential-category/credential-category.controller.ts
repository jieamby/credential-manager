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
import { CredentialCategoryService } from './credential-category.service';
import { QueryCredentialCategoryDto } from './dto/query-credential-category.dto';
import { UpdateCredentialCategoryDto } from './dto/update-credential-category.dto';

import { CreateCredentialCategoryDto } from './dto/create-credential-category.dto';
import {
  CredentialCategoryResponseDto,
  PaginatedCredentialCategoryResponseDto,
} from './dto/credential-category-response.dto';

@ApiTags('Credential Categories')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('credential-categories')
export class CredentialCategoryController {
  constructor(
    private readonly credentialCategoryService: CredentialCategoryService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create credential category',
    description: 'Create a new category that can be assigned to credentials.',
  })
  @ApiResponse({
    status: 201,
    description: 'Credential category created successfully.',
    type: CredentialCategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  create(
    @Body() dto: CreateCredentialCategoryDto,
  ): Promise<CredentialCategoryResponseDto> {
    return this.credentialCategoryService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get credential categories',
    description:
      'Retrieve active credential categories with pagination and search.',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential categories retrieved successfully.',
    type: PaginatedCredentialCategoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  findAll(
    @Query() query: QueryCredentialCategoryDto,
  ): Promise<PaginatedCredentialCategoryResponseDto> {
    return this.credentialCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get credential category by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential category UUID.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential category found.',
    type: CredentialCategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Credential category not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CredentialCategoryResponseDto> {
    return this.credentialCategoryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update credential category',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential category UUID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential category updated successfully.',
    type: CredentialCategoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data.',
  })
  @ApiResponse({
    status: 404,
    description: 'Credential category not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCredentialCategoryDto,
  ): Promise<CredentialCategoryResponseDto> {
    return this.credentialCategoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete credential category',
    description:
      'Soft delete a credential category. The record remains stored in the database.',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential category UUID.',
  })
  @ApiResponse({
    status: 204,
    description: 'Credential category deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Credential category not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.credentialCategoryService.remove(id);
  }
}
