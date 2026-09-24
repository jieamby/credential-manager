import { PartialType } from '@nestjs/swagger';
import { CreateCredentialGroupDto } from './create-credential-group.dto';

export class UpdateCredentialGroupDto extends PartialType(
  CreateCredentialGroupDto,
) {}
