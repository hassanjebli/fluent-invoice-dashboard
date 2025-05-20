
// Using the default import for html2pdf
import html2pdf from 'html2pdf.js';

export const exportToPDF = (elementId: string, filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    
    if (!element) {
      reject(new Error(`Element with ID '${elementId}' not found`));
      return;
    }
    
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        resolve();
      })
      .catch((error: Error) => {
        reject(error);
      });
  });
};
