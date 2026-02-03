export type UserRole = "OWNER" | "TECHNICIAN";

interface AuthUser {
  id: string;
  role: UserRole;
  storeId: string;
}

export function isOwner(user: AuthUser): boolean {
  return user.role === "OWNER";
}

export function isTechnician(user: AuthUser): boolean {
  return user.role === "TECHNICIAN";
}

export function canAccess(user: AuthUser, requiredRole: UserRole): boolean {
  if (requiredRole === "TECHNICIAN") return true;
  return user.role === "OWNER";
}
