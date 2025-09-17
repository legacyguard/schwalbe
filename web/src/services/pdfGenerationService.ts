
/**
 * PDF Generation Service
 * Generates PDF documents from HTML will content
 */

import type {
  GeneratedWill,
  Jurisdiction,
  LanguageCode,
} from '../types/will-templates';

export class PDFGenerationService {
  /**
   * Generate PDF from HTML content
   */
  async generateWillPDF(
    will: GeneratedWill,
    options?: PDFOptions
  ): Promise<ArrayBuffer> {
    try {
      // In a real implementation, this would use a PDF generation library
      // Options: jsPDF, Puppeteer, or server-side PDF generation

      if (typeof window !== 'undefined' && window.navigator) {
        // Client-side PDF generation using browser's print functionality
        return await this.generateClientSidePDF(will, options);
      } else {
        // Server-side PDF generation (placeholder for now)
        return await this.generateServerSidePDF(will, options);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF document');
    }
  }

  /**
   * Client-side PDF generation using browser print
   */
  private async generateClientSidePDF(
    will: GeneratedWill,
    options?: PDFOptions
  ): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a hidden iframe for PDF generation
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.width = '210mm'; // A4 width
        iframe.style.height = '297mm'; // A4 height
        document.body.appendChild(iframe);

        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          reject(new Error('Cannot access iframe document'));
          return;
        }

        // Generate styled HTML for PDF
        const styledHTML = this.generateStyledHTML(will, options);
        iframeDoc.open();
        iframeDoc.write(styledHTML);
        iframeDoc.close();

        // Wait for content to load
        iframe.onload = () => {
          try {
            // Use browser's print functionality to generate PDF
            const printWindow = iframe.contentWindow;
            if (printWindow) {
              printWindow.print();
            }

            // Clean up
            document.body.removeChild(iframe);

            // Return a mock ArrayBuffer for now
            // In a real implementation, you'd capture the print output
            const mockPDF = new ArrayBuffer(1024);
            resolve(mockPDF);
          } catch (error) {
            document.body.removeChild(iframe);
            reject(error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Server-side PDF generation (placeholder)
   */
  private async generateServerSidePDF(
    will: GeneratedWill,
    options?: PDFOptions
  ): Promise<ArrayBuffer> {
    // This would integrate with a server-side PDF generation service
    // For example: Puppeteer, wkhtmltopdf, or a cloud service

    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: will.content.html,
        options:
          options || this.getDefaultOptions(will.jurisdiction, will.language),
      }),
    });

    if (!response.ok) {
      throw new Error('Server-side PDF generation failed');
    }

    return await response.arrayBuffer();
  }

  /**
   * Generate styled HTML for PDF
   */
  private generateStyledHTML(
    will: GeneratedWill,
    options?: PDFOptions
  ): string {
    const opts = {
      ...this.getDefaultOptions(will.jurisdiction, will.language),
      ...options,
    };

    return `
<!DOCTYPE html>
<html lang="${will.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Last Will and Testament - ${will.id}</title>
    <style>
        ${this.getPDFStyles(opts)}
    </style>
</head>
<body>
    <div class="document">
        <header class="document-header">
            <div class="jurisdiction-badge">${this.getJurisdictionName(will.jurisdiction)}</div>
            <div class="document-type">${this.getWillTypeName(will.type, will.language)}</div>
        </header>

        <main class="document-content">
            ${will.content.html}
        </main>

        <footer class="document-footer">
            <div class="generation-info">
                <p>Generated with LegacyGuard AI on ${new Date(will.metadata.generationDate).toLocaleDateString()}</p>
                <p>Document ID: ${will.id}</p>
                <p>Version: ${will.metadata.version}</p>
            </div>

            <div class="legal-disclaimer">
                <h4>Legal Disclaimer</h4>
                <p>${will.legalDisclaimer}</p>
            </div>

            <div class="execution-instructions">
                <h4>Execution Instructions</h4>
                ${this.formatExecutionInstructions(will.executionInstructions, will.type)}
            </div>
        </footer>
    </div>
</body>
</html>`;
  }

  /**
   * Get PDF-specific CSS styles
   */
  private getPDFStyles(options: PDFOptions): string {
    return `
        @page {
            size: ${options.pageSize};
            margin: ${options.margin};
        }

        body {
            font-family: ${options.fontFamily};
            font-size: ${options.fontSize};
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 0;
        }

        .document {
            padding: 20px;
            background: white;
        }

        .document-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
            margin-bottom: 30px;
        }

        .jurisdiction-badge {
            background: #1a365d;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
        }

        .document-type {
            font-size: 18px;
            font-weight: bold;
            color: #2d3748;
        }

        .document-content {
            min-height: 500px;
        }

        .document-content h1 {
            text-align: center;
            color: #1a365d;
            margin-bottom: 30px;
            font-size: 28px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }

        .document-content h2 {
            color: #2d3748;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 20px;
        }

        .document-content h3 {
            color: #4a5568;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .document-content p {
            margin-bottom: 10px;
            text-align: justify;
        }

        .document-content strong {
            color: #2d3748;
        }

        .document-content hr {
            border: none;
            height: 1px;
            background: #e2e8f0;
            margin: 20px 0;
        }

        .document-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            page-break-inside: avoid;
        }

        .generation-info {
            background: #f7fafc;
            padding: 15px;
            border-left: 4px solid #3182ce;
            margin-bottom: 20px;
        }

        .generation-info p {
            margin: 5px 0;
            font-size: 12px;
            color: #4a5568;
        }

        .legal-disclaimer {
            background: #fef5e7;
            padding: 15px;
            border-left: 4px solid #d69e2e;
            margin-bottom: 20px;
        }

        .legal-disclaimer h4 {
            margin: 0 0 10px 0;
            color: #d69e2e;
            font-size: 14px;
        }

        .legal-disclaimer p {
            margin: 0;
            font-size: 12px;
            color: #744210;
            line-height: 1.4;
        }

        .execution-instructions {
            background: #f0fff4;
            padding: 15px;
            border-left: 4px solid #38a169;
        }

        .execution-instructions h4 {
            margin: 0 0 10px 0;
            color: #38a169;
            font-size: 14px;
        }

        .execution-instructions ol {
            margin: 10px 0 10px 20px;
            font-size: 12px;
            color: #2f855a;
        }

        .execution-instructions li {
            margin-bottom: 5px;
        }

        /* Print-specific styles */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }

            .document-footer {
                page-break-inside: avoid;
            }

            h1, h2, h3 {
                page-break-after: avoid;
            }
        }

        /* Signature lines */
        .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }

        .signature-line {
            border-bottom: 1px solid #333;
            width: 300px;
            height: 20px;
            margin: 20px 0 5px 0;
        }

        .signature-label {
            font-size: 12px;
            color: #666;
        }

        /* Responsive adjustments */
        @media screen and (max-width: 768px) {
            .document {
                padding: 10px;
            }

            .document-header {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }
    `;
  }

  /**
   * Format execution instructions for PDF
   */
  private formatExecutionInstructions(
    instructions: any,
    willType: string
  ): string {
    if (!instructions || !instructions[willType]) {
      return '<p>No specific execution instructions available.</p>';
    }

    const typeInstructions = instructions[willType];
    let html = '';

    if (typeInstructions.steps && typeInstructions.steps.length > 0) {
      html += '<h5>Steps to Execute:</h5><ol>';
      typeInstructions.steps.forEach((step: string) => {
        html += `<li>${step}</li>`;
      });
      html += '</ol>';
    }

    if (
      typeInstructions.requirements &&
      typeInstructions.requirements.length > 0
    ) {
      html += '<h5>Legal Requirements:</h5><ul>';
      typeInstructions.requirements.forEach((req: string) => {
        html += `<li>${req}</li>`;
      });
      html += '</ul>';
    }

    if (typeInstructions.warnings && typeInstructions.warnings.length > 0) {
      html += '<h5>Important Warnings:</h5><ul>';
      typeInstructions.warnings.forEach((warning: string) => {
        html += `<li style="color: #d69e2e;">${warning}</li>`;
      });
      html += '</ul>';
    }

    return html;
  }

  /**
   * Get default PDF options based on jurisdiction
   */
  private getDefaultOptions(
    _jurisdiction: Jurisdiction,
    language: LanguageCode
  ): PDFOptions {
    return {
      pageSize: 'A4',
      margin: '20mm',
      fontSize: '12pt',
      fontFamily: this.getFontFamily(language),
      orientation: 'portrait',
      includeHeader: true,
      includeFooter: true,
    };
  }

  /**
   * Get appropriate font family for language
   */
  private getFontFamily(language: LanguageCode): string {
    const fontMappings: Record<string, string> = {
      cs: '"Times New Roman", serif',
      sk: '"Times New Roman", serif',
      de: '"Times New Roman", serif',
      en: '"Times New Roman", serif',
      uk: '"Times New Roman", serif',
    };

    return fontMappings[language] || '"Times New Roman", serif';
  }

  /**
   * Get jurisdiction display name
   */
  private getJurisdictionName(jurisdiction: Jurisdiction): string {
    const names: Record<Jurisdiction, string> = {
      CZ: 'Czech Republic',
      SK: 'Slovak Republic',
      DE: 'Germany',
      AT: 'Austria',
      FR: 'France',
      ES: 'Spain',
      IT: 'Italy',
      NL: 'Netherlands',
      BE: 'Belgium',
      LU: 'Luxembourg',
      CH: 'Switzerland',
      LI: 'Liechtenstein',
      UK: 'United Kingdom',
      DK: 'Denmark',
      SE: 'Sweden',
      FI: 'Finland',
      PL: 'Poland',
      HU: 'Hungary',
      SI: 'Slovenia',
      EE: 'Estonia',
      LV: 'Latvia',
      LT: 'Lithuania',
      PT: 'Portugal',
      GR: 'Greece',
      MT: 'Malta',
      CY: 'Cyprus',
      IE: 'Ireland',
      NO: 'Norway',
      IS: 'Iceland',
      RO: 'Romania',
      BG: 'Bulgaria',
      HR: 'Croatia',
      RS: 'Serbia',
      AL: 'Albania',
      MK: 'North Macedonia',
      ME: 'Montenegro',
      MD: 'Moldova',
      UA: 'Ukraine',
      BA: 'Bosnia and Herzegovina',
    };

    return names[jurisdiction] || jurisdiction;
  }

  /**
   * Get will type display name
   */
  private getWillTypeName(type: string, language: LanguageCode): string {
    const names: Record<string, Record<LanguageCode, string>> = {
      holographic: {
        en: 'Holographic Will',
        cs: 'Holografická závěť',
        sk: 'Holografická závet',
        de: 'Eigenhändiges Testament',
        uk: 'Власноручний заповіт',
      } as any,
      witnessed: {
        en: 'Witnessed Will',
        cs: 'Závěť se svědky',
        sk: 'Závet so svedkami',
        de: 'Testament mit Zeugen',
        uk: 'Заповіт із свідками',
      } as any,
      notarial: {
        en: 'Notarial Will',
        cs: 'Notářská závěť',
        sk: 'Notárska závet',
        de: 'Notarielles Testament',
        uk: 'Нотаріальний заповіт',
      } as any,
    };

    return names[type]?.[language] || names[type]?.['en'] || type;
  }

  /**
   * Download PDF file in browser
   */
  downloadPDF(pdfBuffer: ArrayBuffer, filename: string): void {
    try {
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
      throw new Error('Failed to download PDF');
    }
  }

  /**
   * Preview PDF in new window
   */
  previewPDF(pdfBuffer: ArrayBuffer): void {
    try {
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        throw new Error('Popup blocked - please allow popups to preview PDF');
      }
    } catch (error) {
      console.error('PDF preview failed:', error);
      throw new Error('Failed to preview PDF');
    }
  }
}

export interface PDFOptions {
  fontFamily?: string;
  fontSize?: string;
  includeFooter?: boolean;
  includeHeader?: boolean;
  margin?: string;
  orientation?: 'landscape' | 'portrait';
  pageSize?: string;
}

// Export singleton instance
export const pdfGenerationService = new PDFGenerationService();
