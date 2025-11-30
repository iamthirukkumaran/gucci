// Phone validation rules by country code
export const phoneValidationRules: Record<string, { maxDigits: number; format: string }> = {
  US: { maxDigits: 10, format: "(XXX) XXX-XXXX" },
  CA: { maxDigits: 10, format: "(XXX) XXX-XXXX" },
  GB: { maxDigits: 11, format: "XXXXX XXXXXX" },
  IN: { maxDigits: 10, format: "XXXXXXXXXX" },
  DE: { maxDigits: 11, format: "XXXXXXXXXXXX" },
  FR: { maxDigits: 9, format: "XXX XXX XXX" },
  IT: { maxDigits: 10, format: "XXX XXX XXXX" },
  ES: { maxDigits: 9, format: "XXX XXX XXX" },
  AU: { maxDigits: 9, format: "XXXX XXX XXX" },
  JP: { maxDigits: 10, format: "XX-XXXX-XXXX" },
  CN: { maxDigits: 11, format: "XXXXXXXXXXX" },
  SG: { maxDigits: 8, format: "XXXX XXXX" },
  MX: { maxDigits: 10, format: "XXXX XXX XXXX" },
  BR: { maxDigits: 11, format: "XX XXXXX-XXXX" },
  ZA: { maxDigits: 10, format: "XX XXX XXXX" },
  NZ: { maxDigits: 9, format: "XXX XXX XXXX" },
  HK: { maxDigits: 8, format: "XXXX XXXX" },
  AE: { maxDigits: 9, format: "XXX XXX XXXX" },
  SA: { maxDigits: 9, format: "XX XXX XXXX" },
};

// Default for countries not listed
const DEFAULT_MAX_DIGITS = 15;

export const getMaxPhoneDigits = (countryCode: string): number => {
  return phoneValidationRules[countryCode]?.maxDigits || DEFAULT_MAX_DIGITS;
};

export const getPhoneFormat = (countryCode: string): string => {
  return phoneValidationRules[countryCode]?.format || "Phone number format";
};

// Extract only digits from phone string
export const extractDigits = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

// Validate phone digits count for a country
export const isPhoneValid = (phone: string, countryCode: string): boolean => {
  const digits = extractDigits(phone);
  const maxDigits = getMaxPhoneDigits(countryCode);
  return digits.length <= maxDigits;
};

// Get validation message
export const getPhoneValidationMessage = (countryCode: string): string => {
  const maxDigits = getMaxPhoneDigits(countryCode);
  return `Maximum ${maxDigits} digits allowed`;
};
