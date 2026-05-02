export const TOKEN_COOKIE = "team_task_token";

export const USER_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER"
} as const;

export const PROJECT_STATUSES = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED"
} as const;

export const TASK_STATUSES = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE"
} as const;

export const TASK_PRIORITIES = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH"
} as const;

export const PROJECT_MEMBER_ROLES = {
  OWNER: "OWNER",
  MEMBER: "MEMBER"
} as const;
