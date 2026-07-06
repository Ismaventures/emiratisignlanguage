import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'USER', 'INTERPRETER']),
});

export const userSchemas = {
  update: updateUserSchema,
  updateRole: updateRoleSchema,
};
