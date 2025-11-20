import React, { useState } from 'react';
import { hashContent, signDocument, generateCertificateId } from '../utils/crypto';
import { downloadPDF } from '../utils/pdfGenerator';
import { AlertModal } from './Modal';
import '../styles/SelfContainedExport.css';

export const SelfContainedExport = ({ content, stats, keystrokes, versions, pasteEvents }) => {
  const [certificate, setCertificate] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const generateSelfContainedCertificate = () => {
    const timestamp = Date.now();
    const certificateId = generateCertificateId();
    const contentHash = hashContent(content);

    const documentData = {
      content: content,
      keystrokes: keystrokes,
      versions: versions,
      typingStats: stats.typingStats,
      pasteEvents: pasteEvents || [],
      timestamp: timestamp,
    };

    const signature = signDocument(documentData);

    const certificate = {
      version: '1.0',
      certificateId: certificateId,
      timestamp: timestamp,
      createdAt: new Date(timestamp).toISOString(),

      // Document data
      document: {
        title: 'Verified Document',
        content: content,
        wordCount: stats.wordCount,
        charCount: stats.charCount,
        keystrokes: keystrokes,
        versions: versions,
        typingStats: stats.typingStats,
        pasteEvents: pasteEvents || [],
      },

      // Verification data
      verification: {
        contentHash: contentHash,
        signature: signature,
        algorithm: 'SHA256',
      },

      // Metadata
      metadata: {
        editorVersion: '1.0',
        platform: navigator.platform,
        userAgent: navigator.userAgent,
      },

      // Instructions for verifier
      instructions: {
        howToVerify: [
          '1. Go to the TrustMeBro application',
          '2. Click "Verify Document"',
          '3. Upload this certificate file',
          '4. The system will verify the signature and authenticity',
        ],
        note: 'This certificate is self-contained. We don\'t store your data.',
      },
    };

    setCertificate(certificate);
    return certificate;
  };

  const handleGenerateCertificate = () => {
    if (!content || content.trim() === '') {
      setAlertModal({
        isOpen: true,
        title: 'No Content',
        message: 'Please write some content first!',
        type: 'warning'
      });
      return;
    }

    const cert = generateSelfContainedCertificate();

    // Download certificate
    const certData = JSON.stringify(cert, null, 2);
    const blob = new Blob([certData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verified-document-${cert.certificateId}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setAlertModal({
      isOpen: true,
      title: 'Certificate Generated!',
      message: 'Certificate downloaded!\n\nThis certificate contains:\n- Your document content\n- All typing statistics\n- Paste event annotations\n- Cryptographic signature\n\nShare this file for verification.',
      type: 'success'
    });
  };

  const handleDownloadDocument = () => {
    if (!content || content.trim() === '') {
      setAlertModal({
        isOpen: true,
        title: 'No Content',
        message: 'No content to download!',
        type: 'warning'
      });
      return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!content || content.trim() === '') {
      setAlertModal({
        isOpen: true,
        title: 'No Content',
        message: 'No content to download!',
        type: 'warning'
      });
      return;
    }

    downloadPDF(content, 'document.pdf', {
      title: 'My Document',
      includeMetadata: false,
      metadata: {
        wordCount: stats.wordCount,
        charCount: stats.charCount,
      },
    });
  };

  const handleDownloadReadme = () => {
    const readmeContent = `# Document Verification Guide

## What You Received

You received a **self-contained verification certificate** (JSON file) that proves the authenticity of a document.

${certificate ? `
## Document Information

- **Certificate ID**: ${certificate.certificateId}
- **Created**: ${certificate.createdAt}
- **Word Count**: ${certificate.document.wordCount}
- **Character Count**: ${certificate.document.charCount}

## Authenticity Metrics

- **Typing Speed**: ${Math.round(certificate.document.typingStats.averageTypingSpeed)} words per minute
- **Total Keystrokes**: ${certificate.document.typingStats.totalKeystrokes}
- **Time Spent Writing**: ${Math.floor(certificate.document.typingStats.totalTimeSpent / 60)} minutes
- **Copy/Paste Detected**: ${certificate.document.typingStats.copyPasteDetected ? 'Yes ⚠️' : 'No ✓'}
- **Versions Saved**: ${certificate.document.versions.length}
- **Paste Events Tracked**: ${certificate.document.pasteEvents.length}
- **Justified Pastes**: ${certificate.document.pasteEvents.filter(e => e.justified).length} / ${certificate.document.pasteEvents.length}
` : ''}

## How to Verify This Document

### Method 1: Upload Certificate File
1. Go to the TrustMeBro application
2. Click **"Verify Document"** button
3. Click **"Upload Certificate File"**
4. Select the JSON certificate file
5. Review the verification results

### Method 2: Manual Verification
The certificate contains:
- Original document content
- Keystroke data showing typing patterns
- Version history with timestamps
- Cryptographic signature (SHA256 hash)

## What the Verification Shows

✓ **Document Authenticity**: Whether the content has been tampered with
✓ **Typing Patterns**: Real keystroke data proving organic writing
✓ **Copy/Paste Detection**: Alerts if content was pasted rather than typed
✓ **Time Analysis**: Shows actual time spent writing
✓ **Version History**: Complete edit history with timestamps

## Understanding the Results

### Green Badge (Verified ✓)
- Signature matches the content
- No tampering detected
- Document is authentic

### Yellow Badge (Warning ⚠️)
- Copy/paste was detected
- Content may not be entirely original
- Review keystroke data for details

### Red Badge (Invalid ✗)
- Signature doesn't match
- Content has been modified
- Certificate is invalid

## Technical Details

- **Signature Algorithm**: SHA256 cryptographic hash
- **Data Included**: Full document + metadata + typing statistics
- **Storage**: Self-contained (no server required)
- **Privacy**: All verification happens locally

## Questions?

This certificate was generated using the **TrustMeBro**, which:
- Tracks every keystroke in real-time
- Records typing speed and patterns
- Detects copy/paste operations
- Creates cryptographic signatures
- Generates self-verifying certificates

**No server storage required** - everything you need is in the certificate file!

---
Generated by TrustMeBro v1.0
${new Date().toLocaleString()}
`;

    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VERIFICATION-INSTRUCTIONS.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="self-contained-export">
      <div className="export-header">
        <h3>Export & Verify</h3>
        <p>Generate a self-contained certificate that can be verified without server storage</p>
      </div>

      <div className="export-actions">
        <button
          className="export-btn primary"
          onClick={handleGenerateCertificate}
        >
          <span className="btn-icon">🔐</span>
          <div>
            <div className="btn-title">Generate Certificate</div>
            <div className="btn-description">Self-contained verification file</div>
          </div>
        </button>

        {certificate && (
          <>
            <button
              className="export-btn secondary"
              onClick={handleDownloadReadme}
            >
              <span className="btn-icon">📋</span>
              <div>
                <div className="btn-title">Download Instructions</div>
                <div className="btn-description">Verification guide for teacher</div>
              </div>
            </button>

            <button
              className="export-btn secondary"
              onClick={handleDownloadDocument}
            >
              <span className="btn-icon">📄</span>
              <div>
                <div className="btn-title">Download as Text</div>
                <div className="btn-description">Plain text version</div>
              </div>
            </button>

            <button
              className="export-btn secondary"
              onClick={handleDownloadPDF}
            >
              <span className="btn-icon">📕</span>
              <div>
                <div className="btn-title">Download as PDF</div>
                <div className="btn-description">Formatted PDF document</div>
              </div>
            </button>
          </>
        )}
      </div>

      {certificate && (
        <div className="certificate-info">
          <h4>Certificate Generated ✓</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Certificate ID</span>
              <code className="value">{certificate.certificateId}</code>
            </div>
            <div className="info-item">
              <span className="label">Content Hash</span>
              <code className="value">{certificate.verification.contentHash.substring(0, 16)}...</code>
            </div>
            <div className="info-item">
              <span className="label">Signature</span>
              <code className="value">{certificate.verification.signature.substring(0, 16)}...</code>
            </div>
          </div>
          <p className="help-text">
            ✓ Certificate downloaded - share this file with your teacher/publisher for verification
          </p>
        </div>
      )}

      <div className="how-it-works">
        <h4>How It Works</h4>
        <ol>
          <li>You write content (keystroke tracking happens automatically)</li>
          <li>Click "Generate Certificate" - creates a self-contained verification file</li>
          <li>Share the certificate file with your teacher/publisher</li>
          <li>They upload it to verify</li>
        </ol>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: '', message: '', type: 'info' })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};
