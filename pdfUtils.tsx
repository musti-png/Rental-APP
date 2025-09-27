/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PrintLayout } from './PrintLayout';

const generateCanvas = async (formData, propertyName) => {
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-10000px';
    printContainer.style.top = '0';
    printContainer.style.width = '8.5in'; // Standard letter size for better scaling
    printContainer.style.background = 'white';
    document.body.appendChild(printContainer);

    const root = ReactDOM.createRoot(printContainer);
    let canvas;

    try {
        flushSync(() => {
            root.render(<PrintLayout formData={formData} propertyName={propertyName} />);
        });
        
        // Brief delay to allow images to render from base64 sources
        await new Promise(resolve => setTimeout(resolve, 500));

        canvas = await html2canvas(printContainer, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            windowWidth: printContainer.scrollWidth,
            windowHeight: printContainer.scrollHeight,
        });
    } catch (error) {
        console.error("Error generating canvas:", error);
        throw error; // Re-throw to be caught by the caller
    } finally {
        flushSync(() => {
            root.unmount();
        });
        document.body.removeChild(printContainer);
    }
    return canvas;
};


const previewApplication = async (formData, propertyName) => {
    try {
        const canvas = await generateCanvas(formData, propertyName);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const previewWindow = window.open('');
        if (previewWindow) {
            previewWindow.document.write(`
                <html>
                    <head><title>Application Preview</title></head>
                    <body style="margin:0;">
                        <img src="${dataUrl}" style="width:100%; max-width: 800px; margin: auto; display: block;"/>
                    </body>
                </html>
            `);
            previewWindow.document.close();
        } else {
            alert('Could not open preview window. Please disable your pop-up blocker.');
        }
    } catch (err) {
        console.error('Preview error:', err);
        alert('An error occurred during preview generation. Please check the console.');
    }
};

const createApplicationPdf = async (formData, propertyName) => {
    try {
        const canvas = await generateCanvas(formData, propertyName);
        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pageWidth / imgWidth;
        const canvasHeightInPdf = imgHeight * ratio;
        
        const pageData = canvas.toDataURL('image/png', 1.0);
        
        let heightLeft = canvasHeightInPdf;
        let position = 0;
        
        pdf.addImage(pageData, 'PNG', 0, position, pageWidth, canvasHeightInPdf);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(pageData, 'PNG', 0, position, pageWidth, canvasHeightInPdf);
            heightLeft -= pageHeight;
        }

        pdf.save('rental-application.pdf');
    } catch (err) {
        console.error('PDF creation error:', err);
        alert('An error occurred during PDF creation. Please check the console.');
    }
};


export const PdfButtonsPanel = ({ formData, propertyName, isSubmittable, incompleteSections }) => {
  const disabledTitle = `Please complete the following sections first: ${incompleteSections.join(', ')}`;

  return (
    <div className="pdf-buttons-panel">
      <button 
        type="button" 
        onClick={() => previewApplication(formData, propertyName)} 
        className="btn btn-secondary"
        disabled={!isSubmittable}
        title={!isSubmittable ? disabledTitle : 'Preview the full application PDF'}
      >
        Preview Application PDF
      </button>
      <button 
        type="button" 
        onClick={() => createApplicationPdf(formData, propertyName)} 
        className="btn btn-primary" 
        disabled={!isSubmittable} 
        title={!isSubmittable ? disabledTitle : 'Download the full application as a PDF'}
      >
        Download Application PDF
      </button>
    </div>
  );
}
