"use client";

import { useMemo, useState } from "react";
import { BoardShell } from "@/components/board/board-shell";
import { DeleteBoardModal } from "@/components/board/delete-board-modal";
import { KanbanBoard } from "@/components/board/kanban-board";
import { ShareBoardModal } from "@/components/board/share-board-modal";
import { updateBoardAPI } from "@/services/board/mutation";
import { boardKeys, fetchBoardAPI } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import { getBoardSidebarPeople } from "@/utils/shared-people";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type BoardPageViewProps = {
  boardId: string;
  userId: string;
  userName: string;
};

export function BoardPageView({
  boardId,
  userId,
  userName,
}: BoardPageViewProps) {
  const queryClient = useQueryClient();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: board, isLoading, isError } = useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => fetchBoardAPI(boardId),
  });

  const { mutateAsync: updateBoard, isPending: isUpdatingTitle } = useMutation({
    mutationFn: (title: string) => updateBoardAPI(boardId, { title }),
  });

  const isOwner = board?.ownerId === userId;

  const sidebarPeople = useMemo(
    () => (board ? getBoardSidebarPeople(board, userId) : []),
    [board, userId],
  );

  async function handleTitleSave(title: string) {
    try {
      await updateBoard(title);
      await queryClient.invalidateQueries({
        queryKey: boardKeys.detail(boardId),
      });
      await queryClient.invalidateQueries({ queryKey: boardKeys.all });
      showSuccessToast("Board renamed successfully");
    } catch (error) {
      showErrorToast(
        getApiErrorMessage(error, "Could not rename this board. Please try again."),
      );
      throw error;
    }
  }

  return (
    <>
      <BoardShell
        userName={userName}
        title={board?.title ?? "Kanban board"}
        variant="kanban"
        backHref="/boards"
        titleEditable={isOwner}
        isTitleSaving={isUpdatingTitle}
        onTitleSave={isOwner ? handleTitleSave : undefined}
        onShareClick={() => setShareModalOpen(true)}
        onDeleteClick={isOwner ? () => setDeleteModalOpen(true) : undefined}
        sidebarPeople={sidebarPeople}
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-[var(--kanban-muted)]">Loading board…</p>
          </div>
        ) : isError || !board ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-sm text-red-400">Could not load this board.</p>
          </div>
        ) : (
          <KanbanBoard boardId={boardId} userId={userId} board={board} />
        )}
      </BoardShell>

      <ShareBoardModal
        boardId={boardId}
        open={shareModalOpen}
        isOwner={isOwner}
        onClose={() => setShareModalOpen(false)}
      />

      <DeleteBoardModal
        boardId={boardId}
        boardTitle={board?.title ?? "this board"}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
