"use client";

import { ShareBoardMemberList } from "@/components/board/share-board-member-list";
import { Modal, ModalError } from "@/components/shared/modal";
import { removeBoardMemberAPI, shareBoardAPI } from "@/services/board/mutation";
import { boardKeys, fetchBoardMembersAPI } from "@/services/board/query";
import { getShareBoardErrorMessage } from "@/utils/share-board-error";
import {
  shareBoardFormSchema,
  type ShareBoardFormValues,
} from "@/utils/validations/board-forms";
import { toFormikValidate } from "@/utils/validations/to-formik-validate";
import { showSuccessToast } from "@/utils/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Formik, type FormikHelpers } from "formik";
import { useState } from "react";

const initialValues: ShareBoardFormValues = {
  email: "",
  role: "EDITOR",
};

type ShareBoardModalProps = {
  boardId: string;
  open: boolean;
  isOwner: boolean;
  onClose: () => void;
};

export function ShareBoardModal({
  boardId,
  open,
  isOwner,
  onClose,
}: ShareBoardModalProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: boardKeys.members(boardId),
    queryFn: () => fetchBoardMembersAPI(boardId),
    enabled: open,
  });

  const { mutateAsync: shareBoard, isPending } = useMutation({
    mutationFn: (values: ShareBoardFormValues) =>
      shareBoardAPI(boardId, {
        email: values.email.trim(),
        role: values.role,
      }),
  });

  const { mutateAsync: removeMember } = useMutation({
    mutationFn: (userId: string) => removeBoardMemberAPI(boardId, userId),
  });

  async function invalidateBoardQueries() {
    await queryClient.invalidateQueries({
      queryKey: boardKeys.members(boardId),
    });
    await queryClient.invalidateQueries({
      queryKey: boardKeys.detail(boardId),
    });
    await queryClient.invalidateQueries({ queryKey: boardKeys.all });
  }

  function handleClose() {
    setServerError("");
    setRemovingUserId(null);
    onClose();
  }

  async function handleSubmit(
    values: ShareBoardFormValues,
    { resetForm }: FormikHelpers<ShareBoardFormValues>,
  ) {
    setServerError("");

    try {
      const result = await shareBoard(values);

      await invalidateBoardQueries();

      resetForm();
      showSuccessToast(result.message);
      handleClose();
    } catch (error) {
      setServerError(getShareBoardErrorMessage(error));
    }
  }

  async function handleRemoveMember(userId: string) {
    setServerError("");
    setRemovingUserId(userId);

    try {
      const result = await removeMember(userId);
      await invalidateBoardQueries();
      showSuccessToast(result.message);
    } catch (error) {
      setServerError(getShareBoardErrorMessage(error));
    } finally {
      setRemovingUserId(null);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="share-board-title">
      <h2
        id="share-board-title"
        className="text-sm font-semibold text-[var(--kanban-heading)]"
      >
        Share board
      </h2>

      {isOwner ? (
        <Formik
          initialValues={initialValues}
          validate={toFormikValidate(shareBoardFormSchema)}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, isSubmitting, values }) => (
            <Form className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="share-email"
                  className="mb-1.5 block text-sm font-medium text-[var(--kanban-text)]"
                >
                  Email
                </label>
                <input
                  id="share-email"
                  name="email"
                  type="email"
                  autoFocus
                  placeholder="karim@example.com"
                  value={values.email}
                  onChange={(event) => {
                    handleChange(event);
                    if (serverError) setServerError("");
                  }}
                  onBlur={handleBlur}
                  className="kanban-field w-full rounded-md px-3 py-2 text-sm"
                />
                {errors.email ? (
                  <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="share-role"
                  className="mb-1.5 block text-sm font-medium text-[var(--kanban-text)]"
                >
                  Permission
                </label>
                <select
                  id="share-role"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="kanban-field w-full rounded-md px-3 py-2 text-sm"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                {errors.role ? (
                  <p className="mt-1 text-xs text-red-400">{errors.role}</p>
                ) : null}
              </div>

              {serverError ? <ModalError message={serverError} /> : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="cursor-pointer rounded-md px-3 py-1.5 text-sm text-[var(--kanban-text)] transition-colors hover:bg-[var(--kanban-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="cursor-pointer rounded-md bg-[var(--kanban-accent)] px-3 py-1.5 text-sm font-medium text-[#1d2125] transition-colors hover:bg-[#85b8ff] disabled:opacity-60"
                >
                  {isSubmitting || isPending ? "Sharing…" : "Share"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <p className="mt-3">
          <ModalError message="You do not have permission to share this board." />
        </p>
      )}

      <ShareBoardMemberList
        members={members}
        isLoading={isLoadingMembers}
        isOwner={isOwner}
        removingUserId={removingUserId}
        onRemove={handleRemoveMember}
      />
    </Modal>
  );
}
