import { Module, Global } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

@Global()
@Module({
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
