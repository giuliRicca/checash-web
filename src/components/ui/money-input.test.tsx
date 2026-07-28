import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { MoneyInput } from './money-input';

function ControlledMoneyInput(): JSX.Element {
  const [value, setValue] = useState('10');
  return <MoneyInput aria-label="Amount" value={value} onChange={(event) => setValue(event.target.value)} />;
}

describe('MoneyInput', () => {
  it('shows dollar prefix and forwards input changes', () => {
    render(<ControlledMoneyInput />);

    expect(screen.getByText('$')).toBeVisible();
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveValue('10');
    fireEvent.change(input, { target: { value: '25' } });
    expect(input).toHaveValue('25');
  });
});
