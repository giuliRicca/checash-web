'use client';

import { Suspense } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { useAccountsQuery } from '~features/accounts';
import { AuthenticatedApp } from '~features/auth';
import { ChatPanel } from '~features/chat';
import { useCategoriesQuery } from '~features/categories';

function ChatContent(): JSX.Element {
  const { data: accounts } = useAccountsQuery();
  const { data: categories } = useCategoriesQuery();

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <header className="flex flex-col gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Chat</h1>
          <p className="mt-2 text-base text-muted">Add money movements through conversation</p>
        </div>
      </header>
      <ChatPanel accounts={accounts} categories={categories} />
    </div>
  );
}

export default function ChatPage(): JSX.Element {
  return (
    <AuthenticatedApp>
      <Suspense fallback={<SuspenseLoader label="Loading chat" />}>
        <ChatContent />
      </Suspense>
    </AuthenticatedApp>
  );
}
