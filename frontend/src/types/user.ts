export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type SignupUser = User;

export type SignupResponse = {
  message: string;
  user: SignupUser;
};
