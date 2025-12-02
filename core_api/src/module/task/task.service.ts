import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateUsertaskDto } from '../user_task/dto/create_usertask.dto';
import { CreateSubtaskDto } from '../subtask/dto/create_subtask.dto';
import { iTaskData } from '../../core/interface/task.interface';
import { UpdateTaskDto } from './dto/update_task.dto';
import { TaskStatuts } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle tâche avec les informations données en paramètre
   *
   * @param {string} project_id L'ID du projet auquel la tâche sera liée
   * @param {CreateTaskDto} task Les informations de la tâche à créer
   * @param {CreateUsertaskDto[]} users Les utilisateurs assignés à la tâche
   * @param {CreateSubtaskDto[]} [subtasks] Les sous-tâches liées à la tâche
   * @returns {Promise<iTaskData>} La tâche créée
   */
  async createTask(
    project_id: string,
    task: CreateTaskDto,
    users: CreateUsertaskDto[],
    subtasks?: CreateSubtaskDto[],
  ): Promise<iTaskData> {
    return this.prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        statuts: 'BACKLOG',
        image: task.image || '',
        delay: task.delay,
        task_category_id: task.task_category_id,
        project_id: project_id,
        user_assigned: {
          create: users.map((user) => ({ user_id: user.user_id })),
        },
        subtasks: {
          create: subtasks?.map((subtask) => ({
            description: subtask.description,
            is_done: false,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        statuts: true,
        image: true,
        date_start: true,
        delay: true,
        worked_time: true,
        date_end: true,
        task_category: { select: { id: true, title: true } },
        user_assigned: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
        subtasks: {
          select: {
            id: true,
            description: true,
            is_done: true,
          },
        },
      },
    });
  }

  /**
   * Récupère la liste des tâches liées à un projet
   * @param {string} project_id L'ID du projet
   * @returns {Promise<iTaskData[]>} La liste des tâches liées au projet
   */
  async getTasksByProject(project_id: string): Promise<iTaskData[]> {
    return this.prisma.task.findMany({
      where: { project_id: project_id },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        statuts: true,
        image: true,
        date_start: true,
        delay: true,
        worked_time: true,
        date_end: true,
        task_category: { select: { id: true, title: true } },
        user_assigned: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
        subtasks: {
          select: {
            id: true,
            description: true,
            is_done: true,
          },
        },
      },
    });
  }

  /**
   * Récupère une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} task_id L'ID de la tâche à récupérer
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @returns {Promise<iTaskData | null>} La tâche correspondant à l'ID, ou null si aucune tâche n'a été trouvée
   */
  async getTaskById(
    task_id: string,
    project_id: string,
  ): Promise<iTaskData | null> {
    return this.prisma.task.findUnique({
      where: { id: task_id, project_id: project_id },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        statuts: true,
        image: true,
        date_start: true,
        delay: true,
        worked_time: true,
        date_end: true,
        task_category: { select: { id: true, title: true } },
        user_assigned: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
        subtasks: {
          select: {
            id: true,
            description: true,
            is_done: true,
          },
        },
      },
    });
  }

  /**
   * Supprime une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} task_id L'ID de la tâche à supprimer
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @returns {Promise<null | { image: string } | string>} null si aucune tâche n'a été trouvée, { image: string } si la tâche possède une image, ou l'ID de la tâche si la suppression a réussi
   */
  async deleteTask(
    task_id: string,
    project_id: string,
  ): Promise<null | { image: string } | string> {
    const task = await this.prisma.task.delete({
      where: { id: task_id, project_id: project_id },
      select: { id: true, image: true },
    });
    if (!task) {
      return null;
    }
    if (task.image) {
      return { image: task.image };
    }
    return task.id;
  }

  /**
   * Met à jour une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @param {string} project_id L'ID du projet auquel la tâche est liée
   * @param {UpdateTaskDto} data Les données à mettre à jour
   * @returns {Promise<boolean>} true si la tâche a été mise à jour, false sinon
   */
  async updateTask(
    task_id: string,
    project_id: string,
    data: UpdateTaskDto,
  ): Promise<boolean> {
    const task = await this.prisma.task.update({
      where: {
        id: task_id,
        project_id: project_id,
      },
      data: { ...data },
    });
    return task ? true : false;
  }

  /**
   * Réinitialise une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} project_id L'ID du projet
   * @param {string} task_id L'ID de la tâche à réinitialiser
   * @param {TaskStatuts} data Les statuts de la tâche à réinitialiser
   * @returns {Promise<boolean>} true si la tâche a été réinitialisée, false sinon
   */
  async resetTask(
    project_id: string,
    task_id: string,
    data: TaskStatuts,
  ): Promise<boolean> {
    const task = await this.prisma.task.update({
      where: { id: task_id, project_id: project_id },
      data: {
        statuts: data,
        date_start: null,
        date_end: null,
        worked_time: 0,
        subtasks: {
          updateMany: {
            where: { is_done: true },
            data: { is_done: false },
          },
        },
      },
    });
    return task ? true : false;
  }

  /**
   * Démarre une tâche en fonction de son ID et de l'ID du projet auquel elle est liée
   * @param {string} project_id L'ID du projet
   * @param {string} task_id L'ID de la tâche à démarrer
   * @returns {Promise<boolean>} true si la tâche a été démarrée, false sinon
   */
  async startTask(project_id: string, task_id: string): Promise<boolean> {
    const task = await this.prisma.task.update({
      where: {
        id: task_id,
        project_id: project_id,
      },
      data: { statuts: 'ON_GOING', date_start: new Date() },
    });
    return task ? true : false;
  }

  /**
   * Met à jour le statut d'une tâche en 'ON_TEST'
   * @param {string} project_id L'ID du projet
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @returns {Promise<boolean>} true si la tâche a été mise à jour, false sinon
   */
  async testTask(project_id: string, task_id: string): Promise<boolean> {
    const task = await this.prisma.task.update({
      where: {
        id: task_id,
        project_id: project_id,
      },
      data: { statuts: 'ON_TEST' },
    });
    return task ? true : false;
  }

  /**
   * Met à jour le statut d'une tâche en 'FINISHED' et fixe la date de fin à l'heure actuelle
   * @param {string} project_id L'ID du projet
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @returns {Promise<boolean>} true si la tâche a été mise à jour, false sinon
   */
  async endTask(project_id: string, task_id: string): Promise<boolean> {
    const task = await this.prisma.task.update({
      where: {
        id: task_id,
        project_id: project_id,
      },
      data: { statuts: 'FINISHED', date_end: new Date() },
    });
    return task ? true : false;
  }

  /**
   * Met à jour le temps de travail d'une tâche
   * @param {string} project_id L'ID du projet
   * @param {string} task_id L'ID de la tâche à mettre à jour
   * @param {number} work_time Le temps de travail à ajouter
   * @returns {Promise<boolean>} true si la tâche a été mise à jour, false sinon
   */
  async addWorkTime(
    project_id: string,
    task_id: string,
    work_time: number,
  ): Promise<boolean> {
    const task = await this.prisma.task.update({
      where: {
        id: task_id,
        project_id: project_id,
      },
      data: { worked_time: work_time },
    });
    return task ? true : false;
  }
}
