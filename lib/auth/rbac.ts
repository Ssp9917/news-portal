export type Role =
  | "super_admin"
  | "admin"
  | "editor"
  | "author"
  | "seo_manager"
  | "media_manager"
  | "viewer"
  | "user";

export type Permission =
  | "news:create"
  | "news:edit"
  | "news:delete"
  | "news:publish"
  | "admin:manage"
  | "tenant:manage"
  | "theme:manage"
  | "homepage:manage"
  | "category:manage"
  | "navigation:manage"
  | "media:manage"
  | "ads:manage"
  | "seo:manage"
  | "dashboard:view"
  | "notifications:manage"
  | "promotions:manage"
  | "polls:manage"
  | "comments:manage"
  | "users:manage";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "news:create",
    "news:edit",
    "news:delete",
    "news:publish",
    "admin:manage",
    "tenant:manage",
    "theme:manage",
    "homepage:manage",
    "category:manage",
    "navigation:manage",
    "media:manage",
    "ads:manage",
    "seo:manage",
    "dashboard:view",
    "notifications:manage",
    "promotions:manage",
    "polls:manage",
    "comments:manage",
    "users:manage",
  ],
  admin: [
    "news:create",
    "news:edit",
    "news:delete",
    "news:publish",
    "theme:manage",
    "homepage:manage",
    "category:manage",
    "navigation:manage",
    "media:manage",
    "ads:manage",
    "seo:manage",
    "dashboard:view",
    "notifications:manage",
    "promotions:manage",
    "polls:manage",
    "comments:manage",
    "users:manage",
  ],
  editor: [
    "news:create",
    "news:edit",
    "news:publish",
    "category:manage",
    "media:manage",
    "dashboard:view",
    "comments:manage",
    "polls:manage",
  ],
  author: [
    "news:create",
    "news:edit",
    "media:manage",
    "dashboard:view",
  ],
  seo_manager: [
    "seo:manage",
    "news:edit",
    "dashboard:view",
  ],
  media_manager: [
    "media:manage",
    "dashboard:view",
  ],
  viewer: [
    "dashboard:view",
  ],
  user: [],
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
  author: "Author / Journalist",
  seo_manager: "SEO Manager",
  media_manager: "Media Manager",
  viewer: "Viewer",
  user: "Registered Reader",
};

export const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-500/20",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-500/20",
  editor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-500/20",
  author: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-500/20",
  seo_manager: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-500/20",
  media_manager: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-500/20",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-500/20",
  user: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-500/20",
};
