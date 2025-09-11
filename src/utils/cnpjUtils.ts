/**
 * Remove a máscara do CNPJ, deixando apenas os números
 */
export const removeCnpjMask = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '');
};

/**
 * Aplica a máscara visual do CNPJ
 */
export const applyCnpjMask = (cnpj: string): string => {
  const numbers = removeCnpjMask(cnpj);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

/**
 * Valida se o CNPJ é válido usando o algoritmo de verificação
 */
export const validateCnpj = (cnpj: string): boolean => {
  const numbers = removeCnpjMask(cnpj);
  
  // Verifica se tem 14 dígitos
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  let digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers.charAt(12)) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  let digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers.charAt(13)) === digit2;
};

/**
 * Retorna uma mensagem de erro para CNPJ inválido ou null se válido
 */
export const getCnpjValidationError = (cnpj: string): string | null => {
  if (!cnpj.trim()) return null; // Campo vazio é permitido
  
  const numbers = removeCnpjMask(cnpj);
  
  if (numbers.length !== 14) {
    return 'CNPJ deve ter 14 dígitos';
  }
  
  if (!validateCnpj(cnpj)) {
    return 'CNPJ inválido';
  }
  
  return null;
};