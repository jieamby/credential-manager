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
import { CredentialGroupService } from './credential-group.service';
import {
  CredentialGroupResponseDto,
  PaginatedCredentialGroupResponseDto,
} from './dto/credential-group-response.dto';
import { CreateCredentialGroupDto } from './dto/create-credential-group.dto';
import { QueryCredentialGroupDto } from './dto/query-credential-group.dto';
import { UpdateCredentialGroupDto } from './dto/update-credential-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { GroupMemberResponseDto } from './dto/group-member-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@ApiTags('Credential Groups')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('credential-groups')
export class CredentialGroupController {
  constructor(
    private readonly credentialGroupService: CredentialGroupService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create credential group',
    description:
      'Create a credential group. Category is optional. Creator becomes the owner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Credential group created successfully',
    type: CredentialGroupResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCredentialGroupDto,
  ): Promise<CredentialGroupResponseDto> {
    return this.credentialGroupService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get credential groups',
    description: 'List groups where the authenticated user is a member.',
  })
  @ApiResponse({
    status: 200,
    description: 'Credential groups retrieved successfully',
    type: PaginatedCredentialGroupResponseDto,
  })
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: QueryCredentialGroupDto,
  ): Promise<PaginatedCredentialGroupResponseDto> {
    return this.credentialGroupService.findAll(user.id, query);
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'List group members',
    description: 'List users who belong to the same credential group.',
  })
  @ApiParam({ name: 'id', description: 'Credential group UUID' })
  @ApiResponse({ status: 200, type: [GroupMemberResponseDto] })
  @ApiResponse({ status: 403, description: 'Not a group member.' })
  @ApiResponse({ status: 404, description: 'Credential group not found.' })
  listMembers(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GroupMemberResponseDto[]> {
    return this.credentialGroupService.listMembers(user.id, id);
  }

  @Post(':id/members')
  @ApiOperation({
    summary: 'Add group member',
    description: 'Owner adds another registered user into the group by email.',
  })
  @ApiParam({ name: 'id', description: 'Credential group UUID' })
  @ApiResponse({ status: 201, type: GroupMemberResponseDto })
  @ApiResponse({ status: 403, description: 'Only owner can add members.' })
  @ApiResponse({ status: 404, description: 'Group or user not found.' })
  addMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddGroupMemberDto,
  ): Promise<GroupMemberResponseDto> {
    return this.credentialGroupService.addMember(user.id, id, dto);
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove group member',
    description: 'Owner removes a member from the group.',
  })
  @ApiParam({ name: 'id', description: 'Credential group UUID' })
  @ApiParam({ name: 'userId', description: 'User UUID to remove' })
  @ApiResponse({ status: 204, description: 'Member removed successfully.' })
  @ApiResponse({ status: 403, description: 'Only owner can remove members.' })
  @ApiResponse({ status: 404, description: 'Group member not found.' })
  async removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<void> {
    await this.credentialGroupService.removeMember(user.id, id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credential group by ID' })
  @ApiParam({ name: 'id', description: 'Credential group UUID' })
  @ApiResponse({ status: 200, type: CredentialGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Credential group not found' })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CredentialGroupResponseDto> {
    return this.credentialGroupService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update credential group' })
  @ApiParam({ name: 'id', description: 'Credential group UUID' })
  @ApiResponse({ status: 200, type: CredentialGroupResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @ApiResponse({ status: 404, description: 'Credential group not found' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCredentialGroupDto,
  ): Promise<CredentialGroupResponseDto> {
    return this.credentialGroupService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete credential group',
    description: 'Soft delete a credential group. Only the owner can delete.',
  })
  @ApiParam({ name: 'id', description: 'Credential group UUID.' })
  @ApiResponse({
    status: 204,
    description: 'Credential group deleted successfully.',
  })
  @ApiResponse({ status: 404, description: 'Credential group not found.' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.credentialGroupService.remove(user.id, id);
  }
}
