"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/contexts/dashboard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { LuCopy, LuRefreshCw, LuTrash2, LuUser } from "react-icons/lu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "TECHNICIAN";
  profileImage: string | null;
}

export function TeamSection() {
  const { storeId } = useDashboard();
  const [inviteCode, setInviteCode] = useState<string>("");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [settingsRes, usersRes] = await Promise.all([
          fetch(`/api/store-settings?storeId=${storeId}`),
          fetch(`/api/users?storeId=${storeId}`),
        ]);

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.inviteCode) {
            setInviteCode(settings.inviteCode);
          } else {
            // Generar código para tiendas existentes sin código
            const genRes = await fetch("/api/store-settings/invite-code", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ storeId }),
            });
            if (genRes.ok) {
              const data = await genRes.json();
              setInviteCode(data.inviteCode);
            }
          }
        }

        if (usersRes.ok) {
          const users = await usersRes.json();
          setMembers(users);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
      setLoading(false);
    }

    fetchData();
  }, [storeId]);

  async function handleCopyCode() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerateCode() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/store-settings/invite-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
      }
    } catch (error) {
      console.error("Error regenerating code:", error);
    }
    setRegenerating(false);
  }

  async function handleRoleChange(userId: string, newRole: "OWNER" | "TECHNICIAN") {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: updated.role } : m))
        );
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== userId));
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando equipo...</p>;
  }

  return (
    <div className="space-y-8 max-w-xl">
      <section className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Código de Invitación</Label>
          <p className="text-sm text-neutral-500 mt-1">
            Compartí este código para que otros usuarios se unan a tu tienda al registrarse.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input value={inviteCode} readOnly className="bg-neutral-50 font-mono" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopyCode}
            title="Copiar código"
          >
            <LuCopy className="h-4 w-4" />
          </Button>
        </div>
        {copied && (
          <p className="text-sm text-green-600">Código copiado al portapapeles</p>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleRegenerateCode}
          disabled={regenerating}
        >
          <LuRefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
          {regenerating ? "Generando..." : "Regenerar código"}
        </Button>
      </section>

      <hr />

      <section className="space-y-4">
        <div>
          <Label className="text-base font-semibold">
            Miembros del Equipo ({members.length})
          </Label>
          <p className="text-sm text-neutral-500 mt-1">
            Gestiona los miembros de tu equipo y sus roles.
          </p>
        </div>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                  {member.profileImage ? (
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <LuUser className="h-5 w-5 text-neutral-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{member.name}</p>
                  <p className="text-sm text-neutral-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(value) =>
                    handleRoleChange(member.id, value as "OWNER" | "TECHNICIAN")
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNER">Propietario</SelectItem>
                    <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                  </SelectContent>
                </Select>
                {member.role !== "OWNER" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LuTrash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar miembro</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que querés eliminar a {member.name} del equipo?
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id)}
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
          {members.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-4">
              No hay miembros en el equipo.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
