'use client';

import { Suspense } from 'react';

import { SuspenseLoader } from '~components/SuspenseLoader';
import { AuthenticatedApp } from '~features/auth';
import { BudgetsPage } from '~features/budgets';

export default function BudgetsRoute(): JSX.Element {
  return <AuthenticatedApp><Suspense fallback={<SuspenseLoader label="Loading budgets" />}><BudgetsPage /></Suspense></AuthenticatedApp>;
}
