import type { Metadata } from 'next';

interface ChatLayoutProps {
  children: React.ReactNode;
  params: Promise<{ expert: string; id: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ expert: string; id: string }>;
}): Promise<Metadata> {
  const { expert } = await params;
  // You could fetch expert data here for dynamic metadata
  return {
    title: `Expert Chat - BrainTrade`,
    description: `Personal consultation with expert ${expert}`,
  };
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  return <>{children}</>;
}