"use client";

import { Modal, ModalError } from "@/components/shared/modal";
import { deleteColumnAPI } from "@/services/column/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type DeleteColumnModalProps = {
  boardId: string;
  columnId: string;
  columnTitle: string;
  taskCount: number;
  open: boolean;
  onClose: () => void;
};

export function DeleteColumnModal({
  boardId,
  columnId,
  columnTitle,
  taskCount,
  open,
  onClose,
}: DeleteColumnModalProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { mutateAsync: deleteColumn, isPending } = useMutation({
    mutationFn: () => deleteColumnAPI(columnId),
  });

  function handleClose() {
    setServerError("");
    onClose();
  }

  async function handleDelete() {
    setServerError("");

    try {
      await deleteColumn();
      await queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      handleClose();
    } catch (error) {
      setServerError(
        getApiErrorMessage(
          error,
          "Could not delete this list. Please try again.",
        ),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      role="alertdialog"
      aria-labelledby="delete-column-title"
      aria-describedby="delete-column-description"
    >
      <h2
        id="delete-column-title"
        className="text-sm font-semibold text-[var(--kanban-heading)]"
      >
        Delete list
      </h2>

      <p
        id="delete-column-description"
        className="mt-3 text-sm text-[var(--kanban-text)]"
      >
        Are you sure you want to delete{" "}
        <span className="font-medium text-[var(--kanban-heading)]">
          {columnTitle}
        </span>
        ?
        {taskCount > 0 ? (
          <>
            {" "}
            This will permanently remove {taskCount}{" "}
            {taskCount === 1 ? "card" : "cards"} in this list.
          </>
        ) : null}{" "}
        This action cannot be undone.
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
          {isPending ? "Deleting…" : "Delete list"}
        </button>
      </div>
    </Modal>
  );
}
