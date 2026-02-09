"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LuCopy, LuCheck } from "react-icons/lu";
import { FaWhatsapp } from "react-icons/fa";

interface StepMembersProps {
  storeId: string;
}

export function StepMembers({ storeId }: StepMembersProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCode() {
      const res = await fetch(`/api/store-settings?storeId=${storeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.inviteCode) setInviteCode(data.inviteCode);
      }
    }
    fetchCode();
  }, [storeId]);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Unite a mi tienda en Koldesk con el código: ${inviteCode}\n\nRegistrate acá: ${window.location.origin}/register`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-neutral-800">Invitá a tu equipo</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Compartí este código para que otros miembros se unan a tu tienda.
        </p>
      </div>

      {inviteCode ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-3">
            <span className="text-lg font-mono font-semibold text-neutral-800 flex-1">
              {inviteCode}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <><LuCheck className="h-4 w-4 mr-1" /> Copiado</>
              ) : (
                <><LuCopy className="h-4 w-4 mr-1" /> Copiar código</>
              )}
            </Button>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleWhatsApp}
          >
            <FaWhatsapp className="h-4 w-4 mr-2" />
            Compartir por WhatsApp
          </Button>
        </div>
      ) : (
        <p className="text-sm text-neutral-500">Cargando código...</p>
      )}
    </div>
  );
}
