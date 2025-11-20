import React, { useState, useCallback } from 'react';
import { useKeystrokeTracking } from '../hooks/useKeystrokeTracking';
import { useVersionHistory } from '../hooks/useVersionHistory';

export const TextEditor = ({ onStatsChange, onContentChange, onKeystrokesChange, onVersionsChange }) => {
  const [content, setContent] = useState('');
  const { trackKeyDown, trackKeyUp, typingStats, keystrokes } = useKeystrokeTracking();
  const { autoSaveVersion, getVersionCount, versions } = useVersionHistory();

  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    autoSaveVersion(newContent);

    if (onContentChange) {
      onContentChange(newContent);
    }

    if (onKeystrokesChange) {
      onKeystrokesChange(keystrokes);
    }

    if (onVersionsChange) {
      onVersionsChange(versions);
    }

    if (onStatsChange) {
      const wordCount = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;
      const charCount = newContent.length;
      onStatsChange({
        wordCount,
        charCount,
        versionCount: getVersionCount(),
        typingStats,
      });
    }
  }, [autoSaveVersion, getVersionCount, typingStats, keystrokes, versions, onStatsChange, onContentChange, onKeystrokesChange, onVersionsChange]);

  return (
    <div className="editor-card">
      <div className="editor-header">
        <h2 className="editor-title">Create Your Content</h2>
        <p className="editor-subtitle">
          Your typing patterns are being tracked to ensure authenticity
        </p>
      </div>
      <textarea
        className="text-editor"
        value={content}
        onChange={handleChange}
        onKeyDown={trackKeyDown}
        onKeyUp={trackKeyUp}
        placeholder="Start writing your content here..."
        spellCheck
      />
    </div>
  );
};
