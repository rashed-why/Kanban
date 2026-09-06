"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  variant?: "kanban" | "dashboard";
  maxWidth?: "sm" | "md";
};

const panelClassNames = {
  kanban: {
    sm: "w-full max-w-sm rounded-xl border border-[#38414a] bg-[#22272b] p-4 shadow-xl",
    md: "w-full max-w-md rounded-xl border border-[#38414a] bg-[#22272b] p-4 shadow-xl",
  },
  dashboard: {
    sm: "dashboard-modal w-full max-w-sm rounded-xl p-4 shadow-xl",
    md: "dashboard-modal w-full max-w-md rounded-xl p-4 shadow-xl",
  },
} as const;

export function Modal({
  open,
  onClose,
  children,
  role = "dialog",
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  variant = "kanban",
  maxWidth = "md",
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          className={`fixed left-1/2 top-24 z-50 max-h-[calc(100vh-7rem)] -translate-x-1/2 overflow-y-auto focus:outline-none ${panelClassNames[variant][maxWidth]}`}
          role={role}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ModalError({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-red-950/50 px-3 py-2 text-sm text-red-400">
      {message}
    </p>
  );
}
