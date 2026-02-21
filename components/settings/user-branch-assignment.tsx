"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { LuBuilding2 } from "react-icons/lu";

interface BranchInfo {
  id: string;
  name: string;
  isDefault: boolean;
}

interface UserBranchAssignmentProps {
  memberId: string;
  storeId: string;
  currentUserId: string;
  currentBranches: BranchInfo[];
}

export function UserBranchAssignment({
  memberId,
  storeId,
  currentUserId,
  currentBranches,
}: UserBranchAssignmentProps) {
  const [allBranches, setAllBranches] = useState<BranchInfo[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(
    new Set(currentBranches.map((b) => b.id))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/branches?storeId=${storeId}`)
      .then((res) => res.json())
      .then((data: BranchInfo[]) => {
        if (Array.isArray(data)) setAllBranches(data);
      })
      .catch(() => {});
  }, [storeId]);

  // Only show if there are branches
  if (allBranches.length === 0) return null;

  async function toggleBranch(branchId: string) {
    const next = new Set(assignedIds);
    if (next.has(branchId)) {
      next.delete(branchId);
    } else {
      next.add(branchId);
    }
    setAssignedIds(next);

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/branches/user-branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: memberId,
          branchIds: Array.from(next),
          requesterId: currentUserId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al asignar sucursal");
      }
      setError(null);
    } catch (err) {
      console.error("Error updating branch assignment:", err);
      setError(err instanceof Error ? err.message : "Error al asignar sucursal");
      // Revert the optimistic update
      setAssignedIds(new Set(currentBranches.map((b) => b.id)));
    }
    setSaving(false);
  }

  return (
    <div className="pl-13 space-y-1.5">
      <p className="text-xs font-medium text-neutral-500 flex items-center gap-1">
        <LuBuilding2 className="h-3.5 w-3.5" />
        Sucursales asignadas
      </p>
      <div className="flex flex-wrap gap-2">
        {allBranches.map((branch) => (
          <label
            key={branch.id}
            className="flex items-center gap-1.5 text-sm cursor-pointer rounded-md border border-neutral-200 px-2.5 py-1.5 hover:bg-neutral-50 transition-colors"
          >
            <Checkbox
              checked={assignedIds.has(branch.id)}
              onCheckedChange={() => toggleBranch(branch.id)}
              disabled={saving}
            />
            {branch.name}
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
