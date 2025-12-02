import { ApiResponse } from "./common";
import { LoginUserResponse } from "./user";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  refreshToken: string;
  user: LoginUserResponse;
}

export interface LoginResponse extends ApiResponse<LoginResponseData> {}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponseData {
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse extends ApiResponse<RefreshTokenResponseData> {}

export interface GetProfileResponseData {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  role_id: string;
}

export interface GetProfileResponse extends ApiResponse<GetProfileResponseData> {}

