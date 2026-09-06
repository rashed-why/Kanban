import { isAxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;

  if (typeof message === "string" && message) {
    return message;
  }

  if (Array.isArray(message)) {
    const firstMessage = message.find(
      (item): item is string => typeof item === "string" && item.length > 0,
    );

    if (firstMessage) {
      return firstMessage;
    }
  }

  return fallback;
}
