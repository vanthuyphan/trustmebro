import React, { useState } from 'react';
import { verifySignature } from '../utils/crypto';
import { downloadPDF } from '../utils/pdfGenerator';
import '../styles/FileVerification.css';

export const FileVerification = () => {
  const [certificate, setCertificate] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [pasteEventsExpanded, setPasteEventsExpanded] = useState(true);
  const [expandedPasteIds, setExpandedPasteIds] = useState(new Set());

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const cert = JSON.parse(event.target.result);
        setCertificate(cert);
        verifyCertificate(cert);
        setError(null);
      } catch (err) {
        setError('Invalid certificate file. Please upload a valid JSON certificate.');
        setCertificate(null);
        setVerificationResult(null);
      }
    };
    reader.readAsText(file);
  };

  const verifyCertificate = (cert) => {
    // Verify signature
    const isSignatureValid = verifySignature(cert);

    // Check for copy/paste
    const hasCopyPaste = cert.document.typingStats.copyPasteDetected;

    // Check paste events
    const pasteEvents = cert.document.pasteEvents || [];
    const totalPastes = pasteEvents.length;
    const justifiedPastes = pasteEvents.filter(e => e.justified).length;
    const unjustifiedPastes = totalPastes - justifiedPastes;

    // Count paste types
    const pasteByType = pasteEvents.reduce((acc, event) => {
      if (event.justified) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {});

    // Check typing patterns
    const hasReasonableTypingSpeed = cert.document.typingStats.averageTypingSpeed > 0 &&
                                      cert.document.typingStats.averageTypingSpeed < 200;

    const hasReasonableKeystrokes = cert.document.typingStats.totalKeystrokes > 0;

    let status = 'valid';
    let message = 'Document is authentic and verified';

    if (!isSignatureValid) {
      status = 'invalid';
      message = 'Certificate signature is invalid - content may have been tampered with';
    } else if (unjustifiedPastes > 0) {
      status = 'warning';
      message = `Document verified, but ${unjustifiedPastes} paste event(s) are not justified - review paste annotations`;
    } else if (hasCopyPaste) {
      status = 'warning';
      message = 'Document verified, but copy/paste was detected - content may not be entirely original';
    } else if (!hasReasonableTypingSpeed || !hasReasonableKeystrokes) {
      status = 'warning';
      message = 'Document verified, but typing patterns are unusual';
    }

    setVerificationResult({
      status,
      message,
      isSignatureValid,
      certificate: cert,
      metrics: {
        signatureValid: isSignatureValid,
        copyPasteDetected: hasCopyPaste,
        typingSpeed: cert.document.typingStats.averageTypingSpeed,
        totalKeystrokes: cert.document.typingStats.totalKeystrokes,
        timeSpent: cert.document.typingStats.totalTimeSpent,
        versionCount: cert.document.versions.length,
        totalPastes: totalPastes,
        justifiedPastes: justifiedPastes,
        unjustifiedPastes: unjustifiedPastes,
        pasteByType: pasteByType,
      },
      pasteEvents: pasteEvents,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString();
  };

  const togglePasteExpanded = (pasteId) => {
    setExpandedPasteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pasteId)) {
        newSet.delete(pasteId);
      } else {
        newSet.add(pasteId);
      }
      return newSet;
    });
  };

  const handleDownloadDocument = () => {
    if (!certificate) return;

    const blob = new Blob([certificate.document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document-${certificate.certificateId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWithMetadata = () => {
    if (!certificate) return;

    const documentWithMetadata = `VERIFIED DOCUMENT
${'='.repeat(80)}

Certificate ID: ${certificate.certificateId}
Created: ${formatDate(certificate.createdAt)}
Verified: ${new Date().toLocaleString()}

AUTHENTICITY METRICS
${'-'.repeat(80)}
Signature Valid: ${verificationResult.isSignatureValid ? 'Yes ✓' : 'No ✗'}
Typing Speed: ${Math.round(verificationResult.metrics.typingSpeed)} WPM
Total Keystrokes: ${verificationResult.metrics.totalKeystrokes}
Time Spent: ${formatTime(verificationResult.metrics.timeSpent)}
Copy/Paste Detected: ${verificationResult.metrics.copyPasteDetected ? 'Yes ⚠' : 'No ✓'}
Version Count: ${verificationResult.metrics.versionCount}

DOCUMENT STATISTICS
${'-'.repeat(80)}
Words: ${certificate.document.wordCount}
Characters: ${certificate.document.charCount}

DOCUMENT CONTENT
${'='.repeat(80)}

${certificate.document.content}

${'='.repeat(80)}
End of Document - Verified by TrustMeBro
`;

    const blob = new Blob([documentWithMetadata], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verified-document-${certificate.certificateId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!certificate) return;

    downloadPDF(certificate.document.content, `verified-document-${certificate.certificateId}.pdf`, {
      title: certificate.document.title || 'Verified Document',
      includeMetadata: true,
      metadata: {
        certificateId: certificate.certificateId,
        createdAt: formatDate(certificate.createdAt),
        wordCount: certificate.document.wordCount,
        charCount: certificate.document.charCount,
        verified: true,
        typingSpeed: Math.round(verificationResult.metrics.typingSpeed),
        timeSpent: formatTime(verificationResult.metrics.timeSpent),
        copyPasteDetected: verificationResult.metrics.copyPasteDetected,
      },
    });
  };

  const handlePrint = () => {
    if (!certificate) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verified Document - ${certificate.certificateId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .metadata { background: #f5f5f5; padding: 15px; margin-bottom: 20px; font-size: 14px; }
          .content { white-space: pre-wrap; font-size: 14px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
          .verified-badge { color: #00875A; font-weight: bold; }
          .invalid-badge { color: #C33; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Verified Document</h1>
          <p><strong>Certificate ID:</strong> ${certificate.certificateId}</p>
          <p><strong>Created:</strong> ${formatDate(certificate.createdAt)}</p>
        </div>

        <div class="metadata">
          <h3>Authenticity Verification</h3>
          <p><strong>Status:</strong> <span class="${verificationResult.isSignatureValid ? 'verified-badge' : 'invalid-badge'}">${verificationResult.message}</span></p>
          <p><strong>Typing Speed:</strong> ${Math.round(verificationResult.metrics.typingSpeed)} WPM</p>
          <p><strong>Time Spent:</strong> ${formatTime(verificationResult.metrics.timeSpent)}</p>
          <p><strong>Copy/Paste Detected:</strong> ${verificationResult.metrics.copyPasteDetected ? 'Yes ⚠' : 'No ✓'}</p>
          <p><strong>Word Count:</strong> ${certificate.document.wordCount} words</p>
        </div>

        <div class="content">
          <h3>Document Content</h3>
          ${certificate.document.content}
        </div>

        <div class="footer">
          <p>Verified using TrustMeBro on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="file-verification">
      <div className="upload-section">
        <h2>Verify Certificate File</h2>
        <p>Upload a certificate file to verify document authenticity</p>

        <div className="file-upload-area">
          <input
            type="file"
            id="certificate-upload"
            accept=".json"
            onChange={handleFileUpload}
            className="file-input"
          />
          <label htmlFor="certificate-upload" className="file-upload-label">
            <span className="upload-icon">📁</span>
            <span className="upload-text">
              {certificate ? 'File uploaded - Upload another?' : 'Click to upload certificate file (.json)'}
            </span>
          </label>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
      </div>

      {verificationResult && (
        <div className={`verification-result ${verificationResult.status}`}>
          <div className="result-header">
            <div className={`status-icon ${verificationResult.status}`}>
              {verificationResult.status === 'valid' && '✓'}
              {verificationResult.status === 'warning' && '⚠'}
              {verificationResult.status === 'invalid' && '✗'}
            </div>
            <h2>{verificationResult.message}</h2>
          </div>

          <div className="result-details">
            <div className="detail-section">
              <h3>Certificate Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Certificate ID:</span>
                  <span className="value">{certificate.certificateId}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(certificate.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Content Hash:</span>
                  <span className="value code">{certificate.verification.contentHash}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Signature Valid:</span>
                  <span className={`badge ${verificationResult.isSignatureValid ? 'badge-success' : 'badge-error'}`}>
                    {verificationResult.isSignatureValid ? 'Yes ✓' : 'No ✗'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Document Statistics</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-value">{certificate.document.wordCount}</div>
                  <div className="stat-label">Words</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{certificate.document.charCount}</div>
                  <div className="stat-label">Characters</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{verificationResult.metrics.versionCount}</div>
                  <div className="stat-label">Versions</div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Authenticity Metrics</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Typing Speed:</span>
                  <span className="value">{Math.round(verificationResult.metrics.typingSpeed)} WPM</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Keystrokes:</span>
                  <span className="value">{verificationResult.metrics.totalKeystrokes}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Time Spent:</span>
                  <span className="value">{formatTime(verificationResult.metrics.timeSpent)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Copy/Paste Detected:</span>
                  <span className={`badge ${verificationResult.metrics.copyPasteDetected ? 'badge-warning' : 'badge-success'}`}>
                    {verificationResult.metrics.copyPasteDetected ? 'Yes ⚠' : 'No ✓'}
                  </span>
                </div>
              </div>
            </div>

            {verificationResult.metrics.totalPastes > 0 && (
              <div className="detail-section">
                <h3>Paste Event Analysis</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Total Paste Events:</span>
                    <span className="value">{verificationResult.metrics.totalPastes}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Justified Pastes:</span>
                    <span className={`badge ${verificationResult.metrics.justifiedPastes === verificationResult.metrics.totalPastes ? 'badge-success' : 'badge-warning'}`}>
                      {verificationResult.metrics.justifiedPastes} / {verificationResult.metrics.totalPastes}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Unjustified Pastes:</span>
                    <span className={`badge ${verificationResult.metrics.unjustifiedPastes > 0 ? 'badge-error' : 'badge-success'}`}>
                      {verificationResult.metrics.unjustifiedPastes}
                    </span>
                  </div>
                </div>

                {Object.keys(verificationResult.metrics.pasteByType).length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <strong style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
                      Breakdown by Type:
                    </strong>
                    <div className="detail-grid">
                      {verificationResult.metrics.pasteByType.quote && (
                        <div className="detail-item">
                          <span className="label">📝 Quotes:</span>
                          <span className="value">{verificationResult.metrics.pasteByType.quote}</span>
                        </div>
                      )}
                      {verificationResult.metrics.pasteByType.citation && (
                        <div className="detail-item">
                          <span className="label">📚 Citations:</span>
                          <span className="value">{verificationResult.metrics.pasteByType.citation}</span>
                        </div>
                      )}
                      {verificationResult.metrics.pasteByType.link && (
                        <div className="detail-item">
                          <span className="label">🔗 Links:</span>
                          <span className="value">{verificationResult.metrics.pasteByType.link}</span>
                        </div>
                      )}
                      {verificationResult.metrics.pasteByType['own-work'] && (
                        <div className="detail-item">
                          <span className="label">✍️ Own Work:</span>
                          <span className="value">{verificationResult.metrics.pasteByType['own-work']}</span>
                        </div>
                      )}
                      {verificationResult.metrics.pasteByType.data && (
                        <div className="detail-item">
                          <span className="label">📊 Data:</span>
                          <span className="value">{verificationResult.metrics.pasteByType.data}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {verificationResult.pasteEvents && verificationResult.pasteEvents.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div
                      onClick={() => setPasteEventsExpanded(!pasteEventsExpanded)}
                      style={{
                        fontSize: '15px',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: pasteEventsExpanded ? '12px' : '0',
                        fontWeight: '600',
                        cursor: 'pointer',
                        userSelect: 'none',
                        padding: '8px 0',
                      }}
                    >
                      <span style={{ marginRight: '8px', transition: 'transform 0.2s', transform: pasteEventsExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        ▶
                      </span>
                      Individual Paste Events ({verificationResult.pasteEvents.length})
                    </div>
                    {pasteEventsExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {verificationResult.pasteEvents.map((paste, index) => {
                          const isExpanded = expandedPasteIds.has(paste.id);
                          const shouldTruncate = paste.text.length > 150;
                          return (
                            <div
                              key={paste.id}
                              style={{
                                padding: '16px',
                                backgroundColor: paste.justified ? '#f0f9ff' : '#fff3cd',
                                border: `1px solid ${paste.justified ? '#4CAF50' : '#f44336'}`,
                                borderLeft: `4px solid ${paste.justified ? '#4CAF50' : '#f44336'}`,
                                borderRadius: '6px',
                                fontSize: '14px',
                              }}
                            >
                              <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '15px' }}>
                                Paste #{index + 1} - {paste.justified ? `✓ ${paste.type}` : '⚠️ Not justified'}
                              </div>
                              <div style={{ color: '#333', marginBottom: '8px', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                "{isExpanded || !shouldTruncate ? paste.text : paste.text.substring(0, 150) + '...'}"
                              </div>
                              <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <span>{paste.length} chars • Position: {paste.position}</span>
                                {paste.note && <span>Note: {paste.note}</span>}
                                {shouldTruncate && (
                                  <button
                                    onClick={() => togglePasteExpanded(paste.id)}
                                    style={{
                                      marginLeft: 'auto',
                                      padding: '4px 12px',
                                      fontSize: '12px',
                                      backgroundColor: 'transparent',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      color: '#666',
                                      fontWeight: '500',
                                    }}
                                  >
                                    {isExpanded ? 'Show less' : 'Show full text'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="detail-section">
              <h3>Download Options</h3>
              <div className="download-actions">
                <button className="download-btn primary" onClick={handleDownloadDocument}>
                  <span className="btn-icon">📄</span>
                  <div>
                    <div className="btn-title">Download Content Only</div>
                    <div className="btn-description">Plain text document</div>
                  </div>
                </button>

                <button className="download-btn secondary" onClick={handleDownloadWithMetadata}>
                  <span className="btn-icon">📋</span>
                  <div>
                    <div className="btn-title">Download with Verification Details</div>
                    <div className="btn-description">Document + authenticity metrics</div>
                  </div>
                </button>

                <button className="download-btn secondary" onClick={handleDownloadPDF}>
                  <span className="btn-icon">📕</span>
                  <div>
                    <div className="btn-title">Download as PDF</div>
                    <div className="btn-description">PDF with verification details</div>
                  </div>
                </button>

                <button className="download-btn secondary" onClick={handlePrint}>
                  <span className="btn-icon">🖨️</span>
                  <div>
                    <div className="btn-title">Print Document</div>
                    <div className="btn-description">Print preview</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="detail-section">
              <h3>Full Document Content</h3>
              <div className="document-preview full">
                <pre>{certificate.document.content}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
