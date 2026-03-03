export type UserRole = "OWNER" | "MANAGER" | "TECHNICIAN";

interface AuthUser {
  id: string;
  role: UserRole;
  storeId: string;
}

export function isOwner(user: AuthUser): boolean {
  return user.role === "OWNER";
}

export function isManager(user: AuthUser): boolean {
  return user.role === "MANAGER";
}

export function isTechnician(user: AuthUser): boolean {
  return user.role === "TECHNICIAN";
}

export function canAccess(user: AuthUser, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = { OWNER: 3, MANAGER: 2, TECHNICIAN: 1 };
  return hierarchy[user.role] >= hierarchy[requiredRole];
}
