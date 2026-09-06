"use client";

import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { logoutAPI } from "@/services/auth/mutation";
import { clearAuthCache } from "@/services/auth-session-cache";

export function useLogout() {
  const { mutate, isPending } = useMutation({
    mutationFn: logoutAPI,
    onSettled: async () => {
      clearAuthCache();
      await signOut({ callbackUrl: "/auth/login" });
    },
  });

  return {
    logout: () => mutate(),
    isLoggingOut: isPending,
  };
}
