import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MemberRole, Project_member } from '@prisma/client';
import { AddMemberDto } from './dto/member.create.dto';
import { iProjectMember } from 'src/core/interface/member.interface';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ajoute des membres à un projet.
   * @param project_id - L'ID du projet.
   * @param users - La liste des membres à ajouter.
   * @returns Un objet contenant le nombre de membres ajoutés si l'opération est un succès, sinon null.
   */
  async addMemberToProject(
    project_id: string,
    users: AddMemberDto[],
  ): Promise<{ count: number } | null> {
    const data = users.map((user) => ({
      user_id: user.user_id,
      project_id,
      is_confirmed: false,
      role: user.role || 'GUEST',
    }));
    const newMembers = await this.prisma.project_member.createMany({
      data: data,
      skipDuplicates: true,
    });
    if (newMembers.count === 0) return null;
    return newMembers;
  }

  /**
   * Retourne le rôle d'un membre dans un projet.
   * @param user_id - L'ID de l'utilisateur.
   * @param project_id - L'ID du projet.
   * @returns Un objet contenant le rôle du membre si l'utilisateur est dans le projet, sinon null.
   */
  async getOneProjectMemberRole(
    user_id: string,
    project_id: string,
  ): Promise<{ role: MemberRole } | null> {
    return this.prisma.project_member.findFirst({
      where: { project_id: project_id, user_id: user_id },
      select: { role: true },
    });
  }

  /**
   * Récupère la liste des membres d'un projet.
   * @param {string} project_id - L'ID du projet.
   * @returns {Promise<iProjectMember[]>} La liste des membres du projet.
   */
  async getProjectMembers(project_id: string): Promise<iProjectMember[]> {
    return this.prisma.project_member.findMany({
      where: { project_id },
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
    });
  }

  /**
   * Vérifie si un utilisateur est membre d'un projet.
   * @param {string} user_id - L'ID de l'utilisateur.
   * @param {string} project_id - L'ID du projet.
   * @returns {Promise<boolean>} True si l'utilisateur est membre du projet, false sinon.
   */
  async isMemberOfProject(
    user_id: string,
    project_id: string,
  ): Promise<boolean> {
    const member = await this.prisma.project_member.findFirst({
      where: { project_id: project_id, user_id: user_id },
    });
    return member ? true : false;
  }

  /**
   * Supprime un membre d'un projet.
   * @param project_id - L'ID du projet.
   * @param user_id - L'ID de l'utilisateur.
   * @returns Le membre supprimé, ou null si aucun membre n'a été trouvé.
   */
  async deleteMember(
    project_id: string,
    user_id: string,
  ): Promise<Project_member | null> {
    return this.prisma.project_member.delete({
      where: { user_project_id: { user_id, project_id } },
    });
  }

  /**
   * Met à jour le rôle de plusieurs membres dans un projet.
   * Cette fonction utilise une transaction pour s'assurer que toutes les mises à jour sont effectuées ou que toutes sont annulées.
   * @param project_id - L'ID du projet.
   * @param data - Un tableau d'objets contenant l'ID de l'utilisateur et le rôle à mettre à jour.
   * @returns Un tableau contenant les informations des membres mis à jour.
   */
  async updateProjectMemberRole(
    project_id: string,
    data: { user_id: string; role: MemberRole }[],
  ): Promise<iProjectMember[]> {
    return this.prisma.$transaction(
      data.map((item) =>
        this.prisma.project_member.update({
          where: {
            user_project_id: { user_id: item.user_id, project_id },
            NOT: { role: 'OWNER' },
          },
          data: { role: item.role },
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
        }),
      ),
    );
  }

  async acceptInvitation(data: {
    user_id: string;
    project_id: string;
  }): Promise<Project_member | null> {
    return this.prisma.project_member.update({
      where: {
        user_project_id: { user_id: data.user_id, project_id: data.project_id },
        is_confirmed: false,
      },
      data: { is_confirmed: true },
    });
  }

  async declineInvitation(data: {
    user_id: string;
    project_id: string;
  }): Promise<Project_member | null> {
    return this.prisma.project_member.delete({
      where: {
        user_project_id: { user_id: data.user_id, project_id: data.project_id },
        is_confirmed: false,
      },
    });
  }
}
