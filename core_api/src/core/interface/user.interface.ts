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
    is_confirmed: boolean;
    role: MemberRole;
    project: iProject;
  }[];
  notifications?: {
    _id: string;
    category: string;
    title: string;
    content: string;
    payload: Record<string, any>;
    status: 'pending' | 'sent' | ' delivered' | 'read' | 'failed';
    sentAt: Date;
    readAt?: Date | null;
    channel: ('email' | 'sms' | 'push' | 'in-app')[];
    used: boolean;
  }[];
}

export interface iUserOutsideProject {
  id: string;
  username: string;
}
