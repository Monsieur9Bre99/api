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
  Req,
} from '@nestjs/common';
import { MemberService } from './member.service';
import {
  AccessTokenGuard,
  iAuthentificatedRequest,
} from '../../core/guard/authentification.guard';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { AddMemberDto } from './dto/member.create.dto';
import { formatProjectMemberList } from '../../core/utils/formatData..func';
import {
  iProjectMember,
  iRequestProjectMemberFormatted,
} from 'src/core/interface/member.interface';
import { MemberRole, Project_member } from '@prisma/client';
import { EventService } from '../event/event.service';
import { ProjectService } from '../project/project.service';

@Controller('member')
@UseGuards(AccessTokenGuard, RoleGuard)
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly eventService: EventService,
    private projectService: ProjectService,
  ) {}

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
    const project = await this.projectService.getProjectById(project_id);

    if (!project) {
      throw new HttpException('projet inexistant', HttpStatus.NOT_FOUND);
    }

    const addMember: { count: number } | null =
      await this.memberService.addMemberToProject(project_id, body.users);

    if (!addMember) {
      throw new HttpException(
        "impossible d'ajouter des membres au projet",
        HttpStatus.BAD_REQUEST,
      );
    }

    await Promise.all(
      body.users.map((user) =>
        this.eventService.send('notification.create', {
          user_id: user.user_id,
          category: 'InvitationToProject',
          variables: {
            project_title: project.title,
            project_id: project_id,
          },
        }),
      ),
    );

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
      members: iRequestProjectMemberFormatted[];
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
    @Query('project_id') project_id: string,
    @Query('user_id') user_id: string,
  ): Promise<{ result: string }> {
    const deletedMember: Project_member | null =
      await this.memberService.deleteMember(project_id, user_id);

    if (!deletedMember) {
      throw new HttpException(
        'impossible de supprimer le membre du projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'membre supprimé du projet' };
  }

  @Delete('/leave/')
  @HttpCode(200)
  @Roles('ADMIN', 'COLLAB', 'GUEST')
  async leaveProject(
    @Req() req: iAuthentificatedRequest,
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const user_id = req.user.userId;

    const leave = await this.memberService.deleteMember(project_id, user_id);

    if (!leave) {
      throw new HttpException(
        'impossible de quitter le projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'projet quitter avec succès' };
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
  ): Promise<{ result: string }> {
    const updatedMembers: iProjectMember[] =
      await this.memberService.updateProjectMemberRole(project_id, body.users);

    if (!updatedMembers) {
      throw new HttpException(
        'impossible de mettre à jour le rôle des membres',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'membres du projet mis a jour',
    };
  }

  /**
   * Accepte une invitation d'un projet.
   *
   * @param req La requête authentifiée.
   * @param project_id L'ID du projet.
   * @returns Un objet contenant le message de succès.
   * @throws {HttpException} Si l'invitation n'a pas pu être acceptée.
   */
  @Patch('/accept_invitation')
  @HttpCode(200)
  @Roles('GUEST', 'COLLAB', 'ADMIN')
  async acceptInvitation(
    @Req() req: iAuthentificatedRequest,
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const user_id = req.user.userId;

    const accept = await this.memberService.acceptInvitation({
      user_id,
      project_id,
    });

    if (!accept) {
      throw new HttpException(
        "impossible d'accepter l'invitation",
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'invitation acceptée' };
  }

  @Delete('/decline_invitation')
  @HttpCode(200)
  @Roles('GUEST', 'COLLAB', 'ADMIN')
  async declineInvitation(
    @Req() req: iAuthentificatedRequest,
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const user_id = req.user.userId;

    const decline = await this.memberService.declineInvitation({
      user_id,
      project_id,
    });

    if (!decline) {
      throw new HttpException(
        "impossible de refuser l'invitation",
        HttpStatus.BAD_REQUEST,
      );
    }

    return { result: 'invitation refusée' };
  }
}
