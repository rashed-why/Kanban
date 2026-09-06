"use client";

import Link from "next/link";
import type { BoardListItem } from "@/types/board";
import { getBoardGradient } from "@/utils/board-gradient";

type BoardCardProps = {
  board: BoardListItem;
};

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block w-full shrink-0"
    >
      <div
        className="relative h-[96px] overflow-hidden rounded-lg transition-opacity group-hover:opacity-90 sm:h-[100px]"
        style={{ background: getBoardGradient(board.id) }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <p className="mt-2 truncate text-sm font-medium text-[var(--dashboard-heading)]">
        {board.title}
      </p>
    </Link>
  );
}
