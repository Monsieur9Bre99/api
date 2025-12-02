import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { iUserTask } from 'src/core/interface/task.interface';

@Injectable()
export class UserTaskService {
  constructor(private readonly prisma: PrismaService) {}

  async assignTaskToUser(task_id: string, user_id: string): Promise<boolean> {
    const userTask = await this.prisma.user_task.create({
      data: { task_id, user_id },
    });

    return userTask ? true : false;
  }

  async getUserTask(task_id: string): Promise<{ user: iUserTask }[]> {
    const userTask = await this.prisma.user_task.findMany({
      where: { task_id },
      select: {
        user: {
          select: { id: true, firstname: true, lastname: true, username: true },
        },
      },
    });
    return userTask;
  }

  async removeUserTask(task_id: string, user_id: string): Promise<boolean> {
    const userTask = await this.prisma.user_task.delete({
      where: { user_task_id: { user_id, task_id } },
    });
    return userTask ? true : false;
  }
}
