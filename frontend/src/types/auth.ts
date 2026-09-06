export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken: string;
  user: LoginUser;
};

export type LoginResponse = AuthTokensResponse;

export type RefreshPayload = {
  refreshToken: string;
};

export type LogoutResponse = {
  message: string;
};
