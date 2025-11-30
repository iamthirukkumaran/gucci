export interface Country {
  name: string;
  code: string;
  dialCode: string;
}

export const countries: Country[] = [
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "Australia", code: "AU", dialCode: "+61" },
  { name: "Germany", code: "DE", dialCode: "+49" },
  { name: "France", code: "FR", dialCode: "+33" },
  { name: "Italy", code: "IT", dialCode: "+39" },
  { name: "Spain", code: "ES", dialCode: "+34" },
  { name: "Netherlands", code: "NL", dialCode: "+31" },
  { name: "Belgium", code: "BE", dialCode: "+32" },
  { name: "Switzerland", code: "CH", dialCode: "+41" },
  { name: "Austria", code: "AT", dialCode: "+43" },
  { name: "Sweden", code: "SE", dialCode: "+46" },
  { name: "Norway", code: "NO", dialCode: "+47" },
  { name: "Denmark", code: "DK", dialCode: "+45" },
  { name: "Finland", code: "FI", dialCode: "+358" },
  { name: "Poland", code: "PL", dialCode: "+48" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420" },
  { name: "Hungary", code: "HU", dialCode: "+36" },
  { name: "Romania", code: "RO", dialCode: "+40" },
  { name: "Greece", code: "GR", dialCode: "+30" },
  { name: "Portugal", code: "PT", dialCode: "+351" },
  { name: "Ireland", code: "IE", dialCode: "+353" },
  { name: "Japan", code: "JP", dialCode: "+81" },
  { name: "South Korea", code: "KR", dialCode: "+82" },
  { name: "China", code: "CN", dialCode: "+86" },
  { name: "India", code: "IN", dialCode: "+91" },
  { name: "Thailand", code: "TH", dialCode: "+66" },
  { name: "Vietnam", code: "VN", dialCode: "+84" },
  { name: "Singapore", code: "SG", dialCode: "+65" },
  { name: "Malaysia", code: "MY", dialCode: "+60" },
  { name: "Indonesia", code: "ID", dialCode: "+62" },
  { name: "Philippines", code: "PH", dialCode: "+63" },
  { name: "Hong Kong", code: "HK", dialCode: "+852" },
  { name: "Taiwan", code: "TW", dialCode: "+886" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966" },
  { name: "Israel", code: "IL", dialCode: "+972" },
  { name: "Turkey", code: "TR", dialCode: "+90" },
  { name: "Russia", code: "RU", dialCode: "+7" },
  { name: "Mexico", code: "MX", dialCode: "+52" },
  { name: "Brazil", code: "BR", dialCode: "+55" },
  { name: "Argentina", code: "AR", dialCode: "+54" },
  { name: "Chile", code: "CL", dialCode: "+56" },
  { name: "Colombia", code: "CO", dialCode: "+57" },
  { name: "Peru", code: "PE", dialCode: "+51" },
  { name: "South Africa", code: "ZA", dialCode: "+27" },
  { name: "Egypt", code: "EG", dialCode: "+20" },
  { name: "Nigeria", code: "NG", dialCode: "+234" },
  { name: "Kenya", code: "KE", dialCode: "+254" },
  { name: "New Zealand", code: "NZ", dialCode: "+64" },
  { name: "Pakistan", code: "PK", dialCode: "+92" },
  { name: "Bangladesh", code: "BD", dialCode: "+880" },
  { name: "Sri Lanka", code: "LK", dialCode: "+94" },
  { name: "Ukraine", code: "UA", dialCode: "+380" },
  { name: "Croatia", code: "HR", dialCode: "+385" },
  { name: "Serbia", code: "RS", dialCode: "+381" },
  { name: "Iceland", code: "IS", dialCode: "+354" },
  { name: "Luxembourg", code: "LU", dialCode: "+352" },
  { name: "Malta", code: "MT", dialCode: "+356" },
  { name: "Cyprus", code: "CY", dialCode: "+357" },
  { name: "Slovenia", code: "SI", dialCode: "+386" },
  { name: "Slovakia", code: "SK", dialCode: "+421" },
  { name: "Bulgaria", code: "BG", dialCode: "+359" },
  { name: "Lithuania", code: "LT", dialCode: "+370" },
  { name: "Latvia", code: "LV", dialCode: "+371" },
  { name: "Estonia", code: "EE", dialCode: "+372" },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find((country) => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return countries.find((country) =>
    country.name.toLowerCase() === name.toLowerCase()
  );
};

export const filterCountries = (searchTerm: string): Country[] => {
  if (!searchTerm.trim()) return countries;
  
  const term = searchTerm.toLowerCase().replace("+", "");
  return countries.filter((country) =>
    country.name.toLowerCase().includes(term) ||
    country.code.toLowerCase().includes(term) ||
    country.dialCode.replace("+", "").includes(term)
  );
};
