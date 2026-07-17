import { AccountDetailPage } from '~features/accounts/components/AccountDetailPage';

interface AccountRoutePageProps {
  params: Promise<{ accountId: string }>;
}

export default async function AccountRoutePage({ params }: AccountRoutePageProps): Promise<JSX.Element> {
  const { accountId } = await params;
  return <AccountDetailPage accountId={accountId} />;
}
