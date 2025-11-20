import CryptoJS from 'crypto-js';

// Generate a hash of the document content
export const hashContent = (content) => {
  return CryptoJS.SHA256(content).toString();
};

// Create a signature for the document using a simple signing method
export const signDocument = (documentData) => {
  const dataString = JSON.stringify({
    content: documentData.content,
    keystrokes: documentData.keystrokes,
    versions: documentData.versions,
    typingStats: documentData.typingStats,
    pasteEvents: documentData.pasteEvents || [],
    timestamp: documentData.timestamp,
  });

  return CryptoJS.SHA256(dataString).toString();
};

// Verify the signature matches the document data
export const verifySignature = (certificate) => {
  const expectedSignature = signDocument({
    content: certificate.document.content,
    keystrokes: certificate.document.keystrokes,
    versions: certificate.document.versions,
    typingStats: certificate.document.typingStats,
    pasteEvents: certificate.document.pasteEvents || [],
    timestamp: certificate.timestamp,
  });

  // Check both possible signature locations for backwards compatibility
  const storedSignature = certificate.verification?.signature || certificate.signature;

  return expectedSignature === storedSignature;
};

// Generate a unique certificate ID
export const generateCertificateId = () => {
  return 'cert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};
