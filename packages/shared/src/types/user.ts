export enum Role {
  ADMIN = 'ADMIN',
  MARKETER = 'MARKETER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  brandId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  user: User;
  token: string;
}
