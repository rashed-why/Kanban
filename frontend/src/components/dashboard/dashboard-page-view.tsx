"use client";

import { useState } from "react";
import { BoardList } from "@/components/board/board-list";
import { CreateBoardModal } from "./create-board-modal";
import { DashboardShell } from "./dashboard-shell";

type DashboardPageViewProps = {
  userName: string;
};

export function DashboardPageView({ userName }: DashboardPageViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <DashboardShell
        userName={userName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateClick={() => setCreateModalOpen(true)}
      >
        <BoardList
          searchQuery={searchQuery}
          onCreateClick={() => setCreateModalOpen(true)}
        />
      </DashboardShell>

      <CreateBoardModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}
