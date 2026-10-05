/**
 * SWIFTRoute Currency Configuration
 * 
 * Central currency utility for consistent INR formatting across the application
 */

export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  locale: 'en-IN',
  name: 'Indian Rupee'
} as const;

/**
 * Format a number as Indian Rupee currency
 * @param amount - The numeric amount to format
 * @returns Formatted currency string (e.g., "₹1,000.00")
 */
export const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return `${CURRENCY.symbol}0.00`;
  }

  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Format a number as Indian Rupee without the symbol
 * @param amount - The numeric amount to format
 * @returns Formatted number string (e.g., "1,000.00")
 */
export const formatAmount = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0.00';
  }

  return new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Get the currency symbol
 * @returns Currency symbol (₹)
 */
export const getCurrencySymbol = (): string => CURRENCY.symbol;

/**
 * Get the currency code
 * @returns Currency code (INR)
 */
export const getCurrencyCode = (): string => CURRENCY.code;

/**
 * Get the locale
 * @returns Locale string (en-IN)
 */
export const getCurrencyLocale = (): string => CURRENCY.locale;
