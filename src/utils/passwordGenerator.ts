/**
 * Gera senha do sistema baseada no código da unidade
 * @param groupCode - Código da unidade (sempre 4 dígitos)
 * @returns Senha numérica de 8 dígitos
 */
export const generateSystemPassword = (groupCode: number): number => {
  // Código da unidade com 4 dígitos
  const codigo = String(groupCode).padStart(4, "0");
  
  // Número aleatório de 4 dígitos
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  
  // Intercala: random[0] + codigo[0] + random[1] + codigo[1] + ...
  let senha = "";
  for (let i = 0; i < 4; i++) {
    senha += random[i] + codigo[i];
  }
  
  return parseInt(senha, 10);
};
