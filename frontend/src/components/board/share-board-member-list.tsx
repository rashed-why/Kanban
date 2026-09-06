"use client";

import type { BoardMemberItem } from "@/types/board";
import { formatBoardRoleLabel } from "@/utils/format-board-role";

type ShareBoardMemberListProps = {
  members?: BoardMemberItem[];
  isLoading: boolean;
  isOwner?: boolean;
  removingUserId?: string | null;
  onRemove?: (userId: string) => void;
};

export function ShareBoardMemberList({
  members,
  isLoading,
  isOwner = false,
  removingUserId = null,
  onRemove,
}: ShareBoardMemberListProps) {
  return (
    <div className="mt-6 border-t border-[#38414a] pt-4">
      <h3 className="text-sm font-medium text-[var(--kanban-heading)]">
        Members with access:
      </h3>

      {isLoading ? (
        <p className="mt-3 text-sm text-[var(--kanban-muted)]">
          Loading members…
        </p>
      ) : null}

      {!isLoading && members?.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--kanban-muted)]">
          No members yet.
        </p>
      ) : null}

      <ul className="mt-3 space-y-3">
        {members?.map((member) => {
          const isBoardOwner = member.role.toUpperCase() === "OWNER";
          const isRemoving = removingUserId === member.userId;

          return (
            <li
              key={member.userId}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--kanban-heading)]">
                  {member.name}
                </p>
                <p className="mt-0.5 text-[var(--kanban-muted)]">
                  {formatBoardRoleLabel(member.role)}
                </p>
              </div>

              {isOwner && !isBoardOwner && onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(member.userId)}
                  disabled={Boolean(removingUserId)}
                  className="shrink-0 rounded px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-950/40 disabled:opacity-60"
                >
                  {isRemoving ? "Removing…" : "Remove"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
