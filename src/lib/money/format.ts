const ARGENTINA_LOCALE = 'es-AR';

const moneyFormatter = new Intl.NumberFormat(ARGENTINA_LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyInputIntegerFormatter = new Intl.NumberFormat(ARGENTINA_LOCALE, {
  maximumFractionDigits: 0,
});

const compactMoneyFormatter = new Intl.NumberFormat(ARGENTINA_LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export interface LiveMoneyInputFormat {
  value: string;
  caretPosition: number;
}

interface MoneyInputParts {
  isNegative: boolean;
  integer: string;
  fraction: string;
  hasDecimalSeparator: boolean;
  decimalIndex: number | null;
}

function getMoneyInputParts(value: string): MoneyInputParts {
  const sanitizedValue = value.replace(/\s/g, '');
  const isNegative = sanitizedValue.startsWith('-');
  const lastCommaIndex = sanitizedValue.lastIndexOf(',');
  const lastDotIndex = sanitizedValue.lastIndexOf('.');
  const hasComma = lastCommaIndex !== -1;
  const hasDot = lastDotIndex !== -1;
  const decimalIndex = hasComma
    ? lastCommaIndex
    : hasDot && sanitizedValue.split('.').length === 2 && sanitizedValue.slice(lastDotIndex + 1).length < 3
      ? lastDotIndex
      : null;
  const integerPart = decimalIndex === null ? sanitizedValue : sanitizedValue.slice(0, decimalIndex);
  const fractionPart = decimalIndex === null ? '' : sanitizedValue.slice(decimalIndex + 1);

  return {
    isNegative,
    integer: integerPart.replace(/\D/g, ''),
    fraction: fractionPart.replace(/\D/g, '').slice(0, 2),
    hasDecimalSeparator: decimalIndex !== null,
    decimalIndex,
  };
}

function positionAfterDigits(value: string, digitCount: number): number {
  if (digitCount === 0) return 0;

  let seenDigits = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? '')) {
      seenDigits += 1;
      if (seenDigits === digitCount) return index + 1;
    }
  }

  return value.length;
}

export function formatLiveMoneyInput(value: string, caretPosition: number): LiveMoneyInputFormat {
  const parts = getMoneyInputParts(value);
  if (parts.integer === '' && !parts.hasDecimalSeparator) {
    return parts.isNegative ? { value: '-', caretPosition: 1 } : { value: '', caretPosition: 0 };
  }

  const formattedInteger = `${parts.isNegative ? '-' : ''}${moneyInputIntegerFormatter.format(BigInt(parts.integer || '0'))}`;
  const formattedValue = parts.hasDecimalSeparator ? `${formattedInteger},${parts.fraction}` : formattedInteger;
  const boundedCaretPosition = Math.min(Math.max(caretPosition, 0), value.length);
  const digitsBeforeCaret = value.slice(0, boundedCaretPosition).replace(/\D/g, '').length;

  if (parts.decimalIndex !== null && boundedCaretPosition > parts.decimalIndex) {
    const fractionDigitsBeforeCaret = value.slice(parts.decimalIndex + 1, boundedCaretPosition).replace(/\D/g, '').length;
    return {
      value: formattedValue,
      caretPosition: formattedInteger.length + 1 + Math.min(fractionDigitsBeforeCaret, parts.fraction.length),
    };
  }

  if (parts.isNegative && boundedCaretPosition > 0 && digitsBeforeCaret === 0) {
    return { value: formattedValue, caretPosition: 1 };
  }

  return {
    value: formattedValue,
    caretPosition: positionAfterDigits(formattedInteger, Math.min(digitsBeforeCaret, parts.integer.length)),
  };
}

function normalizeInput(value: string): string {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return '';
  }

  const sanitizedValue = trimmedValue.replace(/\s/g, '');
  const lastCommaIndex = sanitizedValue.lastIndexOf(',');
  const lastDotIndex = sanitizedValue.lastIndexOf('.');
  const decimalSeparator = lastCommaIndex > lastDotIndex ? ',' : '.';
  const hasComma = lastCommaIndex !== -1;
  const hasDot = lastDotIndex !== -1;

  if (hasComma && hasDot) {
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    return sanitizedValue.replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '').replace(decimalSeparator, '.');
  }

  if (hasComma) {
    return sanitizedValue.replace(/\./g, '').replace(',', '.');
  }

  if (hasDot) {
    const parts = sanitizedValue.split('.');
    const lastPart = parts[parts.length - 1] ?? '';

    if (parts.length > 2 || lastPart.length === 3) {
      return parts.join('');
    }
  }

  return sanitizedValue;
}

export function parseMoneyInput(value: string): string {
  const normalizedValue = normalizeInput(value);
  const numericValue = Number(normalizedValue);

  if (normalizedValue === '' || !Number.isFinite(numericValue)) {
    return '';
  }

  return numericValue.toFixed(2);
}

export function isValidMoneyInput(value: string): boolean {
  const parsedValue = parseMoneyInput(value);
  const numericValue = Number(parsedValue);

  return parsedValue !== '' && Number.isFinite(numericValue) && numericValue > 0;
}

export function formatMoneyAmount(value: string | number | null): string {
  if (value === null) {
    return '';
  }

  const numericValue = typeof value === 'number' ? value : Number(parseMoneyInput(value) || value);

  if (!Number.isFinite(numericValue)) {
    return '';
  }

  return moneyFormatter.format(numericValue);
}

export function formatCompactMoneyAmount(value: number): string {
  return compactMoneyFormatter.format(value);
}

export function formatMoneyInput(value: string): string {
  const parsedValue = parseMoneyInput(value);

  return parsedValue === '' ? value : formatMoneyAmount(parsedValue);
}

export function formatMoneyWithCurrency(value: string | number | null, currency: string | null): string {
  const formattedAmount = formatMoneyAmount(value);

  if (formattedAmount === '' || currency === null) {
    return 'Unknown amount';
  }

  return `${currency} ${formattedAmount}`;
}
