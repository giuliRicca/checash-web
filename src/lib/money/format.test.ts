import { describe, expect, it } from 'vitest';

import { formatCompactMoneyAmount, formatLiveMoneyInput } from './format';

describe('formatLiveMoneyInput', () => {
  it('adds grouping separators without adding a decimal fraction', () => {
    expect(formatLiveMoneyInput('1234', 4)).toEqual({ value: '1.234', caretPosition: 5 });
    expect(formatLiveMoneyInput('1234567', 7)).toEqual({ value: '1.234.567', caretPosition: 9 });
  });

  it('keeps a decimal fraction only after the user enters a separator', () => {
    expect(formatLiveMoneyInput('1234,', 5)).toEqual({ value: '1.234,', caretPosition: 6 });
    expect(formatLiveMoneyInput('1234,5', 6)).toEqual({ value: '1.234,5', caretPosition: 7 });
    expect(formatLiveMoneyInput('1234,56', 7)).toEqual({ value: '1.234,56', caretPosition: 8 });
  });

  it('keeps the cursor aligned after separators are inserted or removed', () => {
    expect(formatLiveMoneyInput('12934', 3)).toEqual({ value: '12.934', caretPosition: 4 });
    expect(formatLiveMoneyInput('1234', 3)).toEqual({ value: '1.234', caretPosition: 4 });
  });

  it('normalizes decimal dots and ignores non-numeric input', () => {
    expect(formatLiveMoneyInput('12.34', 5)).toEqual({ value: '12,34', caretPosition: 5 });
    expect(formatLiveMoneyInput('', 0)).toEqual({ value: '', caretPosition: 0 });
    expect(formatLiveMoneyInput('abc', 3)).toEqual({ value: '', caretPosition: 0 });
  });

  it('keeps a leading minus while entering negative balances', () => {
    expect(formatLiveMoneyInput('-', 1)).toEqual({ value: '-', caretPosition: 1 });
    expect(formatLiveMoneyInput('-1234,5', 7)).toEqual({ value: '-1.234,5', caretPosition: 8 });
  });
});

describe('formatCompactMoneyAmount', () => {
  it('keeps million-scale chart labels compact', () => {
    expect(formatCompactMoneyAmount(20_033_670.84)).toMatch(/20(?:,0)?\s?M/);
  });
});
