"use client";

import { createTaskAPI } from "@/services/task/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  createTaskFormSchema,
  type CreateTaskFormValues,
} from "@/utils/validations/board-forms";
import { toFormikValidate } from "@/utils/validations/to-formik-validate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";

const initialValues: CreateTaskFormValues = {
  title: "",
  description: "",
};

type CreateTaskFormProps = {
  boardId: string;
  columnId: string;
};

export function CreateTaskForm({ boardId, columnId }: CreateTaskFormProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const { mutateAsync: createTask, isPending } = useMutation({
    mutationFn: (values: CreateTaskFormValues) =>
      createTaskAPI(columnId, {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      setIsOpen(false);
    },
  });

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="kanban-add-btn flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[var(--kanban-text)] transition-colors"
      >
        <span className="text-base leading-none text-[var(--kanban-muted)]">+</span>
        <span>Add a card</span>
      </button>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validate={toFormikValidate(createTaskFormSchema)}
      onSubmit={async (values, helpers) => {
        setServerError("");

        try {
          await createTask(values);
          helpers.resetForm();
        } catch (error) {
          setServerError(
            getApiErrorMessage(error, "Could not create task. Please try again."),
          );
        }
      }}
    >
      {({ errors, handleBlur, handleChange, isSubmitting, resetForm, values }) => (
        <Form className="kanban-card rounded-lg p-2">
          <input
            name="title"
            type="text"
            placeholder="Enter a title for this card…"
            value={values.title}
            onChange={(event) => {
              handleChange(event);
              if (serverError) setServerError("");
            }}
            onBlur={handleBlur}
            className="kanban-field w-full rounded-lg px-2 py-1.5 text-sm"
            autoFocus
          />
          {errors.title ? (
            <p className="mt-1 text-xs text-red-400">{errors.title}</p>
          ) : null}

          <textarea
            name="description"
            placeholder="Description"
            rows={2}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            className="kanban-field mt-2 min-h-[4rem] w-full resize-none rounded-lg px-2 py-1.5 text-sm"
          />

          {serverError ? (
            <p className="mt-2 rounded bg-red-950/50 px-2 py-1 text-xs text-red-400">
              {serverError}
            </p>
          ) : null}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || isPending}
              className="rounded-lg bg-[var(--kanban-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting || isPending ? "Adding…" : "Add card"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsOpen(false);
                setServerError("");
              }}
              className="rounded-lg p-1.5 text-[var(--kanban-muted)] transition-colors hover:bg-[var(--kanban-hover)]"
              aria-label="Cancel"
            >
              ✕
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
