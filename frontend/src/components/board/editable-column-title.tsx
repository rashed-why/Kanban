"use client";

import { useEffect, useRef, useState } from "react";

type EditableColumnTitleProps = {
  title: string;
  editable?: boolean;
  isSaving?: boolean;
  onSave: (title: string) => Promise<void>;
};

export function EditableColumnTitle({
  title,
  editable = false,
  isSaving = false,
  onSave,
}: EditableColumnTitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isCommittingRef = useRef(false);
  const skipBlurSaveRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  useEffect(() => {
    if (!isEditing) {
      setDraft(title);
    }
  }, [title, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function commitSave() {
    if (isCommittingRef.current || isSaving) {
      return;
    }

    const trimmed = draft.trim();

    if (!trimmed) {
      setDraft(title);
      setIsEditing(false);
      return;
    }

    if (trimmed === title) {
      setIsEditing(false);
      return;
    }

    isCommittingRef.current = true;

    try {
      await onSave(trimmed);
      setIsEditing(false);
    } catch {
      setDraft(title);
      setIsEditing(false);
    } finally {
      isCommittingRef.current = false;
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      skipBlurSaveRef.current = true;
      void commitSave();
    }

    if (event.key === "Escape") {
      skipBlurSaveRef.current = true;
      setDraft(title);
      setIsEditing(false);
    }
  }

  function handleBlur() {
    if (skipBlurSaveRef.current) {
      skipBlurSaveRef.current = false;
      return;
    }

    void commitSave();
  }

  if (!editable) {
    return (
      <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--kanban-heading)]">
        {title}
      </h3>
    );
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        disabled={isSaving}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        className="kanban-field min-w-0 flex-1 rounded px-1.5 py-0.5 text-sm font-semibold text-[var(--kanban-heading)] disabled:opacity-60"
        aria-label="Column title"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setIsEditing(true);
      }}
      onPointerDown={(event) => event.stopPropagation()}
      className="min-w-0 flex-1 cursor-pointer truncate rounded px-1.5 py-0.5 text-left text-sm font-semibold text-[var(--kanban-heading)] transition-colors hover:bg-[var(--kanban-hover)]"
      title="Click to rename list"
    >
      {title}
    </button>
  );
}
