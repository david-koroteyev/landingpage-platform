import { Role } from '../types/user';

export const ROLE_PERMISSIONS = {
  [Role.ADMIN]: {
    viewPages: true,
    editPages: true,
    createPages: true,
    archivePages: true,
    publishPages: true,
    manageUsers: true,
    useAiPrompt: true,
    manageTemplates: true,
    manageBrands: true,
  },
  [Role.MARKETER]: {
    viewPages: true,
    editPages: true,
    createPages: true,
    archivePages: true,
    publishPages: true,
    manageUsers: false,
    useAiPrompt: true,
    manageTemplates: false,
    manageBrands: false,
  },
  [Role.VIEWER]: {
    viewPages: true,
    editPages: false,
    createPages: false,
    archivePages: false,
    publishPages: false,
    manageUsers: false,
    useAiPrompt: false,
    manageTemplates: false,
    manageBrands: false,
  },
} as const;

export type Permission = keyof (typeof ROLE_PERMISSIONS)[Role.ADMIN];
