"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LuBuilding2, LuCheck, LuChevronDown, LuPlus } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  name: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
}

export function BranchSelector({ branches, selectedBranchId, onBranchChange }: BranchSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const items: Branch[] = branches.length > 0
    ? branches
    : [{ id: "default", name: "Sucursal 1" }];

  const value = branches.length > 0 ? selectedBranchId : "default";
  const selectedName = items.find((b) => b.id === value)?.name ?? "Sucursal 1";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 border-none bg-transparent hover:bg-neutral-100 transition-colors h-9 px-2 rounded-md text-sm cursor-pointer">
          <LuBuilding2 className="h-4 w-4 text-neutral-500" />
          <span>{selectedName}</span>
          <LuChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-1">
        {items.map((branch) => (
          <button
            key={branch.id}
            onClick={() => {
              onBranchChange(branch.id);
              setOpen(false);
            }}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-sm hover:bg-neutral-100 transition-colors cursor-pointer",
              value === branch.id && "font-medium"
            )}
          >
            {branch.name}
            {value === branch.id && <LuCheck className="h-4 w-4" />}
          </button>
        ))}
        <div className="border-t border-neutral-200 mt-1 pt-1">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/configuracion/sucursales");
            }}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 text-sm text-cyan-600 hover:bg-neutral-100 rounded-sm transition-colors cursor-pointer"
          >
            <LuPlus className="h-3.5 w-3.5" />
            Añadir sucursal
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
