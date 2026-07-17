'use client';

import { Wallet } from 'lucide-react';

import { Button, IconBadge, Panel } from '~components/ui';

interface FirstAccountOnboardingProps {
  onCreateAccount: () => void;
}

export function FirstAccountOnboarding({ onCreateAccount }: FirstAccountOnboardingProps): JSX.Element {
  return (
    <Panel className="border-primary/30 bg-primary-muted/30">
      <Panel.Body>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <IconBadge tone="primary">
              <Wallet size={22} />
            </IconBadge>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Create your first account</h2>
              <p className="text-sm text-muted">Chat needs an account before it can parse expenses.</p>
            </div>
          </div>
          <Button className="w-full sm:w-auto" size="lg" type="button" onClick={onCreateAccount}>
            Create account
          </Button>
        </div>
      </Panel.Body>
    </Panel>
  );
}

export default FirstAccountOnboarding;
