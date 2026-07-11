'use client';

import { Panel } from '~components/ui';
import { AuthenticatedApp } from '~features/auth';

export default function SettingsPage(): JSX.Element {
  return (
    <AuthenticatedApp>
      <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
        <header className="flex flex-col gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Settings</h1>
            <p className="mt-2 text-base text-muted">Account and app preferences will live here.</p>
          </div>
        </header>

        <Panel>
          <Panel.Header>
            <Panel.Title>Coming soon</Panel.Title>
          </Panel.Header>
          <Panel.Body>
            <p className="text-muted">Settings are not available yet.</p>
          </Panel.Body>
        </Panel>
      </div>
    </AuthenticatedApp>
  );
}
