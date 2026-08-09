/**
 * Indian Rupee (₹) and Indian Number Formatting Utilities
 */

export const formatINR = (amount, options = {}) => {
  const { compact = false, showSymbol = true } = options;

  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const num = Number(amount);
  const symbol = showSymbol ? '₹' : '';

  if (compact) {
    const absNum = Math.abs(num);
    if (absNum >= 10000000) { // 1 Crore = 10,000,000
      return `${symbol}${(num / 10000000).toFixed(2)} Cr`;
    }
    if (absNum >= 100000) { // 1 Lakh = 100,000
      return `${symbol}${(num / 100000).toFixed(2)} Lakh`;
    }
  }

  const parts = num.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }

  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const result = `${isNegative ? '-' : ''}${formattedInteger}.${decimalPart}`;

  return `${symbol}${result}`;
};

export const formatIndianNumber = (num) => {
  return formatINR(num, { showSymbol: false });
};

export const formatPercent = (value, showSign = true) => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  const val = Number(value);
  const sign = showSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
};
