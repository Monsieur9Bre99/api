import { Controller, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { NotificationCreateDto } from './dto/notification.create.dto';
import { TemplateService } from '../template/template.service';
import { UserPreferencesService } from '../userPreferences/userPreferences.service';
import { iNotification } from '../../core/interface/interface';

@Controller('notification')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);
  constructor(
    private readonly notificationService: NotificationService,
    private readonly templateService: TemplateService,
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @MessagePattern('notification.findAllForUser')
  async findAllForUser(
    @Payload() payload: { user_id: string },
  ): Promise<iNotification[]> {
    return this.notificationService.findAll(payload.user_id);
  }

  @MessagePattern('notification.findOne')
  async findOne(
    @Payload() payload: { id: string },
  ): Promise<iNotification | null> {
    try {
      return await this.notificationService.findOne(payload.id);
    } catch (error) {
      this.logger.error(`Notification ${payload.id} not found`, error);
      throw new RpcException('Notification non trouvée');
    }
  }

  @MessagePattern('notification.create')
  async create(@Payload() payload: NotificationCreateDto) {
    try {
      const [template, user] = await Promise.all([
        this.templateService.find(payload.category),
        this.userPreferencesService.find(payload.user_id),
      ]);

      if (!template) throw new RpcException('Template non trouvé');
      if (!user) throw new RpcException('Utilisateur non trouvé');

      const notification = await this.notificationService.create({
        user,
        template,
        variables: payload.variables,
      });

      return this.notificationService.dispatch(notification);
    } catch (error) {
      this.logger.error('Erreur création notification', error);
      throw new RpcException(error.message);
    }
  }
  @MessagePattern('notification.delete')
  async delete(
    @Payload() payload: { id: string; user_id: string },
  ): Promise<iNotification | null> {
    try {
      const deleted = await this.notificationService.delete(payload.id);
      if (!deleted)
        throw new RpcException('Notification non trouvée ou déjà lue');
      return deleted;
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
