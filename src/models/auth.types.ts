export interface Usuario {
  id: string;
  name: string;      
  email: string;
  role: 'user' | 'superadmin'; 
  status: 'PENDING' | 'ACTIVE' | 'BANNED'; 
  createdAt: string; 
}

export interface AuthResponse {
  token: string;
  user: Usuario;     
}