import React from 'react';

export const StatsPanel = ({
  wordCount,
  charCount,
  versionCount,
  typingSpeed,
  totalTime,
  copyPasteDetected,
  pasteStats,
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="info-card">
      <h3 className="info-card-title">Document Statistics</h3>
      <div className="stat-grid">
        <div className="stat-item">
          <span className="stat-label">Words</span>
          <span className="stat-value">{wordCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Characters</span>
          <span className="stat-value">{charCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Typing Speed</span>
          <span className="stat-value">{typingSpeed} WPM</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time Spent</span>
          <span className="stat-value">{formatTime(totalTime)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Versions Saved</span>
          <span className="stat-value">{versionCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Authenticity</span>
          <span className={`badge ${copyPasteDetected ? 'badge-warning' : 'badge-success'}`}>
            <span className="status-indicator"></span>
            {copyPasteDetected ? 'Copy Detected' : 'Verified'}
          </span>
        </div>
        {pasteStats && pasteStats.total > 0 && (
          <div className="stat-item">
            <span className="stat-label">Paste Events</span>
            <span className={`badge ${pasteStats.hasUnjustified ? 'badge-warning' : 'badge-success'}`}>
              <span className="status-indicator"></span>
              {pasteStats.justified} / {pasteStats.total} Justified
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
