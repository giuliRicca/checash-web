import type { RateType } from '~types/api';

interface RateTypeOption {
  value: RateType;
  label: string;
}

export const rateTypeOptions: readonly RateTypeOption[] = [
  { value: 'oficial', label: 'Oficial' },
  { value: 'blue', label: 'Blue' },
  { value: 'mep', label: 'MEP' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'crypto', label: 'Crypto' },
];
