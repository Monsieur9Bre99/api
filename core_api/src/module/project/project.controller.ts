import {
  Controller,
  UseGuards,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  Get,
  Delete,
  Query,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import {
  AccessTokenGuard,
  iAuthentificatedRequest,
} from '../../core/guard/authentification.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { iProject, iProjectData } from 'src/core/interface/project.interface';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('project')
@UseGuards(AccessTokenGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  /**
   * Crée un nouveau projet.
   * @param {CreateProjectDto} body Les informations du projet à créer.
   * @param {iAuthentificatedRequest} request La requête HTTP authentifiée.
   * @returns {Promise<{ result: string }>} Le résultat de la création du projet.
   * @throws {HttpException} Si la création du projet échoue.
   */
  @Post('/new_project')
  async create(
    @Body() body: CreateProjectDto,
    @Req() request: iAuthentificatedRequest,
  ): Promise<{ result: string }> {
    const user_id: string = request.user.userId;
    const data: { project: CreateProjectDto; creator: string } = {
      project: body,
      creator: user_id,
    };
    const new_project: iProject = await this.projectService.createProject(data);

    if (!new_project) {
      throw new HttpException(
        'impossible de créer le projet',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'nouveau projet creer avec succès',
    };
  }

  /**
   * Récupère un projet en fonction de son ID.
   * @param {string} project_id L'ID du projet.
   * @returns {Promise<{ result: { message: string; project: iProject } }>} Le projet correspondant à l'ID, ou une erreur 404 si le projet n'existe pas.
   * @throws {HttpException} Si le projet n'existe pas.
   */
  @Get('/')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getProjectBasicInfo(
    @Query('project_id') project_id: string,
  ): Promise<{ result: { message: string; project: iProject } }> {
    const projectData =
      await this.projectService.getProjectBasicInfo(project_id);

    if (!projectData) {
      throw new HttpException('projet inexistant', HttpStatus.NOT_FOUND);
    }

    return {
      result: {
        message: 'projet trouver',
        project: projectData,
      },
    };
  }

  /**
   * Récupère un projet en fonction de son ID.
   * @param {string} project_id L'ID du projet.
   * @returns {Promise<{ result: { message: string; project: iProjectData } }>} Le projet correspondant à l'ID, ou une erreur 404 si le projet n'existe pas.
   * @throws {HttpException} Si le projet n'existe pas.
   */
  @Get('/info')
  @UseGuards(RoleGuard)
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getProject(@Query('project_id') project_id: string): Promise<{
    result: { message: string; project: iProjectData };
  }> {
    const projectData = await this.projectService.getProjectById(project_id);

    if (!projectData) {
      throw new HttpException('projet inexistant', HttpStatus.NOT_FOUND);
    }

    return {
      result: {
        message: 'projet trouver',
        project: projectData,
      },
    };
  }

  /**
   * Supprime un projet.
   * @param {string} project_id L'ID du projet à supprimer.
   * @returns {Promise<{ result: string }>} Le résultat de la suppression du projet.
   * @throws {HttpException} Si le projet n'existe pas.
   */
  @Delete('/delete')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  @HttpCode(200)
  async deleteProject(
    @Query('project_id') project_id: string,
  ): Promise<{ result: string }> {
    const deleteProject = await this.projectService.deleteProject(project_id);

    if (!deleteProject) {
      throw new HttpException('projet inexistant', HttpStatus.NOT_FOUND);
    }

    console.log(deleteProject);

    return { result: 'projet supprimer' };
  }

  /**
   * Met à jour un projet.
   * @param {string} project_id L'ID du projet à mettre à jour.
   * @param {UpdateProjectDto} body Les données à mettre à jour.
   * @returns {Promise<{ result: { message: string; project: iProject } }>} Le projet mis à jour.
   * @throws {HttpException} Si le projet n'existe pas.
   */
  @Patch('/')
  @UseGuards(RoleGuard)
  @Roles('OWNER')
  @HttpCode(200)
  async updateProject(
    @Query('project_id') project_id: string,
    @Body() body: UpdateProjectDto,
  ): Promise<{ result: { message: string; project: iProject } }> {
    const updatedProject = await this.projectService.updateProject(
      project_id,
      body,
    );

    return {
      result: {
        message: 'projet mis à jour avec succès',
        project: updatedProject,
      },
    };
  }
}
