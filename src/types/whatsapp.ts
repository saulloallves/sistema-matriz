import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type WhatsAppGroup = Tables<'unidades_grupos_whatsapp'>;
export type WhatsAppGroupInsert = TablesInsert<'unidades_grupos_whatsapp'>;
export type WhatsAppGroupUpdate = TablesUpdate<'unidades_grupos_whatsapp'>;

export type WhatsAppGroupKind = 
  | 'main'
  | 'ai'
  | 'intensive_support'
  | 'colab'
  | 'complaining'
  | 'notifications'
  | 'purchasing_phase';

export interface WhatsAppGroupWithUnidade extends WhatsAppGroup {
  unidade_name?: string;
  unidade_code?: number;
}

export const whatsappGroupKindLabels: Record<WhatsAppGroupKind, string> = {
  main: 'Principal',
  ai: 'IA',
  intensive_support: 'Suporte Intensivo',
  colab: 'Colaboradores',
  complaining: 'Reclamações',
  notifications: 'Notificações',
  purchasing_phase: 'Fase de Compras'
};

export const whatsappGroupKindColors: Record<WhatsAppGroupKind, string> = {
  main: 'primary',
  ai: 'secondary',
  intensive_support: 'warning',
  colab: 'success',
  complaining: 'error',
  notifications: 'info',
  purchasing_phase: 'default'
};