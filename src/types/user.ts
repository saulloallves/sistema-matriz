export interface User {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  status: 'ativo' | 'inativo';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  email?: string;
}

export interface CreateUserFormData {
  full_name: string;
  email: string;
  phone_number: string;
  notes?: string;
}