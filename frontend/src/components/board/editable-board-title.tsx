"use client";

import { useEffect, useRef, useState } from "react";

type EditableBoardTitleProps = {
  title: string;
  editable?: boolean;
  isSaving?: boolean;
  onSave: (title: string) => Promise<void>;
};

export function EditableBoardTitle({
  title,
  editable = false,
  isSaving = false,
  onSave,
}: EditableBoardTitleProps) {
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
      <h1 className="truncate text-lg font-semibold text-[var(--kanban-heading)]">
        {title}
      </h1>
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
        className="kanban-field max-w-[min(100%,24rem)] rounded px-2 py-1 text-lg font-semibold text-[var(--kanban-heading)] disabled:opacity-60"
        aria-label="Board title"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="max-w-[min(100%,24rem)] truncate rounded px-2 py-1 text-left text-lg font-semibold text-[var(--kanban-heading)] transition-colors hover:bg-[var(--kanban-hover)]"
      title="Click to rename board"
    >
      {title}
    </button>
  );
}
