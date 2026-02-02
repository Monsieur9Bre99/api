import { Controller, Logger } from '@nestjs/common';
import { TemplateService } from './template.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TemplateCreateDto } from './dto/template.create.dto';
import { iTemplate } from 'src/core/interface/interface';
import { TemplateUpdateDto } from './dto/template.update.dto';

@Controller('template')
export class TemplateController {
  private readonly logger = new Logger(TemplateController.name);
  constructor(private readonly templateService: TemplateService) {}

  @MessagePattern('notificationTemplate.find')
  async findTemplate(
    @Payload() payload: { category: string },
  ): Promise<iTemplate> {
    const template = await this.templateService.find(payload.category);

    if (!template) throw new Error('Template not found');

    return template;
  }

  @MessagePattern('notificationTemplate.findAll')
  async findAllTemplate(
    @Payload()
    payload: {
      page?: number;
      limit?: number;
      sort?: 'asc' | 'desc';
    },
  ): Promise<{ data: iTemplate[]; total: number; hasMore: boolean }> {
    return await this.templateService.findAllPaginated(payload);
  }

  @MessagePattern('template.create')
  async create(@Payload() payload: TemplateCreateDto): Promise<iTemplate> {
    try {
      const template = await this.templateService.create(payload);
      if (!template) throw new RpcException('Template non créé');
      return template;
    } catch (error) {
      this.logger.error('Erreur création template', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('template.delete')
  async delete(
    @Payload() payload: { category: string },
  ): Promise<iTemplate | null> {
    try {
      return await this.templateService.delete(payload.category);
    } catch (error) {
      this.logger.error('Erreur suppression template', error);
      throw new RpcException('Template non supprimé');
    }
  }

  @MessagePattern('template.update')
  async update(
    @Payload() payload: TemplateUpdateDto,
  ): Promise<iTemplate | null> {
    try {
      const template = await this.templateService.update(payload);
      if (!template) throw new RpcException('Template non trouvé');
      return template;
    } catch (error) {
      this.logger.error('Erreur mise à jour template', error);
      throw new RpcException(error.message);
    }
  }
}
