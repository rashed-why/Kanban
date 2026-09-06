import type { BoardDetail, Column, MoveTaskPayload } from "@/types/board";
import { arrayMove } from "@dnd-kit/sortable";

export function findColumnIdForItem(
  columns: Column[],
  id: string,
): string | undefined {
  if (columns.some((column) => column.id === id)) {
    return id;
  }

  return columns.find((column) => column.tasks.some((task) => task.id === id))
    ?.id;
}

export function applyDragOver(
  board: BoardDetail,
  activeId: string,
  overId: string,
): BoardDetail | null {
  const activeColumnId = findColumnIdForItem(board.columns, activeId);
  const overColumnId = findColumnIdForItem(board.columns, overId);

  if (!activeColumnId || !overColumnId) {
    return null;
  }

  const columns = board.columns.map((column) => ({
    ...column,
    tasks: [...column.tasks],
  }));

  const activeColumn = columns.find((column) => column.id === activeColumnId);
  const overColumn = columns.find((column) => column.id === overColumnId);

  if (!activeColumn || !overColumn) {
    return null;
  }

  const activeIndex = activeColumn.tasks.findIndex(
    (task) => task.id === activeId,
  );

  if (activeIndex === -1) {
    return null;
  }

  if (activeColumnId === overColumnId) {
    const isOverColumn = board.columns.some((column) => column.id === overId);
    const overIndex = isOverColumn
      ? activeColumn.tasks.length - 1
      : overColumn.tasks.findIndex((task) => task.id === overId);

    if (overIndex === -1 || activeIndex === overIndex) {
      return null;
    }

    activeColumn.tasks = arrayMove(
      activeColumn.tasks,
      activeIndex,
      overIndex,
    ).map((task, index) => ({
      ...task,
      position: index,
    }));
  } else {
    const isOverColumn = board.columns.some((column) => column.id === overId);
    const overIndex = isOverColumn
      ? overColumn.tasks.length
      : overColumn.tasks.findIndex((task) => task.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : overColumn.tasks.length;
    const [task] = activeColumn.tasks.splice(activeIndex, 1);

    overColumn.tasks.splice(insertIndex, 0, {
      ...task,
      columnId: overColumnId,
    });

    activeColumn.tasks = activeColumn.tasks.map((item, index) => ({
      ...item,
      position: index,
    }));
    overColumn.tasks = overColumn.tasks.map((item, index) => ({
      ...item,
      position: index,
    }));
  }

  return { ...board, columns };
}

export function getMovePayload(
  previousBoard: BoardDetail,
  currentBoard: BoardDetail,
  taskId: string,
): MoveTaskPayload | null {
  const fromColumnId = findColumnIdForItem(previousBoard.columns, taskId);
  const toColumnId = findColumnIdForItem(currentBoard.columns, taskId);

  if (!fromColumnId || !toColumnId) {
    return null;
  }

  const previousColumn = previousBoard.columns.find(
    (column) => column.id === fromColumnId,
  );
  const currentColumn = currentBoard.columns.find(
    (column) => column.id === toColumnId,
  );

  if (!previousColumn || !currentColumn) {
    return null;
  }

  const previousPosition = previousColumn.tasks.findIndex(
    (task) => task.id === taskId,
  );
  const newPosition = currentColumn.tasks.findIndex(
    (task) => task.id === taskId,
  );

  if (previousPosition === -1 || newPosition === -1) {
    return null;
  }

  if (fromColumnId === toColumnId && previousPosition === newPosition) {
    return null;
  }

  return {
    fromColumnId,
    toColumnId,
    newPosition,
  };
}
