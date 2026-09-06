"use client";

type CreateBoardCardProps = {
  onClick: () => void;
};

export function CreateBoardCard({ onClick }: CreateBoardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-create-card group flex h-[96px] w-full flex-col items-center justify-center rounded-lg sm:h-[100px]"
    >
      <span className="text-2xl text-[var(--dashboard-muted)] transition-colors group-hover:text-[var(--dashboard-heading)]">
        +
      </span>
      <span className="mt-1 text-sm text-[var(--dashboard-text)] transition-colors group-hover:text-[var(--dashboard-heading)]">
        Create new board
      </span>
    </button>
  );
}
