import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { UserPreferencesService } from './userPreferences.service';
import { UserPreferencesCreateDto } from './dto/userPreferences.create.dto';
import { UserPreferencesUpdateDto } from './dto/userPreferences.update.dto';
import { iUserPreferences } from '../../core/interface/interface';
import { UserPreferences } from '../../core/schema/userPreferences.schema';

@Controller('user-preferences')
export class UserPreferencesController {
  private readonly logger = new Logger(UserPreferencesController.name);
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @MessagePattern('user-preferences.find')
  async find(
    @Payload() payload: { user_id: string },
  ): Promise<iUserPreferences | null> {
    return await this.userPreferencesService.find(payload.user_id);
  }

  @MessagePattern('user-preferences.findAll')
  async findAll(
    @Payload()
    payload: { page?: number; limit?: number; sort?: 'asc' | 'desc' } = {},
  ): Promise<{ data: iUserPreferences[]; total: number; hasMore: boolean }> {
    return this.userPreferencesService.findAllPaginated(payload);
  }

  @MessagePattern('user-preferences.create')
  async create(
    @Payload() payload: UserPreferencesCreateDto,
  ): Promise<UserPreferences> {
    try {
      const existingUser = await this.userPreferencesService.find(
        payload.user_id,
      );
      if (existingUser) {
        throw new RpcException('Utilisateur existe déjà');
      }
      return this.userPreferencesService.create(payload);
    } catch (error) {
      this.logger.error('Erreur création user prefs', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('user-preferences.update')
  async update(
    @Payload() payload: UserPreferencesUpdateDto,
  ): Promise<UserPreferences | null> {
    try {
      const updated = await this.userPreferencesService.update(payload);
      if (!updated) {
        throw new RpcException('Utilisateur non trouvé');
      }
      return updated;
    } catch (error) {
      this.logger.error('Erreur update user prefs', error);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('user-preferences.delete')
  async delete(
    @Payload() payload: { user_id: string },
  ): Promise<iUserPreferences | null> {
    try {
      return await this.userPreferencesService.delete(payload.user_id);
    } catch (error) {
      this.logger.error('Erreur suppression user prefs', error);
      throw new RpcException('Erreur suppression');
    }
  }
}
