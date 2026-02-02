import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskCategoryService } from './task_category.service';
import { AccessTokenGuard } from '../../core/guard/authentification.guard';
import { RoleGuard } from '../../core/guard/role.guard';
import { Roles } from '../../core/decorator/role.decorator';
import { CreateTaskCategoryDto } from './dto/create-task_category.dto';
import { iTaskCategories } from 'src/core/interface/task.interface';

@Controller('task-category')
@UseGuards(AccessTokenGuard, RoleGuard)
export class TaskCategoryController {
  constructor(private readonly taskCategoryService: TaskCategoryService) {}

  /**
   * Crée une nouvelle catégorie de tâche associée à un projet
   *
   * @param body { category: CreateTaskCategoryDto } - Les informations de la catégorie à créer
   * @param project_id string - L'ID du projet associé à la catégorie
   * @returns Promise<{ result: { message: string; category: iTaskCategories } }> - Le résultat de la création de la catégorie
   * @throws { HttpException } - Si la création de la catégorie a échoué
   */
  @Post('/add')
  @Roles('OWNER', 'ADMIN')
  async createCategory(
    @Body() body: { category: CreateTaskCategoryDto },
    @Query('project_id') project_id: string,
  ): Promise<{ result: { message: string; category: iTaskCategories } }> {
    const newCategory: iTaskCategories =
      await this.taskCategoryService.createCategory(body.category, project_id);

    if (!newCategory) {
      throw new HttpException(
        'impossible de cree la categorie',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: {
        message: 'nouvelle categorie créée avec succes',
        category: newCategory,
      },
    };
  }

  /**
   * Récupère la liste des catégories de tâches associées à un projet
   *
   * @param project_id string - L'ID du projet
   * @returns Promise<{ result: { message: string; categories: iTaskCategories[] } }> - La liste des catégories de tâches associées au projet
   * @throws { HttpException } - Si le projet n'existe pas ou s'il il n'y a aucune catégorie enregistrer pour ce projet
   */
  @Get('/')
  @Roles('OWNER', 'ADMIN', 'COLLAB', 'GUEST')
  @HttpCode(200)
  async getAllCategories(@Query('project_id') project_id: string): Promise<{
    result: { message: string; categories: iTaskCategories[] };
  }> {
    const categories: iTaskCategories[] =
      await this.taskCategoryService.getAllCategories(project_id);

    if (!categories) {
      throw new HttpException('projet inexistant', HttpStatus.NOT_FOUND);
    }

    if (categories.length === 0) {
      return {
        result: { message: 'aucune categorie trouvee', categories: categories },
      };
    }

    return {
      result: { message: 'categories trouvees', categories: categories },
    };
  }

  /**
   * Supprime une catégorie de tâches d'un projet.
   * @warning ne pas oublier de mettre le project_id en query.
   * @param category_id string - L'ID de la catégorie à supprimer
   * @returns Promise<{ result: string }> - Le résultat de la suppression de la catégorie
   * @throws { HttpException } - Si la suppression de la catégorie a échoué
   */
  @Delete('/:category_id/delete')
  @Roles('OWNER')
  @HttpCode(200)
  async deleteCategory(@Param('category_id') category_id: string): Promise<{
    result: string;
  }> {
    const deletedCategory: boolean =
      await this.taskCategoryService.deleteCategory(category_id);

    if (!deletedCategory) {
      throw new HttpException(
        'impossible de supprimer la categorie',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      result: 'categorie supprimée avec succes',
    };
  }
}