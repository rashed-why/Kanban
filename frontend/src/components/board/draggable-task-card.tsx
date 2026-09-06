"use client";

import type { Task } from "@/types/board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { DeleteTaskModal } from "./delete-task-modal";
import { EditTaskModal } from "./edit-task-modal";
import { SortableTaskCard } from "./sortable-task-card";

type DraggableTaskCardProps = {
  boardId: string;
  task: Task;
};

export function DraggableTaskCard({ boardId, task }: DraggableTaskCardProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="touch-none"
        {...attributes}
        {...listeners}
      >
        <SortableTaskCard
          task={task}
          onEdit={() => setEditModalOpen(true)}
          onDelete={() => setDeleteModalOpen(true)}
        />
      </div>

      <EditTaskModal
        boardId={boardId}
        task={task}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      <DeleteTaskModal
        boardId={boardId}
        taskId={task.id}
        taskTitle={task.title}
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
