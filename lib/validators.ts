import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export const projectSchema = z.object({
  name: z.string().trim().min(3, "Project name is required"),
  description: z.string().trim().max(500).optional().or(z.literal(""))
});

export const projectUpdateSchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional()
});

export const addMemberSchema = z.object({
  email: z.string().trim().email("Enter a valid email")
});

export const taskSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  title: z.string().trim().min(3, "Task title is required"),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().trim().optional().or(z.literal("")),
  assigneeId: z.string().trim().optional().or(z.literal(""))
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().trim().optional().nullable(),
  assigneeId: z.string().trim().optional().nullable()
});
