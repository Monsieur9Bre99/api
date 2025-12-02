import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  AccessTokenGuard,
  iAuthentificatedRequest,
} from '../../core/guard/authentification.guard';
import {
  iUserOutsideProject,
  iUserProjectList,
} from 'src/core/interface/user.interface';

@Controller('user')
@UseGuards(AccessTokenGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Récupère tous les utilisateurs en dehors du projet
   *
   * @param {string} project_id - l'ID du projet
   * @returns {Promise<{ result: { message: string; users: iUserOutsideProject[] } }>} un objet contenant le message de récupération et la liste des utilisateurs en dehors du projet
   * @throws {HttpException} HttpException - si la récupération des utilisateurs échoue
   */
  @Get('/all')
  @HttpCode(200)
  async getAllUsers(
    @Query('project_id') project_id: string,
  ): Promise<{ result: { message: string; users: iUserOutsideProject[] } }> {
    const usersData: iUserOutsideProject[] =
      await this.userService.getAllUsers(project_id);

    if (!usersData) {
      throw new HttpException(
        'impossible de récupérer les utilisateurs',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (usersData.length === 0) {
      return {
        result: {
          message: 'aucun utilisateur en dehors du projet trouvé',
          users: usersData,
        },
      };
    }

    return {
      result: {
        message: 'récupération de tous les utilisateurs en dehors du projet',
        users: usersData,
      },
    };
  }

  /**
   * Récupère l'utilisateur et sa liste de projet
   *
   * @returns {Promise<{ result: { message: string; user: iUserProjectList } }>} un objet contenant le message de récupération et l'utilisateur avec sa liste de projet
   * @throws {HttpException} HttpException - si la récupération de l'utilisateur et de sa liste de projet échoue
   */
  @Get('/')
  @HttpCode(200)
  async getUser(
    @Req() request: iAuthentificatedRequest,
  ): Promise<{ result: { message: string; user: iUserProjectList } }> {
    const user_id: string = request.user.userId;
    const userData: iUserProjectList | null =
      await this.userService.getProjectList(user_id);

    if (!userData) {
      throw new HttpException(
        'impossible de créer le projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userData.projects.length === 0) {
      return {
        result: { message: "vous n'êtes sur aucun projet", user: userData },
      };
    }

    return {
      result: {
        message: "recuperation de l'utilisateur et de ça liste de projet",
        user: userData,
      },
    };
  }
}
