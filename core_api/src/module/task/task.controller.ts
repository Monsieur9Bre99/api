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
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import {
  AccessTokenGuard,
  iAuthentificatedRequest,
} from '../../core/guard/authentification.guard';
import * as fs from 'fs';
import * as path from 'path';
import { TaskService } from './task.service';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { ImageInterceptor } from '../../core/interceptors/image.interceptor';
import { CreateTaskDto, CreateTaskPayload } from './dto/create-task.dto';
import { CreateUsertaskDto } from '../user_task/dto/create_usertask.dto';
import { CreateSubtaskDto } from '../subtask/dto/create_subtask.dto';
import { MemberService } from '../member/member.service';
import { TaskCategoryService } from '../task_category/task_category.service';
import { iTaskData } from 'src/core/interface/task.interface';
import { UpdateTaskDto } from './dto/update_task.dto';
import { TaskStatuts } from '@prisma/client';

@Controller('task')
@UseGuards(AccessTokenGuard, RoleGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly memberService: MemberService,
    private readonly taskCategoryService: TaskCategoryService,
  ) {}

  /**
   * Crée une nouvelle tâche avec les informations données en paramètre
   * @param {CreateTaskPayload} body Les informations de la tâche à créer
   * @param {iAuthentificatedRequest} request La requête HTTP authentifiée
   * @param {string} project_id L'ID du projet auquel la tâche sera liée
   * @param {Express.Multer.File} image? Le fichier image uploadé (optional)
   * @returns {Promise<{ result: { message: string; task: any } >} La tâche créée
   */
  @Post('/new_task')
  @ImageInterceptor('image')
  @Roles('OWNER', 'ADMIN')
  async createTask(
    @Body()
    body: CreateTaskPayload,
    @Req() request: iAuthentificatedRequest,
    @Query('project_id') project_id: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<{ result: { message: string; task: any } }> {
    const isCategoryValid = await this.taskCategoryService.isCategoryExist(
      body.task_category_id,
      project_id,
    );

    if (!isCategoryValid) {
      throw new HttpException(
        "la categorie n'existe pas dans ce projet",
        HttpStatus.BAD_REQUEST,
      );
    }

    const imgUrl: string = image
      ? `${request.protocol}://${request.get('host')}/public/uploads/${image?.filename}`
      : '';

    const task: CreateTaskDto = {
      title: body.title,
      description: body.description,
      priority: body.priority,
      image: imgUrl,
      delay: body.delay,
      task_category_id: body.task_category_id,
    };

    const userIds: string[] = body.users
      ? Array.isArray(body.users)
        ? body.users
        : [body.users]
      : [];

    const users: CreateUsertaskDto[] = (
      await Promise.all(
        userIds.map(async (user_id) => {
          const isMember = await this.memberService.isMemberOfProject(
            user_id,
            project_id,
          );
          if (isMember) {
            return { user_id } as CreateUsertaskDto;
          }
          return null;
        }),
      )
    ).filter((u): u is CreateUsertaskDto => u !== null);

    if (users.length === 0) {
      throw new HttpException(
        'Aucun membre a assigner à la tâche ou les membres ne font pas partie du projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    const subtasks: CreateSubtaskDto[] | undefined = body.subtasks
      ? body.subtasks instanceof Array
        ? body.subtasks.map((description) => ({
            description: description,
          }))
        : [{ description: body.subtasks }]
      : undefined;

    const createdTask = await this.taskService.createTask(
      project_id,
      task,
      users,
      subtasks,
    );

    if (!createdTask) {
      throw new HttpException(
        'Erreur lors de la création de la tâche',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      result: { message: 'tâche créée avec succès', task: createdTask },
    };
  }
  
  /**
   * Récupère la liste des tâches liées à un projet
   * @param {string} project_id L'ID du projet
   * @returns {Promise<{ result: string } | { result: { message: string; taskList: iTaskData[] } }>}
   * La liste des tâches liées au projet, ou un message d'erreur si aucune tâche n'a été trouvée
  */
  @Get('/')
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getTasksByProject(
    @Query('project_id') project_id: string,
  ): Promise<
    { result: string } | { result: { message: string; taskList: iTaskData[] } }
  > {
    const taskList: iTaskData[] =
      await this.taskService.getTasksByProject(project_id);

    if (!taskList) {
      throw new HttpException(
        'Erreur lors de la récupération des tâches',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (taskList.length === 0) {
      return {
        result: 'aucune tâche trouvée pour ce projet',
      };
    }

    return {
      result: {
        message: 'recuperation des tâches avec succès',
        taskList: taskList,
      },
    };
  }

  /**
   * Récupère une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} project_id L'ID du projet
   * @param {string} task_id L'ID de la tâche à récupérer
   * @returns {Promise<{ result: {message: string; task: iTaskData } >} La tâche correspondant à l'ID, ou null si aucune tâche n'a été trouvée
  */
  @Get('/:task_id')
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getTaskById(
    @Query('project_id') project_id: string,
    @Param('task_id') task_id: string,
  ): Promise<{ result: { message: string; task: iTaskData } }> {
    const task: iTaskData | null = await this.taskService.getTaskById(
      task_id,
      project_id,
    );

    if (!task) {
      throw new HttpException(
        "La tâche n'existe pas ou ne peut pas être trouvée",
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: { message: 'tâche récupérée avec succès', task: task },
    };
  }

  /**
   * Supprime une tâche en fonction de son ID et du projet auquel elle est liée.
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @param {string} task_id L'ID de la tâche à supprimer
   * @returns {Promise<{ result: string }>} Le résultat de la suppression de la tâche
   */
  @Delete('/:task_id')
  @Roles('OWNER')
  @HttpCode(200)
  async deleteTask(
    @Query('project_id') project_id: string,
    @Param('task_id') task_id: string,
  ): Promise<{ result: string }> {
    const task: { image: string } | string | null =
      await this.taskService.deleteTask(task_id, project_id);

    if (!task) {
      throw new HttpException(
        "La tâche n'existe pas ou ne peut pas être supprimée",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (typeof task === 'object' && task.image) {
      const imgUrl = task.image;
      const filename = imgUrl.split('/').pop();
      const filePath = path.join(
        process.cwd(),
        'public',
        'uploads',
        `${filename}`,
      );
      console.log(imgUrl);
      console.log(filename);
      console.log(filePath);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    return { result: 'tâhe supprimée avec succès' };
  }

  /**
   * Met à jour une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {UpdateTaskDto} body Les informations de la tâche à mettre à jour
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @param {Express.Multer.File} image? L'image de la tâche si elle doit être mise à jour
   * @returns {Promise<{ result: string }>} La tâche mise à jour, ou un message d'erreur si aucune tâche n'a été trouvée
   */
  @Patch('/:task_id')
  @ImageInterceptor('image')
  @Roles('OWNER', 'ADMIN')
  @HttpCode(200)
  async updateTask(
    @Body() body: UpdateTaskDto,
    @Req() request: iAuthentificatedRequest,
    @Param('task_id') task_id: string,
    @Query('project_id') project_id: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<{ result: string }> {
    const existingTask: iTaskData | null = await this.taskService.getTaskById(
      task_id,
      project_id,
    );

    if (!existingTask) {
      throw new HttpException(
        "La tâche n'existe pas ou ne peut pas être mise à jour",
        HttpStatus.BAD_REQUEST,
      );
    }

    let image_url: string = existingTask.image;

    if (image) {
      if (existingTask.image) {
        const filename: string | undefined = existingTask.image
          .split('/')
          .pop();
        const filePath: string = path.join(
          process.cwd(),
          'public',
          'uploads',
          `${filename}`,
        );
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      image_url = `${request.protocol}://${request.host}/public/uploads/${image.filename}`;
    }

    const task: UpdateTaskDto = {
      title: body.title || existingTask.title,
      description: body.description || existingTask.description || undefined,
      priority: body.priority || existingTask.priority,
      image: image_url,
      delay: body.delay || existingTask.delay,
      task_category_id: body.task_category_id || existingTask.task_category?.id,
    };

    const updatedTask: boolean = await this.taskService.updateTask(
      task_id,
      project_id,
      task,
    );

    if (!updatedTask) {
      throw new HttpException(
        "La tâche n'a pas pu être mise à jour",
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'tâche mise à jour avec succès' };
  }

  /**
   * Met à jour le statut d'une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @param {{ newStatuts: TaskStatuts }} body Les données à mettre à jour
   * @returns {Promise<{ result: string }>} true si la tâche a été mise à jour, false sinon
   */
  @Patch('/statuts/:task_id')
  @Roles('OWNER', 'ADMIN', 'COLLAB')
  @HttpCode(200)
  async updateTaskStatus(
    @Body() body: { newStatuts: TaskStatuts },
    @Req() request: iAuthentificatedRequest,
    @Param('task_id') task_id: string,
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const user_id: string = request.user.userId;
    const existingTask: iTaskData | null = await this.taskService.getTaskById(
      task_id,
      project_id,
    );

    if (!existingTask) {
      throw new HttpException(
        "La tâche n'existe pas ou ne peut pas avoir son statut mis à jour",
        HttpStatus.BAD_REQUEST,
      );
    }

    if (existingTask.statuts === body.newStatuts) {
      throw new HttpException(
        'Le statut de la tâche est deja celui choisi',
        HttpStatus.BAD_REQUEST,
      );
    }

    const isAssigned: boolean = existingTask.user_assigned
      ? existingTask.user_assigned.some((user) => user.user.id === user_id)
      : false;

    let updatedTask: boolean = false;

    switch (body.newStatuts) {
      case 'BACKLOG':
      case 'TODO':
        if (existingTask.statuts !== 'FINISHED') {
          updatedTask = await this.taskService.resetTask(
            project_id,
            task_id,
            body.newStatuts,
          );
        }
        break;

      case 'ON_GOING':
        if (
          isAssigned &&
          existingTask.subtasks?.every((subtask) => subtask.is_done !== true)
        ) {
          updatedTask = await this.taskService.startTask(project_id, task_id);
        }
        break;

      case 'ON_TEST':
        if (
          isAssigned &&
          existingTask.subtasks?.every((subtask) => subtask.is_done === true) &&
          existingTask.date_start !== null &&
          existingTask.statuts !== 'FINISHED'
        ) {
          updatedTask = await this.taskService.testTask(project_id, task_id);
        }
        break;

      case 'FINISHED':
        if (existingTask.statuts === 'ON_TEST') {
          updatedTask = await this.taskService.endTask(project_id, task_id);
        }
        break;
    }

    if (!updatedTask) {
      throw new HttpException(
        "La tâche n'a pas pu avoir son statut mis à jour",
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'statut de la tâche mis à jour avec succès' };
  }

  /**
   * Ajoute du temps de travail à une tâche
   * @param {Object} body Les données à mettre à jour
   * @param {iAuthentificatedRequest} request La requête authentifiée
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @returns {Promise<{ result: string }>} Le temps de travail mis à jour
   */
  @Patch('/work_on/:task_id')
  @Roles('OWNER', 'ADMIN', 'COLLAB')
  @HttpCode(200)
  async addWorkTime(
    @Body() body: { work_time: number },
    @Req() request: iAuthentificatedRequest,
    @Param('task_id') task_id: string,
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const user_id: string = request.user.userId;

    const existingTask: iTaskData | null = await this.taskService.getTaskById(
      task_id,
      project_id,
    );

    if (!existingTask) {
      throw new HttpException(
        "La tâche n'existe pas ou ne peut pas avoir son temps de travail mis à jour",
        HttpStatus.BAD_REQUEST,
      );
    }

    let work_on: boolean = false;

    if (
      existingTask.user_assigned?.some((user) => user.user.id === user_id) &&
      existingTask.statuts === 'ON_GOING'
    ) {
      const work_time = existingTask.worked_time + body.work_time;

      work_on = await this.taskService.addWorkTime(
        project_id,
        task_id,
        work_time,
      );
    }

    if (!work_on) {
      throw new HttpException(
        "Le temps de travail de la tâche n'a pas été mis à jour",
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'temps de travaille ajouter avec succès',
    };
  }
}
