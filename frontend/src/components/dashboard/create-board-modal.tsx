"use client";

import { Modal, ModalError } from "@/components/shared/modal";
import { createBoardAPI } from "@/services/board/mutation";
import { boardKeys } from "@/services/board/query";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  createBoardFormSchema,
  type CreateBoardFormValues,
} from "@/utils/validations/board-forms";
import { toFormikValidate } from "@/utils/validations/to-formik-validate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

const initialValues: CreateBoardFormValues = {
  title: "",
};

type CreateBoardModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateBoardModal({ open, onClose }: CreateBoardModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const { mutateAsync: createBoard, isPending } = useMutation({
    mutationFn: createBoardAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });

  function handleClose() {
    setServerError("");
    onClose();
  }

  async function handleSubmit(values: CreateBoardFormValues) {
    setServerError("");

    try {
      const board = await createBoard({ title: values.title.trim() });
      handleClose();
      router.push(`/boards/${board.id}`);
      router.refresh();
    } catch (error) {
      setServerError(
        getApiErrorMessage(error, "Could not create board. Please try again."),
      );
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      variant="dashboard"
      maxWidth="sm"
      aria-labelledby="create-board-title"
    >
      <h2
        id="create-board-title"
        className="text-sm font-semibold text-[var(--dashboard-heading)]"
      >
        Create board
      </h2>
      <p className="mt-1 text-xs text-[var(--dashboard-muted)]">
        Add a title for your new board.
      </p>

      <Formik
        initialValues={initialValues}
        validate={toFormikValidate(createBoardFormSchema)}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, isSubmitting, values }) => (
          <Form className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="board-title"
                className="mb-1.5 block text-xs font-medium text-[var(--dashboard-text)]"
              >
                Board title
              </label>
              <input
                id="board-title"
                name="title"
                type="text"
                autoFocus
                placeholder="e.g. Sprint planning"
                value={values.title}
                onChange={(event) => {
                  handleChange(event);
                  if (serverError) setServerError("");
                }}
                onBlur={handleBlur}
                className="dashboard-field w-full rounded-md px-3 py-2 text-sm"
              />
              {errors.title ? (
                <p className="mt-1 text-xs text-red-400">{errors.title}</p>
              ) : null}
              {serverError ? (
                <div className="mt-2">
                  <ModalError message={serverError} />
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md px-3 py-1.5 text-sm text-[var(--dashboard-text)] transition-colors hover:bg-[var(--dashboard-hover)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="rounded-md bg-[var(--dashboard-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-colors hover:bg-[#85b8ff] disabled:opacity-60"
              >
                {isSubmitting || isPending ? "Creating…" : "Create"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}
