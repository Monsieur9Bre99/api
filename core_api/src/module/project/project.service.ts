import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import {
  iDeleteProjectReturn,
  iProject,
  iProjectData,
} from 'src/core/interface/project.interface';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un nouveau projet avec les informations données en paramètre
   * @param {CreateProjectDto} data Les informations du projet à créer
   * @returns {Promise<iProject>} Le projet créé
   */
  async createProject(data: {
    project: CreateProjectDto;
    creator: string;
  }): Promise<iProject> {
    return this.prisma.project.create({
      data: {
        ...data.project,
        members: {
          create: { user_id: data.creator, role: 'OWNER', is_confirmed: true },
        },
      },
    });
  }

  /**
   * Récupère un projet en fonction de son ID
   * @param {string} project_id L'ID du projet à récupérer
   * @returns {Promise<iProjectData | null>} toutes les données du projet correspondant à l'ID, ou null si aucun projet n'a été trouvé
   */
  async getProjectById(project_id: string): Promise<iProjectData | null> {
    return this.prisma.project.findUnique({
      where: { id: project_id },
      select: {
        id: true,
        title: true,
        description: true,
        date_start: true,
        date_end: true,
        task_categories: { select: { id: true, title: true } },
        tasks: {
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
            subtasks: {
              select: { id: true, description: true, is_done: true },
            },
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
          },
        },
        members: {
          select: {
            role: true,
            is_confirmed: true,
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Supprime un projet ainsi que tous ses membres, catégories de tâches et tâches associés.
   * @param {string} project_id L'ID du projet à supprimer
   * @returns {Promise<iDeleteProjectReturn | null>} Les informations du projet supprimé, ou null si aucun projet n'a été trouvé
   */
  async deleteProject(
    project_id: string,
  ): Promise<iDeleteProjectReturn | null> {
    return this.prisma.project.delete({
      where: { id: project_id },
      include: { members: true, task_categories: true, tasks: true },
    });
  }

  /**
   * Met à jour un projet existant
   * @param {string} project_id L'ID du projet à mettre à jour
   * @param {UpdateProjectDto} data Les données à mettre à jour
   * @returns {Promise<iProject>} Le projet mis à jour
   */
  async updateProject(
    project_id: string,
    data: UpdateProjectDto,
  ): Promise<iProject> {
    return this.prisma.project.update({
      where: { id: project_id },
      data: { ...data },
      select: {
        id: true,
        title: true,
        description: true,
        date_start: true,
        date_end: true,
      },
    });
  }
}
