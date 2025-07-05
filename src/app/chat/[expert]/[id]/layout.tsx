import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Chat - BrainTrade',
  description: 'Chat with blockchain investment experts',
};

export default function MarketplaceChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
