import jsPDF from 'jspdf';

export const generatePDF = (content, options = {}) => {
  const {
    title = 'Document',
    includeMetadata = false,
    metadata = {},
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page settings
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (lineHeight) => {
    if (yPosition + lineHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);
  yPosition += 15;

  // Add metadata if requested
  if (includeMetadata && metadata) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    if (metadata.certificateId) {
      doc.text(`Certificate ID: ${metadata.certificateId}`, margin, yPosition);
      yPosition += 5;
    }

    if (metadata.createdAt) {
      doc.text(`Created: ${metadata.createdAt}`, margin, yPosition);
      yPosition += 5;
    }

    if (metadata.wordCount) {
      doc.text(`Words: ${metadata.wordCount} | Characters: ${metadata.charCount || 0}`, margin, yPosition);
      yPosition += 5;
    }

    // Add verification section
    if (metadata.verified) {
      yPosition += 3;
      doc.setFillColor(230, 255, 230);
      doc.rect(margin, yPosition, maxWidth, 25, 'F');

      yPosition += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 135, 90);
      doc.text('✓ Verified Document', margin + 3, yPosition);
      yPosition += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      if (metadata.typingSpeed) {
        doc.text(`Typing Speed: ${metadata.typingSpeed} WPM`, margin + 3, yPosition);
        yPosition += 4;
      }
      if (metadata.timeSpent) {
        doc.text(`Time Spent: ${metadata.timeSpent}`, margin + 3, yPosition);
        yPosition += 4;
      }
      if (metadata.copyPasteDetected !== undefined) {
        doc.text(`Copy/Paste: ${metadata.copyPasteDetected ? 'Detected ⚠' : 'None ✓'}`, margin + 3, yPosition);
        yPosition += 4;
      }
      yPosition += 3;
    }

    yPosition += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  }

  // Reset text color and font for content
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  // Remove HTML tags if present (for rich text content)
  const cleanContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');

  // Split content into lines and add to PDF
  const lines = doc.splitTextToSize(cleanContent, maxWidth);
  const lineHeight = 7;

  lines.forEach((line) => {
    checkPageBreak(lineHeight);
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  // Add footer on last page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadPDF = (content, filename, options = {}) => {
  const doc = generatePDF(content, options);
  doc.save(filename);
};
