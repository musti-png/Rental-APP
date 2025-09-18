/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { TABS } from './constants';

const PDF_DEFAULT_OPTIONS = {
  unit: 'pt' as const,
  format: 'a4' as const,
  orientation: 'portrait' as const,
  scale: 2,
};

function createOffscreenContainer() {
  const c = document.createElement('div');
  c.style.position = 'fixed';
  c.style.left = '-10000px';
  c.style.top = '0';
  c.style.width = '210mm'; // A4 width as default CSS reference
  c.style.padding = '0';
  c.style.background = '#fff';
  document.body.appendChild(c);
  return c;
}

async function renderSectionToCanvas(sectionId: string, scale = 2): Promise<HTMLCanvasElement> {
  const selector = `[data-pdf-section="${sectionId}"]`;
  const source = document.querySelector(selector) as HTMLElement | null;
  if (!source) throw new Error(`Section not found: ${sectionId} (selector: ${selector})`);

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.boxSizing = 'border-box';
  clone.style.width = window.getComputedStyle(source).width;

  const container = createOffscreenContainer();
  container.appendChild(clone);

  await new Promise(res => setTimeout(res, 120));

  const canvas = await html2canvas(clone, {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    windowWidth: clone.scrollWidth,
    windowHeight: clone.scrollHeight,
  });

  document.body.removeChild(container);
  return canvas;
}

function canvasToDataUrl(canvas: HTMLCanvasElement) {
  return canvas.toDataURL('image/png', 1.0);
}

function generatePdfFromCanvases(canvases: HTMLCanvasElement[], options = PDF_DEFAULT_OPTIONS) {
  const { unit, format, orientation } = options;
  const doc = new jsPDF({ unit, format, orientation });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  canvases.forEach((canvas, idx) => {
    const imgData = canvasToDataUrl(canvas);
    const imgW = canvas.width;
    const imgH = canvas.height;
    const ratio = Math.min(pageWidth / imgW, pageHeight / imgH);
    const w = imgW * ratio;
    const h = imgH * ratio;
    const x = (pageWidth - w) / 2;
    const y = 20; // small top margin

    if (idx > 0) doc.addPage();
    doc.addImage(imgData, 'PNG', x, y, w, h);
  });

  return doc;
}

export const PdfButtonsPanel = ({ activeSectionId, sectionIds, isSubmittable, incompleteSections, pdfOptions = {} }) => {
  const options = { ...PDF_DEFAULT_OPTIONS, ...(pdfOptions || {}) };
  const disabledTitle = `Please complete the following sections first: ${incompleteSections.join(', ')}`;

  const handlePreview = async () => {
    try {
      const canvas = await renderSectionToCanvas(activeSectionId, options.scale);
      const dataUrl = canvasToDataUrl(canvas);
      const w = window.open('');
      if (!w) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${activeSectionId}_preview.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      w.document.write(`<title>PDF Preview - ${activeSectionId}</title><img src="${dataUrl}" style="max-width:100%"/>`);
    } catch (err) {
      console.error('Preview error:', err);
      alert('An error occurred during PDF preview. Check the console.');
    }
  };

  const handleCreatePdf = async () => {
    try {
      const canvas = await renderSectionToCanvas(activeSectionId, options.scale);
      const pdf = generatePdfFromCanvases([canvas], options);
      pdf.save(`${activeSectionId}.pdf`);
    } catch (err) {
      console.error('PDF creation error:', err);
      alert('An error occurred during PDF creation. Check the console.');
    }
  };

  const handleBulkPreview = async () => {
    try {
      if (!sectionIds || sectionIds.length === 0) {
        alert('Section IDs for bulk preview are missing.');
        return;
      }
      const canvases: HTMLCanvasElement[] = [];
      for (const sid of sectionIds) {
        try {
          const c = await renderSectionToCanvas(sid, options.scale);
          canvases.push(c);
          await new Promise(r => setTimeout(r, 80));
        } catch (err) {
          console.warn('Preview render error for section, skipping:', sid, err);
        }
      }
      if (canvases.length === 0) {
        alert('No sections could be rendered for preview.');
        return;
      }

      const w = window.open('');
      if (!w) {
        alert('Could not open preview window. Please disable your pop-up blocker.');
        return;
      }

      w.document.write(`
        <html>
          <head>
            <title>Bulk Application Preview</title>
            <style>
              body { font-family: sans-serif; background-color: #f0f2f5; margin: 0; padding: 20px; }
              img { max-width: 100%; width: 800px; display: block; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 4px; }
              h2 { text-align: center; color: #213655; margin-top: 40px; border-bottom: 2px solid #dfe1e6; padding-bottom: 10px; }
            </style>
          </head>
          <body>
      `);

      canvases.forEach((canvas, index) => {
          const dataUrl = canvasToDataUrl(canvas);
          const sectionTitle = TABS[index] || `Section ${index + 1}`;
          w.document.write(`<h2>${sectionTitle}</h2>`);
          w.document.write(`<img src="${dataUrl}" alt="Preview for ${sectionTitle}" />`);
      });

      w.document.write('</body></html>');
      w.document.close();
    } catch (err) {
      console.error('Bulk Preview error:', err);
      alert('An error occurred during bulk preview. Check the console.');
    }
  };

  const handleBulkCreate = async () => {
    try {
      if (!sectionIds || sectionIds.length === 0) {
        alert('Section IDs for bulk creation are missing.');
        return;
      }
      const canvases: HTMLCanvasElement[] = [];
      for (const sid of sectionIds) {
        try {
          const c = await renderSectionToCanvas(sid, options.scale);
          canvases.push(c);
          await new Promise(r => setTimeout(r, 80));
        } catch (err) {
          console.warn('PDF render error for section, skipping:', sid, err);
        }
      }
      if (canvases.length === 0) {
        alert('No sections could be rendered.');
        return;
      }
      const pdf = generatePdfFromCanvases(canvases, options);
      pdf.save(`bulk_sections_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Bulk PDF error:', err);
      alert('An error occurred during bulk PDF creation. Check the console.');
    }
  };

  return (
    <div className="pdf-buttons-panel">
      <button type="button" onClick={handlePreview} className="btn btn-secondary">Preview PDF</button>
      <button type="button" onClick={handleCreatePdf} className="btn btn-primary" disabled={!isSubmittable} title={!isSubmittable ? disabledTitle : undefined}>Create PDF</button>
      <button type="button" onClick={handleBulkPreview} className="btn btn-secondary">Preview All Sections</button>
      <button type="button" onClick={handleBulkCreate} className="btn btn-warning" disabled={!isSubmittable} title={!isSubmittable ? disabledTitle : undefined}>Create Bulk PDF</button>
    </div>
  );
}
