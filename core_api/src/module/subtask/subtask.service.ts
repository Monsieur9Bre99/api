import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { iSubtask } from 'src/core/interface/task.interface';
import { CreateSubtaskDto } from './dto/create_subtask.dto';
import { UpdateSubtaskDto } from './dto/update_subtask.dto';

@Injectable()
export class SubtaskService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle sous-tâche liée à une tâche.
   * @param {string} task_id L'ID de la tâche liée à la sous-tâche
   * @param {CreateSubtaskDto} data Les informations de la sous-tâche à créer
   * @returns {Promise<iSubtask>} La sous-tâche créée
   */
  async createSubtask(
    task_id: string,
    data: CreateSubtaskDto,
  ): Promise<iSubtask> {
    return this.prisma.subtask.create({
      data: {
        task_id: task_id,
        description: data.description,
        is_done: false,
      },
      select: { id: true, description: true, is_done: true },
    });
  }

  /**
   * Récupère la liste des sous-tâches liées à une tâche.
   * @param {string} task_id L'ID de la tâche liée aux sous-tâches
   * @returns {Promise<iSubtask[]>} La liste des sous-tâches liées à la tâche
   */
  async getSubtasks(task_id: string): Promise<iSubtask[]> {
    return this.prisma.subtask.findMany({
      where: { task_id: task_id },
      select: { id: true, description: true, is_done: true },
    });
  }

  async deleteSubtask(task_id: string, subtask_id: string): Promise<boolean> {
    const subtask = await this.prisma.subtask.delete({
      where: { id: subtask_id, task_id: task_id },
    });
    return subtask ? true : false;
  }

  /**
   * Met à jour une sous-tâche en fonction de son ID et de l'ID de la tâche liée.
   * @param {string} task_id L'ID de la tâche liée à la sous-tâche
   * @param {string} subtask_id L'ID de la sous-tâche à mettre à jour
   * @param {UpdateSubtaskDto} data Les données à mettre à jour
   * @returns {Promise<boolean>} true si la sous-tâche a été mise à jour, false sinon
   */
  async updateSubtask(
    task_id: string,
    subtask_id: string,
    data: UpdateSubtaskDto,
  ): Promise<boolean> {
    const subtask = await this.prisma.subtask.update({
      where: { id: subtask_id, task_id: task_id },
      data: { description: data.description, is_done: data.is_done },
    });
    return subtask ? true : false;
  }
}
