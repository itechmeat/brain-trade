'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat';
import { Button } from '@/components/ui/Button/Button';
import { ExpertAvatar } from '@/components/experts/ExpertAvatar/ExpertAvatar';
import investmentExperts from '@/data/investment_experts.json';
import type { InvestmentExpert } from '@/types/expert';
import type { ChatSession, ChatMessage } from '@/types/chat';
import styles from './page.module.scss';

export default function ExpertChatPage() {
  const router = useRouter();
  const params = useParams();
  const expertSlug = params.expert as string;
  const chatId = params.id as string;

  // Find the expert
  const experts = investmentExperts as InvestmentExpert[];
  const expert = experts.find(e => e.slug === expertSlug);

  // Simple chat state for single expert
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize session
  useEffect(() => {
    if (expert && chatId && !isInitialized) {
      const initializeSession = async () => {
        try {
          console.log(`Initializing session for chatId: ${chatId}`);

          // Try to get existing session first
          const getResponse = await fetch(`/api/chats/${chatId}`);

          if (getResponse.ok) {
            const getData = await getResponse.json();
            if (getData.success) {
              console.log('Found existing session:', getData.data.id);
              setSession(getData.data);
              setMessages(getData.data.messages || []);
              return;
            }
          } else if (getResponse.status === 404) {
            console.log('Session not found (404), will create new one...');
          } else {
            console.error('Unexpected error getting session:', getResponse.status);
          }

          console.log('Session not found, creating new one...');

          // Create new session if not exists
          const createResponse = await fetch('/api/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: chatId,
              originalIdea: `Consultation with expert ${expert.name}`,
              expertId: expertSlug,
            }),
          });

          if (createResponse.ok) {
            const createData = await createResponse.json();
            if (createData.success) {
              console.log('Created new session:', createData.data.id);
              setSession(createData.data);
              setMessages(createData.data.messages || []);
            } else {
              console.error('Failed to create session:', createData.error);
              throw new Error(createData.error);
            }
          } else {
            console.error('Create session request failed:', createResponse.status);
            throw new Error('Failed to create session');
          }
        } catch (error) {
          console.error('Error initializing session:', error);
          // Fallback to local session
          const fallbackSession: ChatSession = {
            id: chatId,
            title: `Chat with ${expert.name}`,
            originalIdea: `Consultation with expert ${expert.name}`,
            expertId: expertSlug,
            messages: [],
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          console.log('Using fallback session:', fallbackSession.id);
          setSession(fallbackSession);
        } finally {
          setIsInitialized(true);
        }
      };

      initializeSession();
    }
  }, [expert, expertSlug, chatId, isInitialized]);

  // Redirect if expert not found
  useEffect(() => {
    if (!expert) {
      router.push('/');
    }
  }, [expert, router]);

  const handleSendMessage = async (content: string) => {
    if (!expert || !session) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to local state immediately
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        chatId: session.id,
        content,
        timestamp: new Date(),
        type: 'user',
      };

      setMessages(prev => [...prev, userMessage]);

      // Call the real API to get expert response
      const response = await fetch(`/api/chats/${session.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type: 'expert',
          expertId: expert.slug,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get expert response');
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(responseData.error || 'Expert response failed');
      }

      // Convert timestamp string to Date object if needed
      const expertResponse = responseData.data.message;
      if (expertResponse.timestamp && typeof expertResponse.timestamp === 'string') {
        expertResponse.timestamp = new Date(expertResponse.timestamp);
      }

      // Add expert response to messages
      setMessages(prev => [...prev, expertResponse]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get expert response');
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleEndSession = () => {
    if (session) {
      setSession({ ...session, status: 'completed' });
    }
  };

  if (!expert) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h1>Expert not found</h1>
          <Button onClick={handleBackToHome} variant="primary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with expert info */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Button
            onClick={handleBackToHome}
            variant="outline"
            size="sm"
            className={styles.backButton}
          >
            ← Back
          </Button>

          <div className={styles.expertInfo}>
            <ExpertAvatar expert={expert} size="md" showName={false} />
            <div className={styles.expertDetails}>
              <h1 className={styles.expertName}>{expert.name}</h1>
              {expert.token && (
                <div className={styles.tokenInfo}>
                  <span className={styles.token}>${expert.token}</span>
                  {expert.costPerQuery && (
                    <span className={styles.cost}>${expert.costPerQuery.toFixed(4)}/query</span>
                  )}
                </div>
              )}
              <p className={styles.expertDescription}>{expert.description}</p>
            </div>
          </div>

          <Button
            onClick={handleEndSession}
            variant="outline"
            size="sm"
            className={styles.endButton}
          >
            End Chat
          </Button>
        </div>
      </header>

      {/* Chat interface */}
      <main className={styles.main}>
        <ChatInterface
          session={{ ...session, messages }}
          experts={[expert]}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          className={styles.chatInterface}
        />
      </main>

      {error && <div className={styles.errorToast}>{error}</div>}
    </div>
  );
}
