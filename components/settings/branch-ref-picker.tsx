"use client";

import { Branch } from "@/types/branch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { LuBuilding2, LuCheck } from "react-icons/lu";

interface BranchRefPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  selectedBranchId: string | null;
  onSelect: (branch: Branch) => void;
  title: string;
  description: string;
  renderDetail?: (branch: Branch) => React.ReactNode;
}

export function BranchRefPicker({
  open,
  onOpenChange,
  branches,
  selectedBranchId,
  onSelect,
  title,
  description,
  renderDetail,
}: BranchRefPickerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {branches.length === 0 && (
              <p className="text-sm text-neutral-500 py-4 text-center">
                No hay otras sucursales disponibles.
              </p>
            )}
            {branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  onSelect(branch);
                  onOpenChange(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-neutral-50 ${
                  selectedBranchId === branch.id
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200"
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                  <LuBuilding2 className="h-4 w-4 text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {branch.name}
                  </p>
                  {renderDetail && (
                    <div className="text-xs text-neutral-500 mt-0.5 truncate">
                      {renderDetail(branch)}
                    </div>
                  )}
                </div>
                {selectedBranchId === branch.id && (
                  <LuCheck className="h-4 w-4 text-neutral-900 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
