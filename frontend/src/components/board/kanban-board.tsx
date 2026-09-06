"use client";

import { moveTaskAPI } from "@/services/task/mutation";
import { boardKeys } from "@/services/board/query";
import type { BoardDetail } from "@/types/board";
import { applyDragOver, getMovePayload } from "@/utils/board-dnd";
import { canEditBoard } from "@/utils/board-role";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { ColumnCard } from "./column-card";
import { CreateColumnForm } from "./create-column-form";

type KanbanBoardProps = {
  boardId: string;
  userId: string;
  board: BoardDetail;
};

const collisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return closestCenter(args);
};

export function KanbanBoard({ boardId, userId, board }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const dragSnapshot = useRef<BoardDetail | null>(null);

  const { mutate: moveTask } = useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: Parameters<typeof moveTaskAPI>[1];
    }) => moveTaskAPI(taskId, payload),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const snapshot = queryClient.getQueryData<BoardDetail>(
      boardKeys.detail(boardId),
    );

    dragSnapshot.current = snapshot ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) {
      return;
    }

    queryClient.setQueryData<BoardDetail>(boardKeys.detail(boardId), (current) => {
      if (!current) {
        return current;
      }

      return applyDragOver(current, activeId, overId) ?? current;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const snapshot = dragSnapshot.current;
    const { active, over } = event;

    dragSnapshot.current = null;

    if (!snapshot) {
      return;
    }

    if (!over) {
      queryClient.setQueryData(boardKeys.detail(boardId), snapshot);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    queryClient.setQueryData<BoardDetail>(boardKeys.detail(boardId), (current) => {
      if (!current) {
        return current;
      }

      if (activeId === overId) {
        return current;
      }

      return applyDragOver(current, activeId, overId) ?? current;
    });

    const current = queryClient.getQueryData<BoardDetail>(
      boardKeys.detail(boardId),
    );

    if (!current) {
      queryClient.setQueryData(boardKeys.detail(boardId), snapshot);
      return;
    }

    const payload = getMovePayload(snapshot, current, activeId);

    if (!payload) {
      queryClient.setQueryData(boardKeys.detail(boardId), snapshot);
      return;
    }

    moveTask(
      { taskId: activeId, payload },
      {
        onError: () => {
          queryClient.setQueryData(boardKeys.detail(boardId), snapshot);
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
        },
      },
    );
  }

  function handleDragCancel(_event: DragCancelEvent) {
    if (dragSnapshot.current) {
      queryClient.setQueryData(
        boardKeys.detail(boardId),
        dragSnapshot.current,
      );
    }

    dragSnapshot.current = null;
  }

  const canEdit = canEditBoard(board, userId);

  const columnList = (
    <div className="flex items-start gap-3 px-4 pb-4 pt-3">
      {board.columns.map((column) => (
        <ColumnCard
          key={column.id}
          boardId={boardId}
          column={column}
          canEdit={canEdit}
        />
      ))}
      {canEdit ? <CreateColumnForm boardId={boardId} /> : null}
    </div>
  );

  if (!canEdit) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          {columnList}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          {columnList}
        </div>
      </div>
    </DndContext>
  );
}
