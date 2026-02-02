import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserCreateDto } from './dto/createUser.dto';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import {
  iUser,
  iUserOutsideProject,
  iUserProjectList,
} from 'src/core/interface/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

type tUserSelect = {
  [K in keyof User]?: boolean;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retourne un utilisateur en fonction d'une clé unique (UUID v4, email ou nom d'utilisateur).
   *
   * @param {string} info - La clé unique de l'utilisateur.
   * @param {tUserSelect} [selectedData] - La clé unique de l'utilisateur à sélectionner.
   * @returns {Promise<User | null>} - L'utilisateur correspondant à la clé unique ou null si aucun utilisateur n'a été trouvé.
   */
  async getByUniqueKey(
    info: string,
    selectedData?: tUserSelect,
  ): Promise<User | null> {
    const select = selectedData;

    // UUID v4
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        info,
      )
    ) {
      return this.prisma.user.findUnique({ where: { id: info }, select });
    }

    // Email
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(info)) {
      return this.prisma.user.findUnique({ where: { email: info }, select });
    }

    return this.prisma.user.findUnique({ where: { username: info }, select });
  }

  /**
   * Crée un utilisateur avec les informations données en paramètre
   * Le mot de passe est hashé avec l'algorithme Argon2
   * @param {UserCreateDto} data Les informations de l'utilisateur à créer
   * @returns {Promise<iUser>} L'utilisateur créé
   */
  async createUser(data: UserCreateDto): Promise<iUser> {
    data.password = await argon2.hash(data.password, { hashLength: 50 });
    return this.prisma.user.create({
      data: data,
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
      },
    });
  }

  /**
   * Met à jour un utilisateur existant
   * @param {string} userid L'ID de l'utilisateur à mettre à jour
   * @param {UpdateUserDto} data Les données à mettre à jour
   * @returns {Promise<iUser>} L'utilisateur mis à jour
   */
  async updateUser(userid: string, data: UpdateUserDto): Promise<iUser> {
    return this.prisma.user.update({
      where: { id: userid },
      data: data,
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
      },
    });
  }

  /**
   * Récupère la liste des utilisateurs qui ne sont pas dans le projet
   * @param {string} project_id L'ID du projet
   * @returns {Promise<iUserOutsideProject[]>} La liste des utilisateurs qui ne sont pas dans le projet
   */
  async getAllUsers(project_id: string): Promise<iUserOutsideProject[]> {
    return this.prisma.user.findMany({
      where: {
        is_confirmed: true,
        projects: {
          none: {
            project_id: project_id,
          },
        },
      },
      select: {
        id: true,
        username: true,
      },
    });
  }

  /**
   * Retourne la liste des projets d'un utilisateur
   * @param {string} user_id L'ID de l'utilisateur
   * @returns {Promise<iUserProjectList | null>} La liste des projets de l'utilisateur, ou null si l'utilisateur n'existe pas
   */
  async getProjectList(user_id: string): Promise<iUserProjectList | null> {
    return this.prisma.user.findFirst({
      where: { id: user_id },
      select: {
        firstname: true,
        lastname: true,
        projects: {
          select: {
            is_confirmed: true,
            role: true,
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                date_start: true,
                date_end: true,
              },
            },
          },
        },
      },
    });
  }
}
