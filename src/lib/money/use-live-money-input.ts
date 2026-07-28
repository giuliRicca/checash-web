'use client';

import type { ChangeEvent, RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

import { formatLiveMoneyInput } from './format';

interface LiveMoneyInput {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setValue: (value: string) => void;
}

export function useLiveMoneyInput(initialValue: string): LiveMoneyInput {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretPositionRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const caretPosition = caretPositionRef.current;
    if (caretPosition !== null && inputRef.current !== null) {
      inputRef.current.setSelectionRange(caretPosition, caretPosition);
      caretPositionRef.current = null;
    }
  }, [value]);

  function onChange(event: ChangeEvent<HTMLInputElement>): void {
    const formattedInput = formatLiveMoneyInput(event.target.value, event.target.selectionStart ?? event.target.value.length);
    caretPositionRef.current = formattedInput.caretPosition;
    setValue(formattedInput.value);
  }

  return { inputRef, value, onChange, setValue };
}
