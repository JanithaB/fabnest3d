/**
 * Currency formatting utility
 * Formats numbers as LKR (Sri Lankan Rupees)
 */

/**
 * Format a number as LKR currency
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "LKR 1,234.56")
 */
export function formatCurrency(amount: number | null | undefined, decimals: number = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "LKR 0.00"
  }
  
  return `LKR ${amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

/**
 * Format a number as LKR currency without the "LKR" prefix (just the number with commas)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "1,234.56")
 */
export function formatCurrencyAmount(amount: number | null | undefined, decimals: number = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00"
  }
  
  return amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

