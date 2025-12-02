export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginUserResponse {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
}

