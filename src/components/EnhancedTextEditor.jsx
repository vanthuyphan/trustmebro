import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useKeystrokeTracking } from '../hooks/useKeystrokeTracking';
import { useVersionHistory } from '../hooks/useVersionHistory';
import { usePasteTracking } from '../hooks/usePasteTracking';
import { saveDraft, getDraft, getAllDrafts, deleteDraft, createNewDraft } from '../utils/storage';
import { downloadPDF } from '../utils/pdfGenerator';
import { PasteAnnotator } from './PasteAnnotator';
import { ConfirmModal } from './Modal';
import '../styles/EnhancedTextEditor.css';

export const EnhancedTextEditor = ({ onStatsChange, onContentChange, onKeystrokesChange, onVersionsChange, onPasteEventsChange }) => {
  const [content, setContent] = useState('');
  const [currentDraft, setCurrentDraft] = useState(createNewDraft());
  const [drafts, setDrafts] = useState([]);
  const [showDraftsList, setShowDraftsList] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [lineSpacing, setLineSpacing] = useState('1.5');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, draftId: null });

  const quillRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  const { trackKeyDown, trackKeyUp, typingStats, keystrokes } = useKeystrokeTracking();
  const { autoSaveVersion, getVersionCount, versions } = useVersionHistory();
  const { pasteEvents, trackPaste, annotatePaste, removePasteAnnotation, getPasteStats, loadPasteEvents, clearPasteEvents } = usePasteTracking();

  // Notify parent of paste events changes
  useEffect(() => {
    if (onPasteEventsChange) {
      onPasteEventsChange(pasteEvents);
    }
  }, [pasteEvents, onPasteEventsChange]);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': ['serif', 'monospace', 'arial', 'times-new-roman', 'calibri'] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'blockquote'
  ];

  // Load drafts on mount
  useEffect(() => {
    const allDrafts = getAllDrafts();
    setDrafts(allDrafts);

    // Load the last draft if exists
    if (allDrafts.length > 0) {
      const lastDraft = allDrafts[allDrafts.length - 1];
      setCurrentDraft(lastDraft);
      setContent(lastDraft.content || '');
      loadPasteEvents(lastDraft.pasteEvents || []);
    }
  }, [loadPasteEvents]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setInterval(() => {
      handleSave();
    }, 30000); // 30 seconds

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [content, currentDraft]);

  const handleSave = useCallback(() => {
    if (!content.trim()) return;

    const updatedDraft = {
      ...currentDraft,
      content: content,
      pasteEvents: pasteEvents,
      updatedAt: Date.now(),
    };

    if (saveDraft(updatedDraft)) {
      setLastSaved(new Date());
      setCurrentDraft(updatedDraft);
      setDrafts(getAllDrafts());
    }
  }, [content, currentDraft, pasteEvents]);

  const handleChange = useCallback((value, delta, source, editor) => {
    const newContent = value;
    const plainText = editor.getText();

    setContent(newContent);
    autoSaveVersion(newContent);

    if (onContentChange) {
      onContentChange(plainText);
    }

    if (onKeystrokesChange) {
      onKeystrokesChange(keystrokes);
    }

    if (onVersionsChange) {
      onVersionsChange(versions);
    }

    if (onStatsChange) {
      const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
      const charCount = plainText.length;
      onStatsChange({
        wordCount,
        charCount,
        versionCount: getVersionCount(),
        typingStats,
      });
    }
  }, [autoSaveVersion, getVersionCount, typingStats, keystrokes, versions, onStatsChange, onContentChange, onKeystrokesChange, onVersionsChange]);

  const handleLoadDraft = (draft) => {
    setCurrentDraft(draft);
    setContent(draft.content || '');
    loadPasteEvents(draft.pasteEvents || []);
    setShowDraftsList(false);
  };

  const handleNewDraft = () => {
    const newDraft = createNewDraft();
    setCurrentDraft(newDraft);
    setContent('');
    clearPasteEvents();
    setShowDraftsList(false);
  };

  const handleDeleteDraft = (draftId, e) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, draftId });
  };

  const confirmDeleteDraft = () => {
    if (deleteConfirm.draftId) {
      deleteDraft(deleteConfirm.draftId);
      setDrafts(getAllDrafts());

      if (currentDraft.id === deleteConfirm.draftId) {
        handleNewDraft();
      }
    }
  };

  const handleDownloadPDF = () => {
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const charCount = content.length;

    downloadPDF(content, `${currentDraft.title || 'document'}.pdf`, {
      title: currentDraft.title || 'My Document',
      includeMetadata: false,
      metadata: {
        wordCount,
        charCount,
      },
    });
  };

  // Handle keyboard events for keystroke tracking
  const handleKeyDown = (e) => {
    trackKeyDown(e);
  };

  const handleKeyUp = (e) => {
    trackKeyUp(e);
  };

  // Handle paste events
  const handlePaste = useCallback((e) => {
    const pastedText = e.clipboardData?.getData('text') || '';
    if (pastedText) {
      const editor = quillRef.current?.getEditor();
      const selection = editor?.getSelection();
      const position = selection?.index || 0;
      const totalLength = editor?.getLength() || 0;

      trackPaste(pastedText, position, totalLength);
    }
  }, [trackPaste]);

  const handleLineSpacingChange = (spacing) => {
    setLineSpacing(spacing);
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const length = editor.getLength();
      editor.formatText(0, length, 'lineHeight', spacing);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="enhanced-editor-card">
      <div className="editor-header">
        <div className="header-left">
          <input
            type="text"
            className="document-title"
            value={currentDraft.title}
            onChange={(e) => setCurrentDraft({ ...currentDraft, title: e.target.value })}
            placeholder="Untitled Document"
          />
          {lastSaved && (
            <span className="last-saved">Saved {formatTime(lastSaved)}</span>
          )}
        </div>
        <div className="header-actions">
          <button className="btn-icon-action" onClick={() => setShowDraftsList(!showDraftsList)} title="My Drafts">
            📁
          </button>
          <button className="btn-icon-action" onClick={handleNewDraft} title="New Draft">
            ➕
          </button>
          <button className="btn-icon-action" onClick={handleSave} title="Save">
            💾
          </button>
          <button className="btn-icon-action" onClick={handleDownloadPDF} title="Download as PDF">
            📥
          </button>
        </div>
      </div>

      <div className="editor-controls">
        <div className="control-group">
          <label>Line Spacing:</label>
          <select
            className="line-spacing-select"
            value={lineSpacing}
            onChange={(e) => handleLineSpacingChange(e.target.value)}
          >
            <option value="1.0">Single (1.0)</option>
            <option value="1.5">1.5 lines</option>
            <option value="2.0">Double (2.0)</option>
            <option value="2.5">2.5 lines</option>
          </select>
        </div>
        <div className="editor-notices">
          <div className="tracking-notice">
            Your typing patterns are being tracked to ensure authenticity
          </div>
          <div className="disclaimer-notice">
            ⚠️ Drafts auto-save to your browser. Clear browser data = lost drafts. Always download important work.
          </div>
        </div>
      </div>

      {showDraftsList && (
        <div className="drafts-dropdown">
          <div className="drafts-header">
            <h4>My Drafts ({drafts.length})</h4>
            <button onClick={() => setShowDraftsList(false)}>✕</button>
          </div>
          <div className="drafts-list">
            {drafts.length === 0 ? (
              <div className="no-drafts">No saved drafts</div>
            ) : (
              drafts.map(draft => (
                <div
                  key={draft.id}
                  className={`draft-item ${draft.id === currentDraft.id ? 'active' : ''}`}
                  onClick={() => handleLoadDraft(draft)}
                >
                  <div className="draft-info">
                    <div className="draft-title">{draft.title || 'Untitled'}</div>
                    <div className="draft-meta">
                      {formatTime(draft.updatedAt)} • {draft.content?.length || 0} chars
                    </div>
                  </div>
                  <button
                    className="delete-draft"
                    onClick={(e) => handleDeleteDraft(draft.id, e)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div
        className="quill-wrapper"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder="Start writing your content here..."
        />
      </div>

      <PasteAnnotator
        pasteEvents={pasteEvents}
        onAnnotate={annotatePaste}
        onRemove={removePasteAnnotation}
      />

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, draftId: null })}
        onConfirm={confirmDeleteDraft}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
      />
    </div>
  );
};
