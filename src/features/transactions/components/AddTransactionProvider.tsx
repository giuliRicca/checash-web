'use client';

import { Suspense, createContext, lazy, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';

const AddTransactionModal = lazy(() => import('~features/transactions/components/AddTransactionModal'));

interface AddTransactionContextValue {
  openAddTransactionModal: () => void;
}

interface AddTransactionProviderProps {
  children: ReactNode;
}

const AddTransactionContext = createContext<AddTransactionContextValue | null>(null);

export function AddTransactionProvider({ children }: AddTransactionProviderProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const openAddTransactionModal = useCallback((): void => {
    setIsOpen(true);
  }, []);

  const closeAddTransactionModal = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const value = useMemo<AddTransactionContextValue>(
    () => ({ openAddTransactionModal }),
    [openAddTransactionModal],
  );

  return (
    <AddTransactionContext.Provider value={value}>
      {children}
      {isOpen ? (
        <Suspense fallback={<ModalFallback />}>
          <AddTransactionModal onClose={closeAddTransactionModal} />
        </Suspense>
      ) : null}
    </AddTransactionContext.Provider>
  );
}

function ModalFallback(): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl border border-border bg-surface p-6 shadow-xl sm:rounded-2xl">
        <SuspenseLoader label="Loading transaction form" />
      </div>
    </div>
  );
}

export function useAddTransaction(): AddTransactionContextValue {
  const context = useContext(AddTransactionContext);

  if (context === null) {
    throw new Error('useAddTransaction must be used inside AddTransactionProvider');
  }

  return context;
}

export default AddTransactionProvider;
