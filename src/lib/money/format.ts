const ARGENTINA_LOCALE = 'es-AR';

const moneyFormatter = new Intl.NumberFormat(ARGENTINA_LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

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
