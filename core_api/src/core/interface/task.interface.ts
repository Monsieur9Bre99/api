import { TaskPriority, TaskStatuts } from '@prisma/client';

export interface iTaskData {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  statuts: TaskStatuts;
  image: string;
  date_start: Date | null;
  delay: number;
  worked_time: number;
  date_end: Date | null;
  task_category?: iTaskCategories;
  subtasks?: iSubtask[];
  user_assigned?: {
    user: iUserTask;
  }[];
}

export interface iSubtask {
  id: string;
  description: string;
  is_done: boolean;
}

export interface iTaskCategories {
  id: string;
  title: string;
}

export interface iUserTask {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
}
