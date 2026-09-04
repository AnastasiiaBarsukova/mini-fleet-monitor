import { apiClient } from "./apiClient";

export type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  status: "success";
  data: {
    user: {
      id: string;
      email: string;
    };
    token: string;
  };
};

export const login = (credentials : LoginRequest) => {
  return apiClient<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
};