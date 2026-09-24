import { PartialType } from '@nestjs/swagger';
import { CreateCredentialCategoryDto } from './create-credential-category.dto';

export class UpdateCredentialCategoryDto extends PartialType(
  CreateCredentialCategoryDto,
) {}
