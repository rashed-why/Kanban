import type { SignupPayload, SignupResponse } from "@/types/user";
import api from "../api";

export const signupAPI = async (payload: SignupPayload) => {
  const { data } = await api.post<SignupResponse>("/user", payload);
  return data;
};
