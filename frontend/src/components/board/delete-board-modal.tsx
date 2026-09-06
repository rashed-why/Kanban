"use client";

import { Modal, ModalError } from "@/components/shared/modal";
import { deleteBoardAPI } from "@/services/board/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import { showSuccessToast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteBoardModalProps = {
  boardId: string;
  boardTitle: string;
  open: boolean;
  onClose: () => void;
};

export function DeleteBoardModal({
  boardId,
  boardTitle,
  open,
  onClose,
}: DeleteBoardModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { mutateAsync: deleteBoard, isPending } = useMutation({
    mutationFn: () => deleteBoardAPI(boardId),
  });

  function handleClose() {
    setServerError("");
    onClose();
  }

  async function handleDelete() {
    setServerError("");

    try {
      await deleteBoard();

      queryClient.removeQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.removeQueries({ queryKey: boardKeys.members(boardId) });
      await queryClient.invalidateQueries({ queryKey: boardKeys.all });
      await queryClient.refetchQueries({ queryKey: boardKeys.all });

      handleClose();
      showSuccessToast("Board deleted successfully");
      router.replace("/boards");
      router.refresh();
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "Could not delete this board. Please try again."),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-board-title"
    >
      <h2
        id="delete-board-title"
        className="text-sm font-semibold text-[var(--kanban-heading)]"
      >
        Delete board
      </h2>

      <p className="mt-3 text-sm text-[var(--kanban-text)]">
        Are you sure you want to delete{" "}
        <span className="font-medium text-[var(--kanban-heading)]">
          {boardTitle}
        </span>
        ? This will permanently remove all lists and cards. This action cannot
        be undone.
      </p>

      {serverError ? (
        <div className="mt-3">
          <ModalError message={serverError} />
        </div>
      ) : null}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-[var(--kanban-text)] transition-colors hover:bg-[var(--kanban-hover)] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="cursor-pointer rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-60"
        >
          {isPending ? "Deleting…" : "Delete board"}
        </button>
      </div>
    </Modal>
  );
}
