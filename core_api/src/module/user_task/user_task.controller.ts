import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserTaskService } from './user_task.service';
import { AccessTokenGuard } from '../../core/guard/authentification.guard';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { CreateUsertaskDto } from './dto/create_usertask.dto';
import { iUserTask } from 'src/core/interface/task.interface';

@Controller('user_task')
@UseGuards(AccessTokenGuard, RoleGuard)
export class UserTaskController {
  constructor(private readonly userTaskService: UserTaskService) {}

  @Post('/:task_id')
  @Roles('OWNER', 'ADMIN')
  async assignTaskToUser(
    @Body() body: { user: CreateUsertaskDto },
    @Param('task_id') task_id: string,
  ): Promise<{ result: string }> {
    const userTasknew: boolean = await this.userTaskService.assignTaskToUser(
      task_id,
      body.user.user_id,
    );

    if (!userTasknew) {
      throw new HttpException('utilisateur non trouvé', HttpStatus.BAD_REQUEST);
    }

    return { result: 'utilisateur assigné à la tache' };
  }

  @Get('/:task_id')
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getUserTask(
    @Param('task_id') task_id: string,
  ): Promise<{
    result: { message: string; userTaskList: { user: iUserTask }[] };
  }> {
    const userTaskList: { user: iUserTask }[] =
      await this.userTaskService.getUserTask(task_id);

    if (!userTaskList) {
      throw new HttpException('utilisateur non trouvé', HttpStatus.BAD_REQUEST);
    }

    return {
      result: {
        message: 'utilisateur assigné à la tache',
        userTaskList: userTaskList,
      },
    };
  }

  @Delete('/delete/:task_id/:user_id')
  @Roles('OWNER', 'ADMIN')
  @HttpCode(200)
  async removeUserTask(
    @Param('task_id') task_id: string,
    @Param('user_id') user_id: string,
  ): Promise<{ result: string }> {
    const userTaskDelete: boolean = await this.userTaskService.removeUserTask(
      task_id,
      user_id,
    );

    if (!userTaskDelete) {
      throw new HttpException('utilisateur non trouvé', HttpStatus.BAD_REQUEST);
    }

    return { result: 'utilisateur desassigner de la tache' };
  }
}
