import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BlogStatut } from '@prisma/client';
import { CreateBlogDto } from './create-blog.dto';

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
  @ApiProperty({ enum: BlogStatut, required: false, description: 'Réservé à la modération admin' })
  @IsOptional()
  @IsEnum(BlogStatut)
  statut?: BlogStatut;
}
