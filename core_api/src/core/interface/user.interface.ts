import { MemberRole } from '@prisma/client';
import { iProject } from './project.interface';

export interface iUser {
  id: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
}

export interface iUserProjectList {
  firstname: string;
  lastname: string;
  projects: {
    role: MemberRole;
    project: iProject;
  }[];
}

export interface iUserOutsideProject {
  id: string;
  username: string;
}