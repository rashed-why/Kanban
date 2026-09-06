import type { Task } from "@/types/board";
import { TaskCard } from "./task-card";

type SortableTaskCardProps = {
  task: Task;
  draggable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SortableTaskCard({
  task,
  draggable = true,
  onEdit,
  onDelete,
}: SortableTaskCardProps) {
  return (
    <TaskCard
      title={task.title}
      description={task.description}
      draggable={draggable}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
