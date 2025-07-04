import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import styles from './IdeaInput.module.scss';

interface IdeaInputProps {
  onSubmit: (idea: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function IdeaInput({ 
  onSubmit, 
  className = '', 
  placeholder = "Describe your business idea...",
  disabled = false
}: IdeaInputProps) {
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!idea.trim() || disabled) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(idea.trim());
      setIdea('');
    } catch (error) {
      console.error('Error submitting idea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`${styles.ideaInput} ${className}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tell us about your idea</h1>
        <p className={styles.description}>
          Discuss your idea with venture experts and discover the most promising opportunities
        </p>
      </div>
      
      <div className={styles.inputContainer}>
        <Textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={6}
          disabled={disabled || isSubmitting}
          className={styles.textarea}
        />
        
        <div className={styles.actions}>
          <div className={styles.hint}>
            Press Cmd+Enter to send
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!idea.trim() || disabled || isSubmitting}
            size="lg"
            className={styles.submitButton}
          >
            {isSubmitting ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      </div>
    </div>
  );
}