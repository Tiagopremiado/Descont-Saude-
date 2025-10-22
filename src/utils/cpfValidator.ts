// A simple CPF validator function
export const isValidCPF = (cpf: string): boolean => {
  if (typeof cpf !== 'string') return false;
  
  // Remove non-digit characters
  cpf = cpf.replace(/[^\d]+/g, '');
  
  // CPF must have 11 digits
  if (cpf.length !== 11) return false;

  // Check for known invalid CPFs (e.g., '111.111.111-11')
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  let remainder;

  // Validate first check digit
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(9, 10))) {
    return false;
  }

  // Validate second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cpf.substring(10, 11))) {
    return false;
  }

  return true;
};

// Formats a string into a CPF mask (xxx.xxx.xxx-xx)
export const formatCPF = (value: string): string => {
  const digitsOnly = value.replace(/\D/g, '');
  const truncated = digitsOnly.slice(0, 11);
  
  let formatted = truncated;
  if (truncated.length > 9) {
    formatted = `${truncated.slice(0, 3)}.${truncated.slice(3, 6)}.${truncated.slice(6, 9)}-${truncated.slice(9)}`;
  } else if (truncated.length > 6) {
    formatted = `${truncated.slice(0, 3)}.${truncated.slice(3, 6)}.${truncated.slice(6)}`;
  } else if (truncated.length > 3) {
    formatted = `${truncated.slice(0, 3)}.${truncated.slice(3)}`;
  }
  
  return formatted;
};