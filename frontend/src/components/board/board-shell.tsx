"use client";

import Link from "next/link";
import { EditableBoardTitle } from "@/components/board/editable-board-title";
import { SharedPeopleSidebar } from "@/components/shared/shared-people-sidebar";
import { useLogout } from "@/hooks/use-logout";
import type { User } from "@/types/user";

type BoardShellProps = {
  userName: string;
  title: string;
  description?: string;
  backHref?: string;
  variant?: "default" | "kanban";
  titleEditable?: boolean;
  isTitleSaving?: boolean;
  onTitleSave?: (title: string) => Promise<void>;
  onShareClick?: () => void;
  onDeleteClick?: () => void;
  sidebarPeople?: User[];
  children: React.ReactNode;
};

export function BoardShell({
  userName,
  title,
  description,
  backHref,
  variant = "default",
  titleEditable = false,
  isTitleSaving = false,
  onTitleSave,
  onShareClick,
  onDeleteClick,
  sidebarPeople = [],
  children,
}: BoardShellProps) {
  const { logout, isLoggingOut } = useLogout();
  const initials = userName.trim().charAt(0).toUpperCase() || "?";
  const isKanban = variant === "kanban";

  if (isKanban) {
    return (
      <div className="flex min-h-screen flex-col text-[var(--kanban-text)]">
        <header
          className="sticky top-0 z-10 shrink-0 px-4 py-3"
          style={{ background: "var(--kanban-header)" }}
        >
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {backHref ? (
                <Link
                  href={backHref}
                  className="shrink-0 rounded px-2 py-1 text-sm text-[var(--kanban-muted)] transition-colors hover:bg-[var(--kanban-hover)] hover:text-[var(--kanban-heading)]"
                >
                  ← Boards
                </Link>
              ) : null}
              {onTitleSave ? (
                <EditableBoardTitle
                  title={title}
                  editable={titleEditable}
                  isSaving={isTitleSaving}
                  onSave={onTitleSave}
                />
              ) : (
                <h1 className="truncate text-lg font-semibold text-[var(--kanban-heading)]">
                  {title}
                </h1>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {onShareClick ? (
                <button
                  type="button"
                  onClick={onShareClick}
                  className="cursor-pointer rounded bg-[var(--kanban-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-colors hover:bg-[#85b8ff]"
                >
                  Share
                </button>
              ) : null}
              {onDeleteClick ? (
                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="cursor-pointer rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500"
                >
                  Delete
                </button>
              ) : null}
              <div
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#579dff] text-sm font-semibold text-white"
              >
                {initials}
              </div>
              <button
                type="button"
                onClick={logout}
                disabled={isLoggingOut}
                className="rounded px-3 py-1.5 text-sm text-[var(--kanban-text)] transition-colors hover:bg-[var(--kanban-hover)] disabled:opacity-60"
              >
                {isLoggingOut ? "…" : "Sign out"}
              </button>
            </div>
          </div>
          {description ? (
            <p className="mx-auto mt-1 max-w-[1600px] px-4 text-xs text-[var(--kanban-muted)]">
              {description}
            </p>
          ) : null}
        </header>

        <div className="flex min-h-0 flex-1">
          <SharedPeopleSidebar people={sidebarPeople} variant="kanban" />
          <main className="kanban-canvas flex min-h-0 flex-1 flex-col">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <header className="border-b border-zinc-200 bg-background dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            {backHref ? (
              <Link
                href={backHref}
                className="mb-1 inline-flex text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                ← Back to boards
              </Link>
            ) : null}
            <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-zinc-900 sm:inline dark:text-zinc-50">
              {userName}
            </span>
            <button
              type="button"
              onClick={logout}
              disabled={isLoggingOut}
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline disabled:opacity-60 dark:text-zinc-50"
            >
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
