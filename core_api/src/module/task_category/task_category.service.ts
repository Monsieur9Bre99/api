import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTaskCategoryDto } from './dto/create-task_category.dto';
import { iTaskCategories } from '../../core/interface/task.interface';
import { UpdateTaskCategoryDto } from './dto/update-task_category.dto';

@Injectable()
export class TaskCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée une nouvelle catégorie de tâche avec les informations données en paramètre
   * @param {CreateTaskCategoryDto} data Les informations de la catégorie de tâche à créer
   * @param {string} project_id L'ID du projet auquel la catégorie de tâche sera liée
   * @returns {Promise<iTaskCategories>} La catégorie de tâche créée
   */
  async createCategory(
    data: CreateTaskCategoryDto,
    project_id: string,
  ): Promise<iTaskCategories> {
    return this.prisma.task_category.create({
      data: { title: data.title, project_id: project_id },
      select: { id: true, title: true },
    });
  }

  /**
   * Récupère la liste des catégories de tâches liées à un projet
   * @param {string} project_id L'ID du projet
   * @returns {Promise<iTaskCategories[]>} La liste des catégories de tâches liées au projet
   */
  async getAllCategories(project_id: string): Promise<iTaskCategories[]> {
    return this.prisma.task_category.findMany({
      where: { project_id: project_id },
      select: { id: true, title: true },
    });
  }

  async isCategoryExist(
    category_id: string,
    project_id: string,
  ): Promise<boolean> {
    const category = await this.prisma.task_category.findUnique({
      where: { id: category_id, project_id: project_id },
    });

    return category ? true : false;
  }

  /**
   * Supprime une catégorie de tâche en fonction de son ID.
   *
   * @param {string} category_id L'ID de la catégorie de tâche à supprimer
   * @returns {Promise<boolean>} true si la catégorie de tâche a été supprimée, false sinon
   */
  async deleteCategory(category_id: string): Promise<boolean> {
    const deletedCategory = await this.prisma.task_category.delete({
      where: { id: category_id },
    });

    if (!deletedCategory) return false;
    return true;
  }

  /**
   * Met à jour une catégorie de tâche en fonction de son ID et de nouvelles informations.
   * @param {UpdateTaskCategoryDto} categorie Les nouvelles informations de la catégorie de tâche à mettre à jour
   * @returns {Promise<iTaskCategories>} La catégorie de tâche mise à jour
   */
  async updateCategory(
    categorie: UpdateTaskCategoryDto,
    category_id: string,
  ): Promise<iTaskCategories> {
    return this.prisma.task_category.update({
      where: { id: category_id },
      data: { title: categorie.title },
      select: { id: true, title: true },
    });
  }
}
