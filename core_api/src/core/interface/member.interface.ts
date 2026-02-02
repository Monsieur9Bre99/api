import { MemberRole } from '@prisma/client';

export interface iRequestProjectMember {
  role: MemberRole;
  is_confirmed: boolean;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    email: string;
  };
}

export interface iRequestProjectMemberFormatted {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  role: MemberRole;
  is_confirmed: boolean;
}

export interface iProjectMember {
  role: MemberRole;
  is_confirmed: boolean;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    username: string;
  };
}

export interface iDeleteMemberReturn {
  role: MemberRole;
  is_confirmed: boolean;
  user_id: string;
  project_id: string;
}
