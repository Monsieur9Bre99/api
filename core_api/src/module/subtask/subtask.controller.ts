import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubtaskService } from './subtask.service';
import {
  AccessTokenGuard,
  iAuthentificatedRequest,
} from '../../core/guard/authentification.guard';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { CreateSubtaskDto } from './dto/create_subtask.dto';
import { iSubtask } from '../../core/interface/task.interface';
import { TaskService } from '../task/task.service';

@Controller('subtask')
@UseGuards(AccessTokenGuard, RoleGuard)
export class SubtaskController {
  constructor(
    private readonly subtaskService: SubtaskService,
    private readonly taskService: TaskService,
  ) {}

  /**
   * Cree une nouvelle sous-tache liée à une tâche existante
   * @param body Les informations de la sous-tache à créer
   * @param task_id L'ID de la tâche liée à la sous-tache
   * @param project_id L'ID du projet auquel la tâche et la sous-tache sont liées
   * @returns La sous-tache créée, ou un message d'erreur si la tâche n'existe pas, si elle est terminée, ou si elle n'est pas en cours
   */
  @Post('/create/:task_id')
  @Roles('OWNER', 'ADMIN')
  async createSubtask(
    @Body() body: CreateSubtaskDto,
    @Param('task_id') task_id: string,
    @Query('project_id') project_id: string,
  ): Promise<{ result: { message: string; subtask: iSubtask } }> {
    const task = await this.taskService.getTaskById(task_id, project_id);

    if (!task) {
      throw new HttpException('tache non trouvee', HttpStatus.BAD_REQUEST);
    }

    if (task.statuts !== 'TODO' && task.statuts !== 'BACKLOG') {
      throw new HttpException(
        "tache en cours ou terminee, impossible d'ajouter une sous-tache",
        HttpStatus.BAD_REQUEST,
      );
    }

    const subtask: iSubtask = await this.subtaskService.createSubtask(
      task_id,
      body,
    );

    if (!subtask) {
      throw new HttpException('sous-tache non creee', HttpStatus.BAD_REQUEST);
    }

    return {
      result: {
        message: 'sous-tache creee avec success',
        subtask: subtask,
      },
    };
  }

  /**
   * Récupère la liste des sous-tâches liées à une tâche.
   * @param {string} task_id L'ID de la tâche liée aux sous-tâches
   * @param {string} project_id L'ID du projet auquel la tâche et la sous-tache sont liées
   * @returns La liste des sous-tâches liées à la tâche, ou un message d'erreur si la tâche n'existe pas, si elle est terminée, ou si elle n'est pas en cours
   */
  @Get('/:task_id')
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getSubtasks(
    @Param('task_id') task_id: string,
    @Query('project_id') project_id: string,
  ): Promise<
    { result: string } | { result: { message: string; subtasks: iSubtask[] } }
  > {
    const task = await this.taskService.getTaskById(task_id, project_id);

    if (!task) {
      throw new HttpException('tache non trouvee', HttpStatus.BAD_REQUEST);
    }

    const subtasks: iSubtask[] = await this.subtaskService.getSubtasks(task_id);

    if (!subtasks) {
      throw new HttpException(
        'sous-tâches non trouvées',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (subtasks.length === 0) {
      return {
        result: 'aucune sous-tâches trouvées',
      };
    }

    return {
      result: {
        message: 'recuperation des sous-tâches reussie',
        subtasks: subtasks,
      },
    };
  }

  /**
   * Supprime une sous-tâche en fonction de son ID et de l'ID de la tâche liée.
   * @param task_id L'ID de la tâche liée à la sous-tâche
   * @param subtask_id L'ID de la sous-tâche à supprimer
   * @param project_id L'ID du projet auquel la tâche et la sous-tâche sont liées
   * @returns La sous-tâche supprimée, ou un message d'erreur si la tâche n'existe pas, si elle est terminée, ou si elle n'est pas en cours
   */
  @Delete('/delete/:task_id/:subtask_id')
  @Roles('OWNER', 'ADMIN')
  async deleteSubtask(
    @Param('task_id') task_id: string,
    @Param('subtask_id') subtask_id: string,
    @Query('project_id') project_id: string,
  ) {
    const task = await this.taskService.getTaskById(task_id, project_id);

    if (!task) {
      throw new HttpException('tache non trouvee', HttpStatus.BAD_REQUEST);
    }

    if (task.statuts !== 'BACKLOG') {
      throw new HttpException(
        'tache en cours ou terminee, impossible de supprimer la sous-tache',
        HttpStatus.BAD_REQUEST,
      );
    }

    const subtask: boolean = await this.subtaskService.deleteSubtask(
      task_id,
      subtask_id,
    );

    if (!subtask) {
      throw new HttpException(
        'sous-tache non supprimee',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'sous-tache supprimee avec success',
    };
  }

  /**
   * Met à jour une sous-tâche en fonction de son ID et de l'ID de la tâche liée.
   * @param {string} task_id L'ID de la tâche liée à la sous-tâche
   * @param {string} subtask_id L'ID de la sous-tâche à mettre à jour
   * @param {string} project_id L'ID du projet lié à la tâche
   * @param {UpdateSubtaskDto} body Les informations de la sous-tâche à mettre à jour
   * @returns {Promise<{ result: string }>} La sous-tâche mise à jour
   * @throws {HttpException} Si la tâche n'existe pas ou si la sous-tâche n'existe pas
   * @throws {HttpException} Si la tâche est en cours ou terminee
   * @throws {HttpException} Si la sous-tâche n'est pas mise à jour
   */
  @Patch('/update/:task_id/:subtask_id')
  @Roles('OWNER', 'ADMIN')
  async updateSubtask(
    @Body() body: { description: string },
    @Param('task_id') task_id: string,
    @Param('subtask_id') subtask_id: string,
    @Query('project_id') project_id: string,
  ) {
    const task = await this.taskService.getTaskById(task_id, project_id);

    if (!task) {
      throw new HttpException('tache non trouvee', HttpStatus.BAD_REQUEST);
    }

    if (task.statuts !== 'TODO' && task.statuts !== 'BACKLOG') {
      throw new HttpException(
        'tache en cours ou terminee, impossible de mettre a jour la sous-tache',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!body.description) {
      throw new HttpException('description manquante', HttpStatus.BAD_REQUEST);
    }

    const subtask: boolean = await this.subtaskService.updateSubtask(
      task_id,
      subtask_id,
      {
        description: body.description,
      },
    );

    if (!subtask) {
      throw new HttpException(
        'sous-tache non mise a jour',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'sous-tache mise a jour avec success',
    };
  }

  /**
   * Met à jour le statut d'une sous-tâche en fonction de son ID et de l'ID de la tâche liée.
   * @param {iAuthentificatedRequest} request La requête HTTP authentifiée
   * @param {UpdateSubtaskDto} body Les informations de la sous-tâche à mettre à jour
   * @param {string} task_id L'ID de la tâche liée à la sous-tâche
   * @param {string} subtask_id L'ID de la sous-tâche à mettre à jour
   * @param {string} project_id L'ID du projet lié à la tâche
   * @returns {Promise<{ result: string }>} Le statut de la sous-tâche mise à jour
   * @throws {HttpException} Si la tâche n'existe pas ou si la sous-tâche n'existe pas
   * @throws {HttpException} Si la tâche est en cours ou terminee
   * @throws {HttpException} Si la sous-tâche n'est pas mise à jour
   * @throws {HttpException} Si l'utilisateur n'a pas le droit de modifier la tâche
   */
  @Patch('/finish/:task_id/:subtask_id')
  @Roles('OWNER', 'ADMIN')
  async finishSubtask(
    @Req() request: iAuthentificatedRequest,
    @Body() body: { is_done: boolean },
    @Param('task_id') task_id: string,
    @Param('subtask_id') subtask_id: string,
    @Query('project_id') project_id: string,
  ) {
    const task = await this.taskService.getTaskById(task_id, project_id);
    const user_id = request.user.userId;

    if (!task) {
      throw new HttpException('tache non trouvee', HttpStatus.BAD_REQUEST);
    }

    if (task.statuts !== 'ON_GOING') {
      throw new HttpException(
        'la tache dois être en cours pour changer son etat',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!task.user_assigned?.some((user) => user.user.id === user_id)) {
      throw new HttpException(
        "vous n'avez pas le droit de modifier la tache",
        HttpStatus.BAD_REQUEST,
      );
    }

    const subtask: boolean = await this.subtaskService.updateSubtask(
      task_id,
      subtask_id,
      {
        is_done: body.is_done,
      },
    );

    if (!subtask) {
      throw new HttpException(
        'sous-tache non mise a jour',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'statuts de sous-tache mise a jour avec success',
    };
  }
}
