'use client';

import React, { useState } from 'react';
import { IdeaInput } from '@/components/idea';
import { ChatInterface } from '@/components/chat';
import { DocumentViewer, DocumentModal } from '@/components/document';
import { BottomNavigation } from '@/components/navigation/BottomNavigation/BottomNavigation';
import { ExpertsPanel } from '@/components/experts';
import { useChat } from '@/hooks/useChat';
import styles from './page.module.scss';

export default function Home() {
  const [isExpertsPanelOpen, setIsExpertsPanelOpen] = useState(false);

  const {
    currentSession,
    isLoading,
    error,
    currentSpeakers,
    startNewChat,
    sendMessage,
    endSession,
    handleReaction,
    handleApplyRecommendations,
    stopQueue,
    resumeQueue,
    isQueueStopped,
    isApplyingRecommendations,
    experts,
    // Document modal state
    isDocumentModalOpen,
    hasUnreadDocumentChanges,
    openDocumentModal,
    closeDocumentModal,
  } = useChat();

  const handleIdeaSubmit = async (idea: string) => {
    try {
      await startNewChat(idea);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleEndSession = () => {
    endSession();
  };

  const handleToggleSession = () => {
    if (isQueueStopped) {
      resumeQueue();
    } else {
      stopQueue();
    }
  };

  const handleShowExperts = () => {
    setIsExpertsPanelOpen(true);
  };

  const handleCloseExperts = () => {
    setIsExpertsPanelOpen(false);
  };

  // If there's an active session, show mobile-first layout
  if (currentSession) {
    return (
      <>
        {/* Mobile Layout */}
        <div className={styles.mobileLayout}>
          <div className={styles.chatContainer}>
            <ChatInterface
              session={currentSession}
              experts={experts}
              onSendMessage={handleSendMessage}
              onEndSession={handleEndSession}
              onReaction={handleReaction}
              onApplyRecommendations={handleApplyRecommendations}
              onStopQueue={stopQueue}
              onResumeQueue={resumeQueue}
              isLoading={isLoading}
              isApplyingRecommendations={isApplyingRecommendations}
              currentSpeakers={currentSpeakers}
              isQueueStopped={isQueueStopped}
              className={styles.mobileChat}
            />
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation
            onShowDocument={openDocumentModal}
            onToggleSession={handleToggleSession}
            onShowExperts={handleShowExperts}
            hasUnreadDocument={hasUnreadDocumentChanges}
            isSessionStopped={isQueueStopped}
          />
        </div>

        {/* Desktop Layout (preserved for larger screens) */}
        <div className={styles.desktopLayout}>
          <div className={styles.chatPanel}>
            <ChatInterface
              session={currentSession}
              experts={experts}
              onSendMessage={handleSendMessage}
              onEndSession={handleEndSession}
              onReaction={handleReaction}
              onApplyRecommendations={handleApplyRecommendations}
              onStopQueue={stopQueue}
              onResumeQueue={resumeQueue}
              isLoading={isLoading}
              currentSpeakers={currentSpeakers}
              isQueueStopped={isQueueStopped}
            />
          </div>
          <div className={styles.documentPanel}>
            <DocumentViewer
              document={currentSession.projectDocument || 'No document available'}
              title="Project Document"
            />
          </div>
        </div>

        {/* Document Modal */}
        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={closeDocumentModal}
          document={currentSession.projectDocument || 'No document available'}
          title="Project Document"
          hasUnreadChanges={hasUnreadDocumentChanges}
        />

        {/* Experts Panel */}
        <ExpertsPanel
          isOpen={isExpertsPanelOpen}
          onClose={handleCloseExperts}
          experts={experts}
          activeExperts={currentSession.experts}
        />
      </>
    );
  }

  // Otherwise show idea input form
  return (
    <div className={styles.container}>
      <IdeaInput onSubmit={handleIdeaSubmit} disabled={isLoading} />
      {error && <div className={styles.errorToast}>{error}</div>}
    </div>
  );
}
