import React, { useState } from 'react';
import { PromptModal } from './Modal';
import '../styles/PasteAnnotator.css';

export const PasteAnnotator = ({ pasteEvents, onAnnotate, onRemove }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [promptModal, setPromptModal] = useState({ isOpen: false, pasteId: null, type: null });

  const pasteTypes = [
    { value: 'quote', label: 'Quote', icon: '"', color: '#4CAF50' },
    { value: 'citation', label: 'Citation', icon: '📚', color: '#2196F3' },
    { value: 'link', label: 'URL/Link', icon: '🔗', color: '#9C27B0' },
    { value: 'own-work', label: 'My Previous Work', icon: '✍️', color: '#FF9800' },
    { value: 'data', label: 'Data/Numbers', icon: '📊', color: '#00BCD4' },
  ];

  const handleAnnotate = (pasteId, type) => {
    setPromptModal({ isOpen: true, pasteId, type });
  };

  const handlePromptSubmit = (note) => {
    if (promptModal.pasteId && promptModal.type) {
      onAnnotate(promptModal.pasteId, promptModal.type, note || '');
      setExpandedId(null);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getTypeInfo = (type) => {
    return pasteTypes.find(t => t.value === type) || {
      label: 'Unjustified',
      icon: '⚠️',
      color: '#f44336'
    };
  };

  if (pasteEvents.length === 0) {
    return null;
  }

  return (
    <div className="paste-annotator">
      <div className="annotator-header">
        <h4>Pasted Content Tracker</h4>
        <span className="paste-count">
          {pasteEvents.filter(e => !e.justified).length} need annotation
        </span>
      </div>

      <div className="paste-list">
        {pasteEvents.map(paste => {
          const typeInfo = getTypeInfo(paste.type);
          const isExpanded = expandedId === paste.id;

          return (
            <div
              key={paste.id}
              className={`paste-item ${paste.justified ? 'justified' : 'unjustified'}`}
            >
              <div
                className="paste-summary"
                onClick={() => setExpandedId(isExpanded ? null : paste.id)}
              >
                <div className="paste-icon" style={{ color: typeInfo.color }}>
                  {typeInfo.icon}
                </div>
                <div className="paste-info">
                  <div className="paste-preview">
                    {paste.text.substring(0, 60)}
                    {paste.text.length > 60 ? '...' : ''}
                  </div>
                  <div className="paste-meta">
                    {formatTime(paste.timestamp)} • {paste.length} chars
                    {paste.justified && ` • ${typeInfo.label}`}
                  </div>
                </div>
                <div className="paste-status">
                  {paste.justified ? '✓' : '⚠️'}
                </div>
              </div>

              {isExpanded && (
                <div className="paste-details">
                  <div className="paste-text">
                    <strong>Full text:</strong>
                    <div className="text-preview">{paste.text}</div>
                  </div>

                  {!paste.justified ? (
                    <div className="annotation-options">
                      <p>Why did you paste this?</p>
                      <div className="type-buttons">
                        {pasteTypes.map(type => (
                          <button
                            key={type.value}
                            className="type-btn"
                            style={{ borderColor: type.color }}
                            onClick={() => handleAnnotate(paste.id, type.value)}
                          >
                            <span style={{ color: type.color }}>{type.icon}</span>
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="paste-annotation">
                      <div className="annotation-tag" style={{ backgroundColor: typeInfo.color }}>
                        {typeInfo.icon} {typeInfo.label}
                      </div>
                      {paste.note && (
                        <div className="annotation-note">
                          <strong>Note:</strong> {paste.note}
                        </div>
                      )}
                      <button
                        className="remove-annotation-btn"
                        onClick={() => onRemove(paste.id)}
                      >
                        Remove annotation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={() => setPromptModal({ isOpen: false, pasteId: null, type: null })}
        onSubmit={handlePromptSubmit}
        title={`Add Note for ${promptModal.type}`}
        message={`Optional note to explain why you pasted this ${promptModal.type}:`}
        placeholder="Enter your note here..."
      />
    </div>
  );
};
