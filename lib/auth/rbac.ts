export type Role = "super_admin" | "admin" | "editor" | "viewer";

export type Permission =
  | "news:create"
  | "news:edit"
  | "news:delete"
  | "news:publish"
  | "admin:manage"
  | "tenant:manage"
  | "dashboard:view";

// Permission matrix — what each role can do
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "news:create",
    "news:edit",
    "news:delete",
    "news:publish",
    "admin:manage",
    "tenant:manage",
    "dashboard:view",
  ],
  admin: [
    "news:create",
    "news:edit",
    "news:delete",
    "news:publish",
    "dashboard:view",
  ],
  editor: [
    "news:create",
    "news:edit",
    "dashboard:view",
  ],
  viewer: [
    "dashboard:view",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  editor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};
