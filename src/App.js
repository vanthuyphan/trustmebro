import React, { useState } from 'react';
import './App.css';
import { EnhancedTextEditor } from './components/EnhancedTextEditor';
import { StatsPanel } from './components/StatsPanel';
import { SelfContainedExport } from './components/SelfContainedExport';
import { FileVerification } from './components/FileVerification';
import { AboutModal } from './components/AboutModal';

function App() {
  const [view, setView] = useState('editor'); // 'editor' or 'verify'
  const [currentContent, setCurrentContent] = useState('');
  const [keystrokes, setKeystrokes] = useState([]);
  const [versions, setVersions] = useState([]);
  const [pasteEvents, setPasteEvents] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [stats, setStats] = useState({
    wordCount: 0,
    charCount: 0,
    versionCount: 0,
    typingStats: {
      totalKeystrokes: 0,
      averageTypingSpeed: 0,
      totalTimeSpent: 0,
      pauseCount: 0,
      backspaceCount: 0,
      copyPasteDetected: false,
    },
  });

  const handleStatsChange = (newStats) => {
    setStats(newStats);
  };

  const handleContentChange = (content) => {
    setCurrentContent(content);
  };

  const handleKeystrokesChange = (newKeystrokes) => {
    setKeystrokes(newKeystrokes);
  };

  const handleVersionsChange = (newVersions) => {
    setVersions(newVersions);
  };

  const handlePasteEventsChange = (newPasteEvents) => {
    setPasteEvents(newPasteEvents);
  };

  const handleVerify = () => {
    setView('verify');
  };

  const handleBackToEditor = () => {
    setView('editor');
  };

  // Calculate paste statistics
  const pasteStats = {
    total: pasteEvents.length,
    justified: pasteEvents.filter(e => e.justified).length,
    unjustified: pasteEvents.filter(e => !e.justified).length,
    hasUnjustified: pasteEvents.some(e => !e.justified),
  };

  if (view === 'verify') {
    return (
      <div className="app">
        <header className="header">
          <div className="logo">TrustMeBro</div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleBackToEditor}>
              Back to Editor
            </button>
          </div>
        </header>
        <FileVerification />

        <footer className="app-footer">
          <div className="footer-content">
            <p className="footer-disclaimer">
              <strong>Disclaimer:</strong> We don't store your data on any server. Drafts are saved locally in your browser's storage.
              Clearing your browser data will delete all saved drafts. Always download important work as certificates or PDFs.
              We are not responsible for any data loss.
            </p>
            <div className="footer-links">
              <button onClick={() => setShowAbout(true)} className="footer-link">
                About
              </button>
            </div>
            <p className="footer-copyright">
              © 2025 TrustMeBro - Proof you actually wrote it
            </p>
          </div>
        </footer>

        <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">TrustMeBro</div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleVerify}>
            Verify Document
          </button>
        </div>
      </header>

      <main className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <section className="editor-section">
          <EnhancedTextEditor
            onStatsChange={handleStatsChange}
            onContentChange={handleContentChange}
            onKeystrokesChange={handleKeystrokesChange}
            onVersionsChange={handleVersionsChange}
            onPasteEventsChange={handlePasteEventsChange}
          />
          <SelfContainedExport
            content={currentContent}
            stats={stats}
            keystrokes={keystrokes}
            versions={versions}
            pasteEvents={pasteEvents}
          />
        </section>

        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Show statistics" : "Hide statistics"}
          >
            {isSidebarCollapsed ? '◀' : '▶'}
          </button>

          {!isSidebarCollapsed && (
            <div className="sidebar-content">
              <StatsPanel
                wordCount={stats.wordCount}
                charCount={stats.charCount}
                versionCount={stats.versionCount}
                typingSpeed={stats.typingStats.averageTypingSpeed}
                totalTime={stats.typingStats.totalTimeSpent}
                copyPasteDetected={stats.typingStats.copyPasteDetected}
                pasteStats={pasteStats}
              />
            </div>
          )}
        </aside>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-disclaimer">
            <strong>Disclaimer:</strong> We don't store your data on any server. Drafts are saved locally in your browser's storage.
            Clearing your browser data will delete all saved drafts. Always download important work as certificates or PDFs.
            We are not responsible for any data loss.
          </p>
          <div className="footer-links">
            <button onClick={() => setShowAbout(true)} className="footer-link">
              About
            </button>
          </div>
          <p className="footer-copyright">
            © 2025 TrustMeBro - Proof you actually wrote it
          </p>
        </div>
      </footer>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}

export default App;
