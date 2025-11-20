import React, { useState } from 'react';
import { verificationAPI } from '../services/api';
import '../styles/VerificationPortal.css';

export const VerificationPortal = () => {
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if Certificate ID is in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyCertId = params.get('verify');
    if (verifyCertId) {
      setCertificateId(verifyCertId);
      // Auto-verify
      verifyFromURL(verifyCertId);
    }
  }, []);

  const verifyFromURL = async (certId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await verificationAPI.verify(certId);
      setVerificationResult(result);
    } catch (err) {
      setError('Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!certificateId.trim()) {
      setError('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const result = await verificationAPI.verify(certificateId);
      setVerificationResult(result);
    } catch (err) {
      setError('Certificate not found or invalid');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="verification-portal">
      <div className="verification-container">
        <div className="verification-header">
          <h1>Document Verification Portal</h1>
          <p>Enter a certificate ID to verify document authenticity</p>
        </div>

        <form onSubmit={handleVerify} className="verification-form">
          <input
            type="text"
            className="verification-input"
            placeholder="Enter Certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Document'}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {verificationResult && (
          <div className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
            <div className="result-header">
              <div className={`status-icon ${verificationResult.isValid ? 'success' : 'failed'}`}>
                {verificationResult.isValid ? '✓' : '✗'}
              </div>
              <h2>{verificationResult.message}</h2>
            </div>

            <div className="result-details">
              <div className="detail-section">
                <h3>Certificate Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Certificate ID:</span>
                    <span className="value">{verificationResult.certificate.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(verificationResult.certificate.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Document Hash:</span>
                    <span className="value code">{verificationResult.certificate.documentHash}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Document Statistics</h3>
                <div className="stat-grid">
                  <div className="stat-card">
                    <div className="stat-value">{verificationResult.certificate.metadata.wordCount}</div>
                    <div className="stat-label">Words</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{verificationResult.certificate.metadata.charCount}</div>
                    <div className="stat-label">Characters</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{verificationResult.certificate.metadata.versionCount}</div>
                    <div className="stat-label">Versions</div>
                  </div>
                </div>
              </div>

              {verificationResult.certificate.metadata.typingStats && (
                <div className="detail-section">
                  <h3>Authenticity Metrics</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Typing Speed:</span>
                      <span className="value">{Math.round(verificationResult.certificate.metadata.typingStats.averageTypingSpeed)} WPM</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Keystrokes:</span>
                      <span className="value">{verificationResult.certificate.metadata.typingStats.totalKeystrokes}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Copy/Paste Detected:</span>
                      <span className={`badge ${verificationResult.certificate.metadata.typingStats.copyPasteDetected ? 'badge-warning' : 'badge-success'}`}>
                        {verificationResult.certificate.metadata.typingStats.copyPasteDetected ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
