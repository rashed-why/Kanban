"use client";

import { createColumnAPI } from "@/services/column/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  createColumnFormSchema,
  type CreateColumnFormValues,
} from "@/utils/validations/board-forms";
import { toFormikValidate } from "@/utils/validations/to-formik-validate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useState } from "react";

const initialValues: CreateColumnFormValues = {
  title: "",
};

type CreateColumnFormProps = {
  boardId: string;
};

export function CreateColumnForm({ boardId }: CreateColumnFormProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const { mutateAsync: createColumn, isPending } = useMutation({
    mutationFn: (values: CreateColumnFormValues) =>
      createColumnAPI(boardId, { title: values.title.trim() }),
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
        className="kanban-add-btn flex h-fit w-[272px] shrink-0 items-center gap-2 rounded-xl bg-[var(--kanban-list)] px-3 py-3 text-left text-sm text-[var(--kanban-text)] backdrop-blur-sm transition-colors"
      >
        <span className="text-base leading-none">+</span>
        <span>Add another list</span>
      </button>
    );
  }

  return (
    <section className="kanban-list flex w-[272px] shrink-0 flex-col rounded-xl p-3">
      <Formik
        initialValues={initialValues}
        validate={toFormikValidate(createColumnFormSchema)}
        onSubmit={async (values, helpers) => {
          setServerError("");

          try {
            await createColumn(values);
            helpers.resetForm();
          } catch (error) {
            setServerError(
              getApiErrorMessage(
                error,
                "Could not create column. Please try again.",
              ),
            );
          }
        }}
      >
        {({ errors, handleBlur, handleChange, isSubmitting, resetForm, values }) => (
          <Form className="flex flex-col gap-2">
            <input
              name="title"
              type="text"
              placeholder="Enter list title…"
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
              <p className="text-xs text-red-400">{errors.title}</p>
            ) : null}

            {serverError ? (
              <p className="rounded bg-red-950/50 px-2 py-1 text-xs text-red-400">
                {serverError}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="rounded-lg bg-[var(--kanban-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting || isPending ? "Adding…" : "Add list"}
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
    </section>
  );
}
