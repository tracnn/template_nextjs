export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'pharmacist' | 'viewer';
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
