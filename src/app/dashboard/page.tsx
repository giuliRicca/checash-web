import { Dashboard } from '~features/dashboard';
import type { AuthMode } from '~features/auth/components/AuthCard';

interface DashboardPageProps {
  searchParams: Promise<{ auth?: string | string[] }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps): Promise<JSX.Element> {
  const { auth } = await searchParams;
  const authMode: AuthMode = auth === 'register' ? 'register' : 'login';

  return <Dashboard authMode={authMode} />;
}
