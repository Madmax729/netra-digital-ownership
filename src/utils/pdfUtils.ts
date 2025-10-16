import { jsPDF } from 'jspdf';

export interface PlagiarismMatch {
  text: string;
  page: number;
  confidence: number;
  source?: string;
}

export interface PlagiarismReport {
  totalPages: number;
  plagiarismPercentage: number;
  matches: PlagiarismMatch[];
  originalText: string;
  analyzedAt: Date;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // This is a placeholder - in production, you'd use a library like pdf.js
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Simulated text extraction
      resolve("Sample extracted text from PDF...");
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function analyzePlagiarism(text: string): Promise<PlagiarismReport> {
  // Simulate plagiarism analysis
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const sentences = text.split('.').filter(s => s.trim().length > 0);
  const plagiarizedCount = Math.floor(sentences.length * (Math.random() * 0.5));
  
  const matches: PlagiarismMatch[] = [];
  for (let i = 0; i < plagiarizedCount; i++) {
    matches.push({
      text: sentences[i] || "Sample plagiarized text",
      page: Math.floor(i / 3) + 1,
      confidence: 0.7 + Math.random() * 0.3,
      source: `Source ${i + 1}: Academic Paper ${Math.floor(Math.random() * 1000)}`
    });
  }
  
  return {
    totalPages: Math.ceil(sentences.length / 10),
    plagiarismPercentage: (plagiarizedCount / sentences.length) * 100,
    matches,
    originalText: text,
    analyzedAt: new Date()
  };
}

export function generatePlagiarismReportPDF(report: PlagiarismReport, fileName: string): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = 20;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Plagiarism Detection Report', margin, yPosition);
  yPosition += 15;
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${report.analyzedAt.toLocaleString()}`, margin, yPosition);
  yPosition += 10;
  doc.text(`Document: ${fileName}`, margin, yPosition);
  yPosition += 15;
  
  // Summary box
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin + 5, yPosition);
  yPosition += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Plagiarism Score: ${report.plagiarismPercentage.toFixed(1)}%`, margin + 5, yPosition);
  yPosition += 7;
  doc.text(`Total Matches: ${report.matches.length}`, margin + 5, yPosition);
  yPosition += 15;
  
  // Severity indicator
  const severity = report.plagiarismPercentage > 50 ? 'High' : 
                   report.plagiarismPercentage > 20 ? 'Medium' : 'Low';
  const severityColor = report.plagiarismPercentage > 50 ? [220, 38, 38] : 
                        report.plagiarismPercentage > 20 ? [234, 179, 8] : [34, 197, 94];
  
  doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
  doc.rect(margin, yPosition, 40, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(severity, margin + 12, yPosition + 6);
  doc.setTextColor(0, 0, 0);
  yPosition += 20;
  
  // Detected Matches
  if (report.matches.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detected Plagiarism', margin, yPosition);
    yPosition += 10;
    
    report.matches.forEach((match, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Match box
      doc.setFillColor(255, 240, 240);
      const boxHeight = 35;
      doc.rect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Match ${index + 1}`, margin + 5, yPosition + 7);
      
      // Confidence badge
      doc.setFillColor(220, 38, 38);
      doc.rect(pageWidth - margin - 40, yPosition + 3, 35, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`${(match.confidence * 100).toFixed(0)}% match`, pageWidth - margin - 37, yPosition + 7);
      doc.setTextColor(0, 0, 0);
      
      yPosition += 12;
      
      // Match details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const textLines = doc.splitTextToSize(match.text, pageWidth - 2 * margin - 10);
      textLines.slice(0, 2).forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      
      if (match.source) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(match.source, margin + 5, yPosition);
        doc.setTextColor(0, 0, 0);
      }
      
      yPosition += 10;
    });
  }
  
  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} | Netra - AI Content Ownership Registry`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  return doc.output('blob');
}
