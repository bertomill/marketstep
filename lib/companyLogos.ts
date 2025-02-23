export const companyLogos: Record<string, string> = {
  'AAPL': '/company-logos/apple.png',
  'GOOGL': '/company-logos/google.png',
  'MSFT': '/company-logos/microsoft.png',
  'AMZN': '/company-logos/amazon.png',
  'META': '/company-logos/meta.png',
  'NVDA': '/company-logos/nvidia.png'
};

export function getCompanyLogo(symbol: string): string {
  return companyLogos[symbol] || '/icons/company-default.svg';
} 