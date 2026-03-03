import { prisma } from "@/lib/prisma";

export async function userHasBranchAccess(
  userId: string,
  branchId: string,
  role: string
): Promise<boolean> {
  if (role === "OWNER") return true;

  const userBranch = await prisma.userBranch.findUnique({
    where: {
      userId_branchId: { userId, branchId },
    },
  });

  return !!userBranch;
}
