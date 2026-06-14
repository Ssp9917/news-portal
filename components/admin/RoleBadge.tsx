"use client";

import { ROLE_LABELS, ROLE_COLORS, type Role } from "@/lib/auth/rbac";
import { Shield, Star, Edit3, Eye } from "lucide-react";

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  super_admin: <Star className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  editor: <Edit3 className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

interface RoleBadgeProps {
  role: Role;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass} ${ROLE_COLORS[role]}`}
    >
      {ROLE_ICONS[role]}
      {ROLE_LABELS[role]}
    </span>
  );
}
