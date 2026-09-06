"use client";

import Link from "next/link";
import { useLogout } from "@/hooks/use-logout";

type DashboardShellProps = {
  userName: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
  children: React.ReactNode;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden
      className="h-4 w-4 shrink-0 text-[var(--dashboard-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardShell({
  userName,
  searchQuery,
  onSearchChange,
  onCreateClick,
  children,
}: DashboardShellProps) {
  const { logout, isLoggingOut } = useLogout();
  const initials = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="dashboard-theme flex min-h-screen flex-col">
      <header className="dashboard-topbar flex h-12 shrink-0 items-center gap-3 px-3">
        <Link
          href="/boards"
          className="flex shrink-0 items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-[var(--dashboard-hover)]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--dashboard-accent)] text-xs font-bold text-white">
            W
          </span>
          <span className="hidden text-sm font-semibold text-[var(--dashboard-heading)] sm:inline">
            Webbriks
          </span>
        </Link>

        <div className="relative mx-auto hidden w-full max-w-xl flex-1 md:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search boards"
            className="dashboard-search w-full rounded-md py-1.5 pl-9 pr-3 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onCreateClick}
            className="rounded-md bg-[var(--dashboard-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-colors hover:bg-[#85b8ff]"
          >
            Create
          </button>
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
            className="hidden rounded px-2 py-1.5 text-sm text-[var(--dashboard-text)] transition-colors hover:bg-[var(--dashboard-hover)] disabled:opacity-60 sm:inline"
          >
            {isLoggingOut ? "…" : "Sign out"}
          </button>
        </div>
      </header>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mb-4 md:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search boards"
              className="dashboard-search w-full rounded-md py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
