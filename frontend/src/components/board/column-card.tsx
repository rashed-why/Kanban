"use client";

import type { Column as ColumnType } from "@/types/board";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { updateColumnAPI } from "@/services/column/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import { showErrorToast } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateTaskForm } from "./create-task-form";
import { DeleteColumnModal } from "./delete-column-modal";
import { DraggableTaskCard } from "./draggable-task-card";
import { EditableColumnTitle } from "./editable-column-title";
import { SortableTaskCard } from "./sortable-task-card";

type ColumnCardProps = {
  boardId: string;
  column: ColumnType;
  canEdit?: boolean;
};

function EditableColumnTasks({
  boardId,
  column,
}: {
  boardId: string;
  column: ColumnType;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });
  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 px-2 pb-2 ${isOver ? "rounded-lg ring-2 ring-[var(--kanban-accent)] ring-inset" : ""
        }`}
    >
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {column.tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            boardId={boardId}
            task={task}
          />
        ))}
      </SortableContext>
    </div>
  );
}

function ReadOnlyColumnTasks({ column }: { column: ColumnType }) {
  return (
    <div className="flex flex-col gap-2 px-2 pb-2">
      {column.tasks.map((task) => (
        <SortableTaskCard key={task.id} task={task} draggable={false} />
      ))}
    </div>
  );
}

export function ColumnCard({
  boardId,
  column,
  canEdit = true,
}: ColumnCardProps) {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { mutateAsync: updateColumn, isPending: isUpdatingTitle } = useMutation({
    mutationFn: (title: string) => updateColumnAPI(column.id, { title }),
  });

  async function handleTitleSave(title: string) {
    try {
      await updateColumn(title);
      await queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    } catch (error) {
      showErrorToast(
        getApiErrorMessage(error, "Could not rename this list. Please try again."),
      );
      throw error;
    }
  }

  return (
    <>
      <section className="kanban-list group flex w-[272px] shrink-0 flex-col rounded-xl">
        <header className="flex items-start justify-between gap-2 px-3 py-3">
          <EditableColumnTitle
            title={column.title}
            editable={canEdit}
            isSaving={isUpdatingTitle}
            onSave={handleTitleSave}
          />
          <div className="flex shrink-0 items-center gap-1">
            {canEdit ? (
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                aria-label={`Delete ${column.title}`}
                className="cursor-pointer rounded p-1 text-[var(--kanban-muted)] opacity-0 transition-opacity hover:bg-[var(--kanban-hover)] hover:text-red-400 group-hover:opacity-100"
              >
                <svg
                  aria-hidden
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            ) : null}
            <span className="rounded px-1.5 py-0.5 text-xs text-[var(--kanban-muted)]">
              {column.tasks.length}
            </span>
          </div>
        </header>

        {canEdit ? (
          <EditableColumnTasks boardId={boardId} column={column} />
        ) : (
          <ReadOnlyColumnTasks column={column} />
        )}

        {canEdit ? (
          <div className="px-2 pb-3">
            <CreateTaskForm boardId={boardId} columnId={column.id} />
          </div>
        ) : null}
      </section>

      <DeleteColumnModal
        boardId={boardId}
        columnId={column.id}
        columnTitle={column.title}
        taskCount={column.tasks.length}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
