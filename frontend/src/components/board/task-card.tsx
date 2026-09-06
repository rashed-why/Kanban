import type { ReactNode } from "react";

type TaskCardProps = {
  title: string;
  description?: string | null;
  draggable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

function TaskCardActionButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={(event) => event.stopPropagation()}
      aria-label={label}
      className={`cursor-pointer rounded p-1 text-[var(--kanban-muted)] transition-opacity hover:bg-[var(--kanban-hover)] ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function TaskCard({
  title,
  description,
  draggable = true,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <article
      className={`kanban-card group relative rounded-lg px-3 py-2 ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
    >
      {hasActions ? (
        <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit ? (
            <TaskCardActionButton
              label={`Edit ${title}`}
              onClick={onEdit}
              className="hover:text-[var(--kanban-accent)]"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </TaskCardActionButton>
          ) : null}
          {onDelete ? (
            <TaskCardActionButton
              label={`Delete ${title}`}
              onClick={onDelete}
              className="hover:text-red-400"
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
            </TaskCardActionButton>
          ) : null}
        </div>
      ) : null}

      <h4 className={`text-sm leading-snug text-[var(--kanban-heading)] ${hasActions ? "pr-12" : ""}`}>
        {title}
      </h4>
      {description ? (
        <div className="mt-2 flex items-center gap-1 text-[var(--kanban-muted)]">
          <svg
            aria-hidden
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h10"
            />
          </svg>
        </div>
      ) : null}
    </article>
  );
}
