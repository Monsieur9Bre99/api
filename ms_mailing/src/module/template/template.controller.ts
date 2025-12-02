import { Controller } from '@nestjs/common';
import { TemplateService } from './template.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { iCreateMailTemplate } from '../../core/interface/mail.interface';

@Controller()
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @MessagePattern('emailTemplate.create')
  async createEmailTemplate(@Payload() payload: iCreateMailTemplate) {
    try {
      const newTemplate =
        await this.templateService.createEmailTemplate(payload);

      if (!newTemplate) {
        return { success: false, message: 'Impossible to create new template' };
      }

      return {
        message: 'New template created successfully',
        data: newTemplate,
      };
    } catch (error) {
      console.error('❌ Error creating email template:', error.message);
      return { message: error.message };
    }
  }
}
