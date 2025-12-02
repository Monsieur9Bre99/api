import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';
import { iAuthentificatedRequest } from './authentification.guard';
import { MemberService } from '../../module/member/member.service';
import { MemberRole } from '@prisma/client';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private projectMemberService: MemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: string[] = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    const request: iAuthentificatedRequest = context
    .switchToHttp()
    .getRequest();
    
    const user_id: string = request.user.userId;
    const { project_id } = request.query;

    if (!user_id) {
      throw new UnauthorizedException('authentification requise');
    }

    if (!project_id) {
      throw new BadRequestException('project_id manquant dans la requete');
    }

    const memberRole: { role: MemberRole } | null =
      await this.projectMemberService.getOneProjectMemberRole(
        user_id,
        project_id as string,
      );

    if (!memberRole) {
      throw new BadRequestException('utilisateur non trouver dans le projet');
    }

    const pass: boolean = requiredRoles.some((role) =>
      memberRole.role.includes(role),
    );
    if (!pass) {
      throw new ForbiddenException(`${memberRole.role} n'a pas ce droit`);
    }

    return pass;
  }
}
