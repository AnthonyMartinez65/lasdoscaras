export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'SUPERADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  user: User;
  activationToken: string;
}