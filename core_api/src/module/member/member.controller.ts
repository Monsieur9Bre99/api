import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpException,
  HttpStatus,
  UseGuards,
  Query,
  Get,
  Delete,
  Patch,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { AccessTokenGuard } from '../../core/guard/authentification.guard';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { AddMemberDto } from './dto/member.create.dto';
import { formatProjectMemberList } from '../../core/utils/formatData..func';
import {
  iProjectMember,
  iRequestProjectMemberFormatted,
} from 'src/core/interface/member.interface';
import { MemberRole, Project_member } from '@prisma/client';

@Controller('member')
@UseGuards(AccessTokenGuard, RoleGuard)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /**
   * Ajoute des membres au projet.
   *
   * @param {AddMemberDto[]} body.users - La liste des utilisateurs à ajouter.
   * @param {string} project_id - L'ID du projet.
   * @returns {Promise<{ result: string }>}
   * @throws {HttpException} - Si l'ajout des membres échoue.
   */
  @Post('/add')
  @HttpCode(200)
  @Roles('OWNER', 'ADMIN')
  async addMemberToProject(
    @Body() body: { users: AddMemberDto[] },
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const addMember: { count: number } | null =
      await this.memberService.addMemberToProject(project_id, body.users);

    if (!addMember) {
      throw new HttpException(
        "impossible d'ajouter des membres au projet",
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'invitation envoyer' };
  }

  /**
   * Récupère la liste des membres du projet.
   *
   * @param {string} project_id - L'ID du projet.
   * @returns {Promise<{ result: { message: string; members: iRequestProjectMemberFormatted[] | iProjectMember[] } }>}}
   * @throws {HttpException} - Si la récupération des membres du projet échoue.
   */
  @Get('/')
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getProjectMembers(@Query('project_id') project_id: string): Promise<{
    result: {
      message: string;
      members: iRequestProjectMemberFormatted[] | iProjectMember[];
    };
  }> {
    const members: iProjectMember[] =
      await this.memberService.getProjectMembers(project_id);

    if (!members) {
      throw new HttpException(
        'impossible de recuperer les membres du projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (members.length === 0) {
      return {
        result: {
          message: 'aucun membre trouver',
          members: members,
        },
      };
    }

    const memberList: iRequestProjectMemberFormatted[] =
      formatProjectMemberList(members);

    return {
      result: {
        message: 'membres du projet récupérés',
        members: memberList,
      },
    };
  }

  /**
   * Supprime un membre d'un projet.
   *
   * @param {string} body.user_id L'ID de l'utilisateur à supprimer.
   * @param {string} project_id L'ID du projet.
   * @returns {Promise<{ result: string }>}
   * @throws {HttpException} Si le membre n'a pas été trouvé.
   */
  @Delete('/delete')
  @HttpCode(200)
  @Roles('OWNER')
  async deleteProjectMember(
    @Body() body: { user_id: string },
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const deletedMember: Project_member | null =
      await this.memberService.deleteMember(project_id, body.user_id);

    if (!deletedMember) {
      throw new HttpException(
        'impossible de supprimer le membre du projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'membre supprimé du projet' };
  }

  /**
   * Met à jour le rôle des membres du projet.
   *
   * @param project_id L'ID du projet
   * @param body Les informations des membres à mettre à jour
   * @returns Les informations des membres mis à jour
   * @throws {HttpException} Si le projet n'a pas pu être mis à jour
   */
  @Patch('/update_role')
  @HttpCode(200)
  @Roles('OWNER', 'ADMIN')
  async updateProjectMemberRole(
    @Query('project_id') project_id: string,
    @Body() body: { users: { user_id: string; role: MemberRole }[] },
  ) {
    const updatedMembers: iProjectMember[] =
      await this.memberService.updateProjectMemberRole(project_id, body.users);

    if (!updatedMembers) {
      throw new HttpException(
        'impossible de mettre à jour le rôle des membres',
        HttpStatus.BAD_REQUEST,
      );
    }

    const members: iProjectMember[] =
      await this.memberService.getProjectMembers(project_id);

    if (!members) {
      throw new HttpException(
        'impossible de recuperer les membres du projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    const memberList: iRequestProjectMemberFormatted[] =
      formatProjectMemberList(members);

    return {
      result: {
        message: 'membres du projet mis a jour',
        members: memberList,
      },
    };
  }
}
