export function formatBoardRoleLabel(role: string): string {
  switch (role.toUpperCase()) {
    case "OWNER":
      return "Owner";
    case "EDITOR":
      return "Editor";
    case "VIEWER":
      return "Viewer";
    default:
      return role;
  }
}
