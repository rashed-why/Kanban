"use client";

import { fetchBoardsAPI, boardKeys } from "@/services/board/query";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { BoardCard } from "@/components/dashboard/board-card";
import { CreateBoardCard } from "@/components/dashboard/create-board-card";

type BoardListProps = {
  searchQuery?: string;
  onCreateClick?: () => void;
};

export function BoardList({
  searchQuery = "",
  onCreateClick,
}: BoardListProps) {
  const { data: boards, isLoading, isError } = useQuery({
    queryKey: boardKeys.all,
    queryFn: fetchBoardsAPI,
  });

  const filteredBoards = useMemo(() => {
    if (!boards) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return boards;
    }

    return boards.filter((board) =>
      board.title.toLowerCase().includes(query),
    );
  }, [boards, searchQuery]);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--dashboard-heading)]">
            Your boards
          </h2>
        </div>

        {isLoading ? (
          <p className="text-sm text-[var(--dashboard-muted)]">
            Loading boards…
          </p>
        ) : null}

        {isError ? (
          <p className="text-sm text-red-400">Could not load boards.</p>
        ) : null}

        {!isLoading && !isError && filteredBoards.length === 0 ? (
          <p className="text-sm text-[var(--dashboard-muted)]">
            {searchQuery.trim()
              ? "No boards match your search."
              : "No boards yet. Create one to get started."}
          </p>
        ) : null}

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredBoards.map((board) => (
            <li key={board.id}>
              <BoardCard board={board} />
            </li>
          ))}
          {onCreateClick ? (
            <li>
              <CreateBoardCard onClick={onCreateClick} />
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
