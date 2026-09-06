import { toast, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-center",
  autoClose: 4000,
  hideProgressBar: true,
};

export function dismissToasts() {
  toast.dismiss();
}

export function showSuccessToast(message: string) {
  const toastId = `success:${message}`;

  toast.dismiss();
  toast.success(message, {
    ...defaultOptions,
    toastId,
  });
}

export function showErrorToast(message: string) {
  const toastId = `error:${message}`;

  toast.dismiss();
  toast.error(message, {
    ...defaultOptions,
    toastId,
  });
}
