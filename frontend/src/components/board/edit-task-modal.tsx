"use client";

import { Modal, ModalError } from "@/components/shared/modal";
import { updateTaskAPI } from "@/services/task/mutation";
import { boardKeys } from "@/services/board/query";
import type { Task } from "@/types/board";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  updateTaskFormSchema,
  type UpdateTaskFormValues,
} from "@/utils/validations/board-forms";
import { toFormikValidate } from "@/utils/validations/to-formik-validate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik, type FormikHelpers } from "formik";
import { useState } from "react";

type EditTaskFormValues = {
  title: string;
  description: string;
};

type EditTaskModalProps = {
  boardId: string;
  task: Task;
  open: boolean;
  onClose: () => void;
};

export function EditTaskModal({
  boardId,
  task,
  open,
  onClose,
}: EditTaskModalProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { mutateAsync: updateTask, isPending } = useMutation({
    mutationFn: (values: UpdateTaskFormValues) =>
      updateTaskAPI(task.id, {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
      }),
  });

  function handleClose() {
    setServerError("");
    onClose();
  }

  async function handleSubmit(
    values: EditTaskFormValues,
    { resetForm }: FormikHelpers<EditTaskFormValues>,
  ) {
    setServerError("");

    try {
      await updateTask(values);
      await queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      resetForm();
      handleClose();
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "Could not update this task. Please try again."),
      );
    }
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="edit-task-title">
      <h2
        id="edit-task-title"
        className="text-sm font-semibold text-[var(--kanban-heading)]"
      >
        Edit card
      </h2>

      <Formik<EditTaskFormValues>
        initialValues={{
          title: task.title,
          description: task.description ?? "",
        }}
        validate={toFormikValidate(updateTaskFormSchema)}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, handleBlur, handleChange, isSubmitting, values }) => (
          <Form className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="edit-task-title-input"
                className="mb-1.5 block text-sm font-medium text-[var(--kanban-text)]"
              >
                Title
              </label>
              <input
                id="edit-task-title-input"
                name="title"
                type="text"
                value={values.title}
                onChange={(event) => {
                  handleChange(event);
                  if (serverError) setServerError("");
                }}
                onBlur={handleBlur}
                className="kanban-field w-full rounded-md px-3 py-2 text-sm"
                autoFocus
              />
              {errors.title ? (
                <p className="mt-1 text-xs text-red-400">{errors.title}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="edit-task-description"
                className="mb-1.5 block text-sm font-medium text-[var(--kanban-text)]"
              >
                Description
              </label>
              <textarea
                id="edit-task-description"
                name="description"
                rows={3}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className="kanban-field min-h-[5rem] w-full resize-none rounded-md px-3 py-2 text-sm"
              />
            </div>

            {serverError ? <ModalError message={serverError} /> : null}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-[var(--kanban-text)] transition-colors hover:bg-[var(--kanban-hover)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="cursor-pointer rounded-md bg-[var(--kanban-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-colors hover:bg-[#85b8ff] disabled:opacity-60"
              >
                {isSubmitting || isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
