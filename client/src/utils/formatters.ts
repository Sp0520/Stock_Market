// Indian Standard Formatters (INR Currency & Indian Numbering System)

/**
 * Formats numbers into Indian Currency Format:
 * e.g., ₹10,250 | ₹1,20,000 | ₹12,45,680.50 | ₹5.25 Lakh Cr
 */
export function formatINR(
  val: number | null | undefined,
  options: { showSign?: boolean; compact?: boolean; precision?: number } = {}
): string {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";

  const { showSign = false, compact = false, precision = 2 } = options;
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  let formattedStr = "";

  if (compact) {
    if (absVal >= 10000000000000) {
      formattedStr = `₹${(absVal / 1000000000000).toFixed(2)} Lakh Cr`;
    } else if (absVal >= 10000000000) {
      formattedStr = `₹${(absVal / 10000000).toFixed(2)} Cr`;
    } else if (absVal >= 100000) {
      formattedStr = `₹${(absVal / 100000).toFixed(2)} Lakh`;
    } else {
      formattedStr = formatIndianNumber(absVal, precision);
    }
  } else {
    formattedStr = formatIndianNumber(absVal, precision);
  }

  const signStr = isNegative ? "-₹" : showSign ? "+₹" : "₹";
  return formattedStr.startsWith("₹") ? (isNegative ? "-" + formattedStr : (showSign ? "+" : "") + formattedStr) : `${signStr}${formattedStr}`;
}

/**
 * Custom Indian numbering separator: 12,45,680.50
 */
export function formatIndianNumber(num: number, precision: number = 2): string {
  const parts = num.toFixed(precision).split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1] !== undefined ? "." + parts[1] : "";

  // Last 3 digits
  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherDigits = integerPart.substring(0, integerPart.length - 3);

  if (otherDigits !== "") {
    integerPart = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  } else {
    integerPart = lastThree;
  }

  return integerPart + decimalPart;
}

export function formatPercent(val: number | null | undefined, showSign: boolean = true): string {
  if (val === null || val === undefined || isNaN(val)) return "0.00%";
  const sign = val > 0 && showSign ? "+" : "";
  return `${sign}${val.toFixed(2)}%`;
}

export function formatIndianDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
}
