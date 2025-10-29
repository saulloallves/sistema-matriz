/**
 * Tipos para o módulo de Aprovação de Cadastros (Onboarding)
 * Este módulo gerencia solicitações de cadastro vindas do sistema swift-data
 */

// Status possíveis de uma solicitação de onboarding
export type OnboardingStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'error';

// Tipos de solicitação baseados na existência de franqueado/unidade
export type OnboardingRequestType = 
  | 'new_franchisee_new_unit'          // Criar ambos
  | 'existing_franchisee_new_unit'     // Criar apenas unidade
  | 'new_franchisee_existing_unit';    // Criar apenas franqueado

/**
 * Estrutura completa dos dados do formulário de cadastro
 * Todos os campos são extraídos do campo JSONB 'form_data'
 */
export interface OnboardingFormData {
  // ========== DADOS PESSOAIS DO FRANQUEADO ==========
  full_name: string;
  cpf_rnm: string;
  email: string;
  phone: string;
  contact: string;
  birth_date: string;
  nationality: string;
  education: string;
  instagram?: string;
  instagram_profile?: string;
  profile_image?: string;
  
  // ========== ENDEREÇO DO FRANQUEADO ==========
  franchisee_address: string;
  franchisee_number_address: string;
  franchisee_address_complement?: string;
  has_complement: boolean;
  franchisee_neighborhood: string;
  franchisee_city: string;
  franchisee_state: string;
  franchisee_uf: string;
  franchisee_postal_code: string;
  franchisee_email: string;
  
  // ========== DADOS DA UNIDADE ==========
  cnpj: string;
  fantasy_name: string;
  group_code: number;
  group_name: string;
  store_model: string;
  store_phase: string;
  store_imp_phase: string;
  
  // ========== ENDEREÇO DA UNIDADE ==========
  unit_address: string;
  unit_number_address: string;
  unit_address_complement?: string;
  has_unit_complement: boolean;
  unit_neighborhood: string;
  unit_city: string;
  unit_state: string;
  unit_uf: string;
  unit_postal_code: string;
  
  // ========== HORÁRIOS DE OPERAÇÃO ==========
  operation_mon: string;
  operation_tue: string;
  operation_wed: string;
  operation_thu: string;
  operation_fri: string;
  operation_sat: string;
  operation_sun: string;
  operation_hol: string;
  
  // ========== OUTRAS INFORMAÇÕES ==========
  owner_type: string;
  availability: string;
  discovery_source: string;
  was_entrepreneur: boolean;
  previous_profession: string;
  previous_salary_range: string;
  has_other_activities: boolean;
  other_activities_description?: string;
  receives_prolabore: boolean;
  prolabore_value: number;
  has_parking: boolean;
  parking_spots: number;
  has_partner_parking: boolean;
  partner_parking_address?: string;
  was_referred: boolean;
  referrer_name?: string;
  referrer_unit_code?: string;
  sales_active: boolean;
  purchases_active: boolean;
  
  // ========== TERMOS ACEITOS ==========
  lgpd_term_accepted: boolean;
  system_term_accepted: boolean;
  confidentiality_term_accepted: boolean;
  
  // ========== METADADOS OPCIONAIS ==========
  termsVersion?: string;
  [key: string]: string | number | boolean | undefined; // Para campos adicionais futuros
}

/**
 * Estrutura principal da tabela onboarding_requests
 */
export interface OnboardingRequest {
  id: string;
  request_number: string;                // Protocolo único (ex: "ONB-2025-00001")
  
  // Dados completos do formulário
  form_data: OnboardingFormData;
  
  // Campos extraídos para queries rápidas
  franchisee_cpf: string;
  franchisee_email: string;
  unit_cnpj: string;
  
  // Flags de existência (verificação automática)
  franchisee_exists: boolean;
  franchisee_id?: string;
  unit_exists: boolean;
  unit_id?: string;
  
  // Status e classificação
  status: OnboardingStatus;
  request_type: OnboardingRequestType;
  
  // Informações de revisão/aprovação
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  
  // Resultado do processamento (quando aprovado)
  processing_result?: {
    franchisee_id: string;
    unit_id: string;
    system_password: number;
    created_at: string;
  };
  
  // Metadados da submissão
  ip_address?: string;
  user_agent?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  
  // Dados relacionados (joins)
  reviewed_by_user?: {
    nome_completo?: string;
    email?: string;
  };
}

/**
 * Estrutura da tabela onboarding_request_history
 * Registra todas as mudanças de status para auditoria
 */
export interface OnboardingRequestHistory {
  id: string;
  request_id: string;
  status_from: OnboardingStatus;
  status_to: OnboardingStatus;
  changed_by?: string;
  changed_at: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  
  // Dados relacionados (joins)
  changed_by_user?: {
    nome_completo?: string;
    email?: string;
  };
}

/**
 * Estatísticas do dashboard de onboarding
 */
export interface OnboardingStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  processing: number;
  error: number;
  last_7_days: number;
  pending_over_48h: number;
}

/**
 * Parâmetros para aprovação/rejeição de request
 */
export interface ApproveRequestParams {
  requestId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
  reviewerId?: string;
}

/**
 * Resposta da Edge Function de aprovação
 */
export interface ApprovalResponse {
  success: boolean;
  message: string;
  franchiseeId?: string;
  unitId?: string;
  error?: string;
}

/**
 * Filtros para a listagem de requests
 */
export interface OnboardingFilters {
  status?: OnboardingStatus | 'all';
  requestType?: OnboardingRequestType;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}
