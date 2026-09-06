import { isAxiosError } from "axios";
import { getApiErrorMessage } from "./api-error";

export function getShareBoardErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Could not share this board. Please try again.";
  }

  const status = error.response?.status;
  const message = getApiErrorMessage(error, "");

  if (message.includes("User not found")) {
    return "No registered user found with that email.";
  }

  if (message.includes("already has access")) {
    return "This user already has access to the board.";
  }

  if (message.includes("Cannot remove the board owner")) {
    return "The board owner cannot be removed.";
  }

  if (message.includes("Member not found")) {
    return "This member is no longer on the board.";
  }

  if (
    status === 403 ||
    message.includes("Board not found") ||
    message.includes("Insufficient permissions")
  ) {
    return "You do not have permission to share this board.";
  }

  if (message) {
    return message;
  }

  return "Could not share this board. Please try again.";
}
