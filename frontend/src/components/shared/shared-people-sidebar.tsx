"use client";

import type { User } from "@/types/user";
import { getUserAvatarColor } from "@/utils/user-avatar-color";

type SharedPeopleSidebarProps = {
  people: User[];
  variant?: "dashboard" | "kanban";
};

export function SharedPeopleSidebar({
  people,
  variant = "dashboard",
}: SharedPeopleSidebarProps) {
  const isKanban = variant === "kanban";
  const sidebarClass = isKanban ? "kanban-sidebar" : "dashboard-sidebar";
  const textClass = isKanban
    ? "text-[var(--kanban-text)]"
    : "text-[var(--dashboard-text)]";
  const mutedClass = isKanban
    ? "text-[var(--kanban-muted)]"
    : "text-[var(--dashboard-muted)]";
  const headingClass = isKanban
    ? "text-[var(--kanban-heading)]"
    : "text-[var(--dashboard-heading)]";

  return (
    <aside
      className={`${sidebarClass} hidden w-[260px] shrink-0 flex-col p-3 md:flex`}
    >
      <h2 className={`mb-3 px-2 text-sm font-semibold ${headingClass}`}>
        Shared with
      </h2>

      {people.length > 0 ? (
        <ul className="space-y-1">
          {people.map((person) => {
            const personInitial =
              person.name.trim().charAt(0).toUpperCase() || "?";

            return (
              <li key={person.id}>
                <div
                  className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${textClass}`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-semibold text-white"
                    style={{
                      backgroundColor: getUserAvatarColor(person.id),
                    }}
                  >
                    {personInitial}
                  </span>
                  <span className="truncate font-medium">{person.name}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={`px-2 text-sm ${mutedClass}`}>No shared people yet</p>
      )}
    </aside>
  );
}
