"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BranchForm } from "@/components/settings/branch-form";
import { BranchOnboarding } from "@/components/settings/branch-onboarding";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LuPlus, LuPencil, LuTrash2, LuBuilding2, LuPhone, LuGlobe, LuClock } from "react-icons/lu";
import { getPlanBranchLimit } from "@/lib/store-plans";
import { Branch } from "@/types/branch";

export default function SucursalesPage() {
  const { storeId, userId, storePlan, refetchBranches } = useDashboard();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  const branchLimit = getPlanBranchLimit(storePlan);
  const canCreateMore = branches.length < branchLimit;

  async function fetchBranches() {
    try {
      const res = await fetch(`/api/branches?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
    setLoading(false);
    refetchBranches();
  }

  useEffect(() => {
    fetchBranches();
  }, [storeId]);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/branches/${id}?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setBranches((prev) => prev.filter((b) => b.id !== id));
        refetchBranches();
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
    }
  }

  function handleEdit(branch: Branch) {
    setEditBranch(branch);
    setEditFormOpen(true);
  }

  function handleCreate() {
    setOnboardingOpen(true);
  }

  function hasSocials(branch: Branch): boolean {
    return !!(branch.facebookUrl || branch.instagramUrl || branch.tiktokUrl || branch.twitterUrl || branch.youtubeUrl || branch.socialBranchRef);
  }

  function hasHours(branch: Branch): boolean {
    return !!(branch.businessHours || branch.hoursBranchRef);
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando sucursales...</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sucursales</h2>
          <p className="text-sm text-neutral-500">
            Administra las sucursales de tu tienda.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={!canCreateMore}>
          <LuPlus className="h-4 w-4 mr-1" />
          Nueva Sucursal
        </Button>
      </div>

      {!canCreateMore && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Tu plan actual permite hasta {branchLimit} sucursal{branchLimit > 1 ? "es" : ""}. Actualizá tu plan para agregar más.
        </p>
      )}

      <div className="space-y-3">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <LuBuilding2 className="h-5 w-5 text-neutral-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-neutral-900">{branch.name}</p>
                  {branch.isDefault && (
                    <Badge variant="secondary" className="text-xs">Principal</Badge>
                  )}
                </div>
                {branch.address && (
                  <p className="text-sm text-neutral-500">{branch.address}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {(branch.whatsappNumber || branch.phone || branch.phoneBranchRef) && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <LuPhone className="h-3 w-3" /> WhatsApp
                    </span>
                  )}
                  {hasSocials(branch) && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <LuGlobe className="h-3 w-3" /> Redes
                    </span>
                  )}
                  {hasHours(branch) && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <LuClock className="h-3 w-3" /> Horarios
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(branch)}
              >
                <LuPencil className="h-4 w-4" />
              </Button>
              {!branch.isDefault && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <LuTrash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eliminar sucursal</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que querés eliminar la sucursal &quot;{branch.name}&quot;?
                        Los datos asociados se mantendrán pero no serán accesibles.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(branch.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ))}
      </div>

      <BranchOnboarding
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        storeId={storeId}
        userId={userId}
        existingBranches={branches}
        onSuccess={fetchBranches}
      />

      <BranchForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        storeId={storeId}
        userId={userId}
        editBranch={editBranch}
        allBranches={branches}
        onSuccess={fetchBranches}
      />
    </div>
  );
}
