import { Project_member, Task, Task_category} from '@prisma/client';
import {iProjectMember } from './member.interface';
import { iTaskCategories, iTaskData } from './task.interface';

export interface iProject {
  id: string;
  title: string;
  description?: string | null;
  date_start: Date;
  date_end: Date;
}

export interface iProjectData extends iProject {
  task_categories: iTaskCategories[];
  tasks: iTaskData[];
  members: iProjectMember[];
}

export interface iDeleteProjectReturn {
  id: string;
  title: string;
  description?: string | null;
  date_start: Date;
  date_end: Date;
  created_at: Date;
  updated_at: Date;
  members: Project_member[];
  task_categories: Task_category[];
  tasks: Task[];
}
