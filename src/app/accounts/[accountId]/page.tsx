import { AccountDetailPage } from '~features/accounts/components/AccountDetailPage';

interface AccountRoutePageProps {
  params: {
    accountId: string;
  };
}

export default function AccountRoutePage({ params }: AccountRoutePageProps): JSX.Element {
  return <AccountDetailPage accountId={params.accountId} />;
}
