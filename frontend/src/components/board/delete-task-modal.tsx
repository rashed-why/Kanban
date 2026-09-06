"use client";

import { Modal, ModalError } from "@/components/shared/modal";
import { deleteTaskAPI } from "@/services/task/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

type DeleteTaskModalProps = {
  boardId: string;
  taskId: string;
  taskTitle: string;
  open: boolean;
  onClose: () => void;
};

export function DeleteTaskModal({
  boardId,
  taskId,
  taskTitle,
  open,
  onClose,
}: DeleteTaskModalProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { mutateAsync: deleteTask, isPending } = useMutation({
    mutationFn: () => deleteTaskAPI(taskId),
  });

  function handleClose() {
    setServerError("");
    onClose();
  }

  async function handleDelete() {
    setServerError("");

    try {
      await deleteTask();
      await queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      handleClose();
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "Could not delete this task. Please try again."),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      role="alertdialog"
      aria-labelledby="delete-task-title"
      aria-describedby="delete-task-description"
    >
      <h2
        id="delete-task-title"
        className="text-sm font-semibold text-[var(--kanban-heading)]"
      >
        Delete card
      </h2>

      <p
        id="delete-task-description"
        className="mt-3 text-sm text-[var(--kanban-text)]"
      >
        Are you sure you want to delete{" "}
        <span className="font-medium text-[var(--kanban-heading)]">
          {taskTitle}
        </span>
        ? This action cannot be undone.
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
          {isPending ? "Deleting…" : "Delete card"}
        </button>
      </div>
    </Modal>
  );
}
