import React from 'react';
import styles from './DocumentViewer.module.scss';

interface DocumentViewerProps {
  document: string;
  title?: string;
  className?: string;
}

export function DocumentViewer({ document, className = '' }: DocumentViewerProps) {
  // Simple markdown-like rendering for demonstration
  // In production, you'd use a proper markdown parser like react-markdown
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className={styles.h1}>
            {line.replace('# ', '')}
          </h1>,
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className={styles.h2}>
            {line.replace('## ', '')}
          </h2>,
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className={styles.h3}>
            {line.replace('### ', '')}
          </h3>,
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className={styles.li}>
            {line.replace(/^[*-] /, '')}
          </li>,
        );
      } else if (line.trim() === '') {
        elements.push(<br key={index} />);
      } else if (line.trim() !== '') {
        // Handle bold text **text**
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <p
            key={index}
            className={styles.p}
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />,
        );
      }
    });

    return elements;
  };

  return (
    <div className={`${styles.documentViewer} ${className}`}>
      <div className={styles.content}>{renderMarkdown(document)}</div>
    </div>
  );
}
