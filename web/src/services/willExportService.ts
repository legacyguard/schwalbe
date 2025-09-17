/**
 * Will Export Service
 * Advanced service for exporting wills to PDF, DOCX, and Markdown formats
 * with full localization support for all language-jurisdiction combinations
 */

import { jsPDF } from 'jspdf';
import {
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
  Paragraph,
  TextRun,
} from 'docx';
import type {
  JurisdictionCode,
  LanguageCode,
} from '../contexts/LocalizationContext';

export interface WillExportData {
  address: string;
  backupExecutor?: {
    address: string;
    name: string;
    relationship: string;
  };
  backupGuardian?: {
    address: string;
    name: string;
    relationship: string;
  };
  bankAccounts: Array<{
    accountNumber: string;
    bank: string;
    type: string;
  }>;
  // Beneficiaries
  beneficiaries: Array<{
    conditions?: string;
    name: string;
    percentage: number;
    relationship: string;
  }>;
  birthDate: string;
  birthPlace: string;

  charitableBequests?: Array<{
    amount?: number;
    description: string;
    organization: string;
  }>;
  children: Array<{
    birthDate: string;
    name: string;
    relationship: string;
  }>;

  citizenship: string;

  city: string;

  createdDate: string;

  // Special Instructions
  funeralWishes?: string;

  maritalStatus: 'divorced' | 'married' | 'single' | 'widowed';

  organDonation?: boolean;

  personalId?: string;

  personalMessages?: string;

  personalProperty: Array<{
    description: string;
    recipient?: string;
    value?: number;
  }>;

  // Executors and Guardians
  primaryExecutor?: {
    address: string;
    name: string;
    relationship: string;
  };
  primaryGuardian?: {
    address: string;
    name: string;
    relationship: string;
  };
  // Assets
  realEstate: Array<{
    address: string;
    description: string;
    value?: number;
  }>;

  // Family
  spouseName?: string;

  // Personal Information
  testatorName: string;
  vehicles: Array<{
    make: string;
    model: string;
    value?: number;
    vin?: string;
    year: number;
  }>;
  // Metadata
  willType: 'holographic' | 'notarial' | 'witnessed';
}

export interface ExportOptions {
  customHeaderText?: string;
  format: 'docx' | 'markdown' | 'pdf';
  includeExecutionInstructions?: boolean;
  includeJurisdictionInfo?: boolean;
  jurisdiction: JurisdictionCode;
  language: LanguageCode;
}

export interface LocalizedTemplateContent {
  documentTitle: string;
  executionInstructions: {
    holographic: {
      requirements: string[];
      steps: string[];
      title: string;
      warnings: string[];
    };
    notarial: {
      requirements: string[];
      steps: string[];
      title: string;
      warnings: string[];
    };
    title: string;
    witnessed: {
      requirements: string[];
      steps: string[];
      title: string;
      warnings: string[];
    };
  };
  footerText: string;
  headerText: string;
  jurisdictionInfo: {
    currency: string;
    holographicRequirements: string;
    legalFramework: string;
    minimumAge: string;
    notaryRequirements?: string;
    title: string;
    witnessRequirements: string;
  };
  legalDisclaimer: string;
  legalNotes?: {
    notes: string[];
    title: string;
  };
  sections: {
    beneficiaries: string;
    executor: string;
    finalWishes: string;
    forcedHeirs?: string;
    guardianship?: string;
    personalInfo: string;
    residuary: string;
    revocation: string;
    signature: string;
    specificBequests: string;
    witnesses: string;
  };
}

export class WillExportService {
  private templates: Map<string, LocalizedTemplateContent> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Export will in the specified format
   */
  async exportWill(
    willData: WillExportData,
    options: ExportOptions
  ): Promise<Blob> {
    const templateKey = `${options.language}_${options.jurisdiction}`;
    const template = this.templates.get(templateKey);

    if (!template) {
      throw new Error(`Template not found for ${templateKey}`);
    }

    switch (options.format) {
      case 'pdf':
        return await this.exportToPDF(willData, template, options);
      case 'docx':
        return await this.exportToDOCX(willData, template, options);
      case 'markdown':
        return this.exportToMarkdown(willData, template, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export will to PDF format
   */
  private async exportToPDF(
    willData: WillExportData,
    template: LocalizedTemplateContent,
    options: ExportOptions
  ): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 20;
    const pageWidth = 190;
    const margin = 20;
    const lineHeight = 7;

    // Helper function to add text with word wrap
    const addText = (
      text: string,
      x: number,
      y: number,
      maxWidth?: number
    ): number => {
      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * lineHeight;
      } else {
        doc.text(text, x, y);
        return y + lineHeight;
      }
    };

    // Header with jurisdiction badge
    doc.setFontSize(10);
    doc.setFillColor(26, 54, 93);
    doc.rect(margin, 10, 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(this.getJurisdictionName(options.jurisdiction), margin + 2, 16);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(template.documentTitle, margin + 50, 16);

    yPosition = 30;

    // Document Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(template.documentTitle, margin, yPosition);
    yPosition += 10;

    // Personal Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(template.sections.personalInfo, margin, yPosition);
    yPosition += 5;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(
      `${this.getPersonalDeclaration(willData, template, options.language)}`,
      margin,
      yPosition,
      pageWidth - margin * 2
    );
    yPosition += 10;

    // Revocation Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(template.sections.revocation, margin, yPosition);
    yPosition += 5;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(
      this.getRevocationText(template, options.language),
      margin,
      yPosition,
      pageWidth - margin * 2
    );
    yPosition += 10;

    // Beneficiaries Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(template.sections.beneficiaries, margin, yPosition);
    yPosition += 5;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    willData.beneficiaries.forEach((beneficiary, index) => {
      const beneficiaryText = `${index + 1}. ${beneficiary.name} (${beneficiary.relationship}) - ${beneficiary.percentage}%`;
      yPosition = addText(
        beneficiaryText,
        margin + 5,
        yPosition,
        pageWidth - margin * 2
      );
      if (beneficiary.conditions) {
        yPosition = addText(
          `   Podmienky: ${beneficiary.conditions}`,
          margin + 5,
          yPosition,
          pageWidth - margin * 2
        );
      }
      yPosition += 3;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    });

    // Assets Section if there are any
    if (
      willData.realEstate.length > 0 ||
      willData.bankAccounts.length > 0 ||
      willData.vehicles.length > 0
    ) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(
        template.sections.specificBequests,
        margin,
        yPosition
      );
      yPosition += 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // Real Estate
      willData.realEstate.forEach((property, index) => {
        const propertyText = `${this.getRealEstateText(template, options.language)} ${index + 1}: ${property.description}, ${property.address}`;
        yPosition = addText(
          propertyText,
          margin + 5,
          yPosition,
          pageWidth - margin * 2
        );
        if (property.value) {
          yPosition = addText(
            `   Hodnota: ${property.value} ${this.getCurrency(options.jurisdiction)}`,
            margin + 5,
            yPosition
          );
        }
        yPosition += 3;

        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Bank Accounts
      willData.bankAccounts.forEach((account, index) => {
        const accountText = `${this.getBankAccountText(template, options.language)} ${index + 1}: ${account.bank}, číslo účtu: ${account.accountNumber}`;
        yPosition = addText(
          accountText,
          margin + 5,
          yPosition,
          pageWidth - margin * 2
        );
        yPosition += 3;

        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // Vehicles
      willData.vehicles.forEach((vehicle, index) => {
        const vehicleText = `${this.getVehicleText(template, options.language)} ${index + 1}: ${vehicle.make} ${vehicle.model} (${vehicle.year})`;
        yPosition = addText(
          vehicleText,
          margin + 5,
          yPosition,
          pageWidth - margin * 2
        );
        if (vehicle.vin) {
          yPosition = addText(`   VIN: ${vehicle.vin}`, margin + 5, yPosition);
        }
        yPosition += 3;

        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    // Executor Section
    if (willData.primaryExecutor) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(template.sections.executor, margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const executorText = `${this.getExecutorText(template, options.language)}: ${willData.primaryExecutor.name}, ${willData.primaryExecutor.address}`;
      yPosition = addText(
        executorText,
        margin,
        yPosition,
        pageWidth - margin * 2
      );

      if (willData.backupExecutor) {
        const backupText = `${this.getBackupExecutorText(template, options.language)}: ${willData.backupExecutor.name}, ${willData.backupExecutor.address}`;
        yPosition = addText(
          backupText,
          margin,
          yPosition,
          pageWidth - margin * 2
        );
      }
      yPosition += 10;
    }

    // Guardian Section
    if (
      willData.primaryGuardian &&
      willData.children.some(child => this.isMinor(child.birthDate))
    ) {
      yPosition += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(
        template.sections.guardianship || 'Poručníctvo',
        margin,
        yPosition
      );
      yPosition += 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const guardianText = `${this.getGuardianText(template, options.language)}: ${willData.primaryGuardian.name}, ${willData.primaryGuardian.address}`;
      yPosition = addText(
        guardianText,
        margin,
        yPosition,
        pageWidth - margin * 2
      );

      if (willData.backupGuardian) {
        const backupGuardianText = `${this.getBackupGuardianText(template, options.language)}: ${willData.backupGuardian.name}, ${willData.backupGuardian.address}`;
        yPosition = addText(
          backupGuardianText,
          margin,
          yPosition,
          pageWidth - margin * 2
        );
      }
      yPosition += 10;
    }

    // Final Wishes
    if (
      willData.funeralWishes ||
      willData.organDonation ||
      willData.personalMessages
    ) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(template.sections.finalWishes, margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      if (willData.funeralWishes) {
        yPosition = addText(
          `${this.getFuneralWishesText(template, options.language)}: ${willData.funeralWishes}`,
          margin,
          yPosition,
          pageWidth - margin * 2
        );
        yPosition += 5;
      }

      if (willData.organDonation) {
        yPosition = addText(
          this.getOrganDonationText(template, options.language),
          margin,
          yPosition,
          pageWidth - margin * 2
        );
        yPosition += 5;
      }

      if (willData.personalMessages) {
        yPosition = addText(
          `${this.getPersonalMessagesText(template, options.language)}: ${willData.personalMessages}`,
          margin,
          yPosition,
          pageWidth - margin * 2
        );
        yPosition += 10;
      }
    }

    // Signature Section
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(template.sections.signature, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(
      `${this.getInCityText(options.language)} ${willData.city} ${this.getDateText(options.language)} ${new Date().toLocaleDateString()}`,
      margin,
      yPosition
    );
    yPosition += 20;

    // Signature line
    doc.line(margin, yPosition, margin + 80, yPosition);
    yPosition += 5;
    yPosition = addText(
      `${willData.testatorName}, ${this.getTestatorText(options.language)}`,
      margin,
      yPosition
    );
    yPosition += 20;

    // Witnesses section for witnessed wills
    if (willData.willType === 'witnessed') {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(template.sections.witnesses, margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      yPosition = addText(
        this.getWitnessText(template, options.language),
        margin,
        yPosition,
        pageWidth - margin * 2
      );
      yPosition += 15;

      // Witness 1
      doc.line(margin, yPosition, margin + 80, yPosition);
      yPosition += 5;
      yPosition = addText(
        `${this.getWitnessText(template, options.language)} 1: _____________________ ${this.getDateText(options.language)}: _________`,
        margin,
        yPosition
      );
      yPosition += 15;

      // Witness 2
      doc.line(margin, yPosition, margin + 80, yPosition);
      yPosition += 5;
      yPosition = addText(
        `${this.getWitnessText(template, options.language)} 2: _____________________ ${this.getDateText(options.language)}: _________`,
        margin,
        yPosition
      );
    }

    // Execution Instructions (if requested)
    if (options.includeExecutionInstructions) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(
        template.executionInstructions.title,
        margin,
        yPosition
      );
      yPosition += 10;

      const instructions = template.executionInstructions[willData.willType];

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(instructions.title, margin, yPosition);
      yPosition += 5;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      // Steps
      if (instructions.steps.length > 0) {
        yPosition = addText('Kroky:', margin, yPosition);
        yPosition += 3;
        instructions.steps.forEach((step, index) => {
          yPosition = addText(
            `${index + 1}. ${step}`,
            margin + 5,
            yPosition,
            pageWidth - margin * 2
          );
          yPosition += 3;
        });
        yPosition += 5;
      }

      // Requirements
      if (instructions.requirements.length > 0) {
        yPosition = addText('Požiadavky:', margin, yPosition);
        yPosition += 3;
        instructions.requirements.forEach(req => {
          yPosition = addText(
            `• ${req}`,
            margin + 5,
            yPosition,
            pageWidth - margin * 2
          );
          yPosition += 3;
        });
        yPosition += 5;
      }

      // Warnings
      if (instructions.warnings.length > 0) {
        doc.setTextColor(200, 50, 50);
        yPosition = addText('Upozornenia:', margin, yPosition);
        yPosition += 3;
        instructions.warnings.forEach(warning => {
          yPosition = addText(
            `⚠ ${warning}`,
            margin + 5,
            yPosition,
            pageWidth - margin * 2
          );
          yPosition += 3;
        });
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
      }
    }

    // Jurisdiction Information (if requested)
    if (options.includeJurisdictionInfo) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(template.jurisdictionInfo.title, margin, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      const jurisdictionItems = [
        `Právny rámec: ${template.jurisdictionInfo.legalFramework}`,
        `Mena: ${template.jurisdictionInfo.currency}`,
        `Minimálny vek: ${template.jurisdictionInfo.minimumAge}`,
        `Požiadavky na svedkov: ${template.jurisdictionInfo.witnessRequirements}`,
        `Holografický závet: ${template.jurisdictionInfo.holographicRequirements}`,
      ];

      if (template.jurisdictionInfo.notaryRequirements) {
        jurisdictionItems.push(
          `Notársky závet: ${template.jurisdictionInfo.notaryRequirements}`
        );
      }

      jurisdictionItems.forEach(item => {
        yPosition = addText(item, margin, yPosition, pageWidth - margin * 2);
        yPosition += 5;
      });
      yPosition += 10;
    }

    // Footer with legal disclaimer
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText(this.getLegalDisclaimerTitle(options.language), margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(
      template.legalDisclaimer,
      margin,
      yPosition,
      pageWidth - margin * 2
    );
    yPosition += 10;

    doc.setFontSize(8);
    yPosition = addText(
      template.footerText,
      margin,
      yPosition,
      pageWidth - margin * 2
    );

    return new Blob([doc.output('blob')], { type: 'application/pdf' });
  }

  /**
   * Export will to DOCX format
   */
  private async exportToDOCX(
    willData: WillExportData,
    template: LocalizedTemplateContent,
    options: ExportOptions
  ): Promise<Blob> {
    const paragraphs: Paragraph[] = [];

    // Document Title
    paragraphs.push(
      new Paragraph({
        text: template.documentTitle,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      })
    );

    // Header with jurisdiction
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${this.getJurisdictionName(options.jurisdiction)} | `,
            bold: true,
            color: '1a365d',
          }),
          new TextRun({
            text: template.headerText,
            italics: true,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    // Personal Information
    paragraphs.push(
      new Paragraph({
        text: template.sections.personalInfo,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: this.getPersonalDeclaration(willData, template, options.language),
        spacing: { after: 300 },
      })
    );

    // Revocation
    paragraphs.push(
      new Paragraph({
        text: template.sections.revocation,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: this.getRevocationText(template, options.language),
        spacing: { after: 300 },
      })
    );

    // Beneficiaries
    paragraphs.push(
      new Paragraph({
        text: template.sections.beneficiaries,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    willData.beneficiaries.forEach((beneficiary, index) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. `,
              bold: true,
            }),
            new TextRun({
              text: `${beneficiary.name} (${beneficiary.relationship}) - ${beneficiary.percentage}%`,
            }),
          ],
          spacing: { after: 100 },
        })
      );

      if (beneficiary.conditions) {
        paragraphs.push(
          new Paragraph({
            text: `   Podmienky: ${beneficiary.conditions}`,
            spacing: { after: 100 },
          })
        );
      }
    });

    // Assets (if any)
    if (
      willData.realEstate.length > 0 ||
      willData.bankAccounts.length > 0 ||
      willData.vehicles.length > 0
    ) {
      paragraphs.push(
        new Paragraph({
          text: template.sections.specificBequests,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );

      // Real Estate
      willData.realEstate.forEach((property, index) => {
        paragraphs.push(
          new Paragraph({
            text: `${this.getRealEstateText(template, options.language)} ${index + 1}: ${property.description}, ${property.address}`,
            spacing: { after: 100 },
          })
        );
        if (property.value) {
          paragraphs.push(
            new Paragraph({
              text: `   Hodnota: ${property.value} ${this.getCurrency(options.jurisdiction)}`,
              spacing: { after: 100 },
            })
          );
        }
      });

      // Bank Accounts
      willData.bankAccounts.forEach((account, index) => {
        paragraphs.push(
          new Paragraph({
            text: `${this.getBankAccountText(template, options.language)} ${index + 1}: ${account.bank}, číslo účtu: ${account.accountNumber}`,
            spacing: { after: 100 },
          })
        );
      });

      // Vehicles
      willData.vehicles.forEach((vehicle, index) => {
        paragraphs.push(
          new Paragraph({
            text: `${this.getVehicleText(template, options.language)} ${index + 1}: ${vehicle.make} ${vehicle.model} (${vehicle.year})${vehicle.vin ? ', VIN: ' + vehicle.vin : ''}`,
            spacing: { after: 100 },
          })
        );
      });
    }

    // Executor
    if (willData.primaryExecutor) {
      paragraphs.push(
        new Paragraph({
          text: template.sections.executor,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: `${this.getExecutorText(template, options.language)}: ${willData.primaryExecutor.name}, ${willData.primaryExecutor.address}`,
          spacing: { after: 100 },
        })
      );

      if (willData.backupExecutor) {
        paragraphs.push(
          new Paragraph({
            text: `${this.getBackupExecutorText(template, options.language)}: ${willData.backupExecutor.name}, ${willData.backupExecutor.address}`,
            spacing: { after: 200 },
          })
        );
      }
    }

    // Guardianship
    if (
      willData.primaryGuardian &&
      willData.children.some(child => this.isMinor(child.birthDate))
    ) {
      paragraphs.push(
        new Paragraph({
          text: template.sections.guardianship || 'Poručníctvo',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: `${this.getGuardianText(template, options.language)}: ${willData.primaryGuardian.name}, ${willData.primaryGuardian.address}`,
          spacing: { after: 100 },
        })
      );

      if (willData.backupGuardian) {
        paragraphs.push(
          new Paragraph({
            text: `${this.getBackupGuardianText(template, options.language)}: ${willData.backupGuardian.name}, ${willData.backupGuardian.address}`,
            spacing: { after: 200 },
          })
        );
      }
    }

    // Final Wishes
    if (
      willData.funeralWishes ||
      willData.organDonation ||
      willData.personalMessages
    ) {
      paragraphs.push(
        new Paragraph({
          text: template.sections.finalWishes,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );

      if (willData.funeralWishes) {
        paragraphs.push(
          new Paragraph({
            text: `${this.getFuneralWishesText(template, options.language)}: ${willData.funeralWishes}`,
            spacing: { after: 100 },
          })
        );
      }

      if (willData.organDonation) {
        paragraphs.push(
          new Paragraph({
            text: this.getOrganDonationText(template, options.language),
            spacing: { after: 100 },
          })
        );
      }

      if (willData.personalMessages) {
        paragraphs.push(
          new Paragraph({
            text: `${this.getPersonalMessagesText(template, options.language)}: ${willData.personalMessages}`,
            spacing: { after: 200 },
          })
        );
      }
    }

    // Signature Section
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

    paragraphs.push(
      new Paragraph({
        text: template.sections.signature,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: `${this.getInCityText(options.language)} ${willData.city} ${this.getDateText(options.language)} ${new Date().toLocaleDateString()}`,
        spacing: { after: 400 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: '_'.repeat(50),
        spacing: { after: 100 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: `${willData.testatorName}, ${this.getTestatorText(options.language)}`,
        spacing: { after: 400 },
      })
    );

    // Witnesses for witnessed wills
    if (willData.willType === 'witnessed') {
      paragraphs.push(
        new Paragraph({
          text: template.sections.witnesses,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: this.getWitnessText(template, options.language),
          spacing: { after: 300 },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: `${this.getWitnessLabelText(options.language)} 1: ` + '_'.repeat(30) + ` ${this.getDateText(options.language)}: ` + '_'.repeat(15),
          spacing: { after: 200 },
        })
      );

      paragraphs.push(
        new Paragraph({
          text: `${this.getWitnessLabelText(options.language)} 2: ` + '_'.repeat(30) + ` ${this.getDateText(options.language)}: ` + '_'.repeat(15),
          spacing: { after: 300 },
        })
      );
    }

    // Legal Notes
    if (template.legalNotes) {
      paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

      paragraphs.push(
        new Paragraph({
          text: template.legalNotes.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );

      template.legalNotes.notes.forEach((note, index) => {
        paragraphs.push(
          new Paragraph({
            text: `${index + 1}. ${note}`,
            spacing: { after: 100 },
          })
        );
      });
    }

    // Legal Disclaimer
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }));

    paragraphs.push(
      new Paragraph({
        text: this.getLegalDisclaimerTitle(options.language),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        text: template.legalDisclaimer,
        spacing: { after: 200 },
      })
    );

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: template.footerText,
            size: 16,
            italics: true,
          }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const buffer = await Packer.toBlob(doc);
    return buffer;
  }

  /**
   * Export will to Markdown format
   */
  private exportToMarkdown(
    willData: WillExportData,
    template: LocalizedTemplateContent,
    options: ExportOptions
  ): Blob {
    let markdown = '';

    // Header
    markdown += `# ${template.documentTitle}\n\n`;
    markdown += `**${this.getJurisdictionName(options.jurisdiction)}** | ${template.headerText}\n\n`;
    markdown += `---\n\n`;

    // Personal Information
    markdown += `## ${template.sections.personalInfo}\n\n`;
    markdown += `${this.getPersonalDeclaration(willData, template, options.language)}\n\n`;

    // Revocation
    markdown += `## ${template.sections.revocation}\n\n`;
    markdown += `${this.getRevocationText(template, options.language)}\n\n`;

    // Beneficiaries
    markdown += `## ${template.sections.beneficiaries}\n\n`;
    willData.beneficiaries.forEach((beneficiary, index) => {
      markdown += `${index + 1}. **${beneficiary.name}** (${beneficiary.relationship}) - **${beneficiary.percentage}%**\n`;
      if (beneficiary.conditions) {
        markdown += `   - ${this.getConditionsText(options.language)}: ${beneficiary.conditions}\n`;
      }
      markdown += `\n`;
    });

    // Assets
    if (
      willData.realEstate.length > 0 ||
      willData.bankAccounts.length > 0 ||
      willData.vehicles.length > 0
    ) {
      markdown += `## ${template.sections.specificBequests}\n\n`;

      if (willData.realEstate.length > 0) {
        markdown += `### ${this.getRealEstateHeadingText(options.language)}\n\n`;
        willData.realEstate.forEach((property, index) => {
          markdown += `${index + 1}. **${property.description}**\n`;
          markdown += `   - ${this.getAddressText(options.language)}: ${property.address}\n`;
          if (property.value) {
            markdown += `   - ${this.getValueText(options.language)}: ${property.value} ${this.getCurrency(options.jurisdiction)}\n`;
          }
          markdown += `\n`;
        });
      }

      if (willData.bankAccounts.length > 0) {
        markdown += `### ${this.getBankAccountsHeadingText(options.language)}\n\n`;
        willData.bankAccounts.forEach((account, index) => {
          markdown += `${index + 1}. **${account.bank}**\n`;
          markdown += `   - ${this.getAccountNumberText(options.language)}: ${account.accountNumber}\n`;
          markdown += `   - ${this.getTypeText(options.language)}: ${account.type}\n\n`;
        });
      }

      if (willData.vehicles.length > 0) {
        markdown += `### ${this.getVehiclesHeadingText(options.language)}\n\n`;
        willData.vehicles.forEach((vehicle, index) => {
          markdown += `${index + 1}. **${vehicle.make} ${vehicle.model}** (${vehicle.year})\n`;
          if (vehicle.vin) {
            markdown += `   - VIN: ${vehicle.vin}\n`;
          }
          if (vehicle.value) {
            markdown += `   - Hodnota: ${vehicle.value} ${this.getCurrency(options.jurisdiction)}\n`;
          }
          markdown += `\n`;
        });
      }
    }

    // Executor
    if (willData.primaryExecutor) {
      markdown += `## ${template.sections.executor}\n\n`;
      markdown += `**${this.getExecutorText(template, options.language)}:** ${willData.primaryExecutor.name}\n`;
      markdown += `- ${this.getAddressText(options.language)}: ${willData.primaryExecutor.address}\n`;
      markdown += `- ${this.getRelationshipText(options.language)}: ${willData.primaryExecutor.relationship}\n\n`;

      if (willData.backupExecutor) {
        markdown += `**${this.getBackupExecutorText(template, options.language)}:** ${willData.backupExecutor.name}\n`;
        markdown += `- ${this.getAddressText(options.language)}: ${willData.backupExecutor.address}\n`;
        markdown += `- ${this.getRelationshipText(options.language)}: ${willData.backupExecutor.relationship}\n\n`;
      }
    }

    // Guardianship
    if (
      willData.primaryGuardian &&
      willData.children.some(child => this.isMinor(child.birthDate))
    ) {
      markdown += `## ${template.sections.guardianship || 'Poručníctvo'}\n\n`;
      markdown += `**${this.getGuardianText(template, options.language)}:** ${willData.primaryGuardian.name}\n`;
      markdown += `- ${this.getAddressText(options.language)}: ${willData.primaryGuardian.address}\n`;
      markdown += `- ${this.getRelationshipText(options.language)}: ${willData.primaryGuardian.relationship}\n\n`;

      if (willData.backupGuardian) {
        markdown += `**${this.getBackupGuardianText(template, options.language)}:** ${willData.backupGuardian.name}\n`;
        markdown += `- ${this.getAddressText(options.language)}: ${willData.backupGuardian.address}\n`;
        markdown += `- ${this.getRelationshipText(options.language)}: ${willData.backupGuardian.relationship}\n\n`;
      }
    }

    // Final Wishes
    if (
      willData.funeralWishes ||
      willData.organDonation ||
      willData.personalMessages
    ) {
      markdown += `## ${template.sections.finalWishes}\n\n`;

      if (willData.funeralWishes) {
        markdown += `**${this.getFuneralWishesText(template, options.language)}:**\n${willData.funeralWishes}\n\n`;
      }

      if (willData.organDonation) {
        markdown += `**${this.getOrganDonationText(template, options.language)}\n\n`;
      }

      if (willData.personalMessages) {
        markdown += `**${this.getPersonalMessagesText(template, options.language)}:**\n${willData.personalMessages}\n\n`;
      }
    }

    // Signature
    markdown += `---\n\n## ${template.sections.signature}\n\n`;
    markdown += `${this.getInCityText(options.language)} ${willData.city} ${this.getDateText(options.language)} ${new Date().toLocaleDateString()}\n\n`;
    markdown += `_________________________________\n`;
    markdown += `${willData.testatorName}, ${this.getTestatorText(options.language)}\n\n`;

    // Witnesses
    if (willData.willType === 'witnessed') {
      markdown += `### ${template.sections.witnesses}\n\n`;
      markdown += `${this.getWitnessText(template, options.language)}\n\n`;
      markdown += `**${this.getWitnessLabelText(options.language)} 1:** _____________________ **${this.getDateText(options.language)}:** _________\n\n`;
      markdown += `**${this.getWitnessLabelText(options.language)} 2:** _____________________ **${this.getDateText(options.language)}:** _________\n\n`;
    }

    // Legal Notes
    if (template.legalNotes) {
      markdown += `---\n\n## ${template.legalNotes.title}\n\n`;
      template.legalNotes.notes.forEach((note, index) => {
        markdown += `${index + 1}. ${note}\n`;
      });
      markdown += `\n`;
    }

    // Legal Disclaimer
    markdown += `---\n\n## ${this.getLegalDisclaimerTitle(options.language)}\n\n`;
    markdown += `${template.legalDisclaimer}\n\n`;
    markdown += `*${template.footerText}*\n`;

    return new Blob([markdown], { type: 'text/markdown' });
  }

  /**
   * Initialize localized templates for all language-jurisdiction combinations
   */
  private initializeTemplates(): void {
    // SK-SK (Slovak interface, Slovak jurisdiction)
    this.templates.set('sk_SK', {
      documentTitle: 'ZÁVET',
      headerText: 'Posledná vôľa a závet podľa slovenského práva',
      sections: {
        personalInfo: 'I. PORUČITEĽ',
        revocation: 'II. ODVOLANIE PREDCHÁDZAJÚCICH ZÁVETOV',
        beneficiaries: 'III. USTANOVENIE DEDIČOV',
        forcedHeirs: 'IV. NEOPOMINUTEĽNÍ DEDIČIA',
        specificBequests: 'V. ODKAZY',
        executor: 'VI. VYKONÁVATEĽ ZÁVETU',
        guardianship: 'VII. PORUČNÍCTVO',
        finalWishes: 'VIII. POSLEDNÉ PRIANIA',
        residuary: 'IX. ZVYŠOK POZOSTALOSTI',
        signature: 'X. PODPIS',
        witnesses: 'SVEDKOVIA',
      },
      executionInstructions: {
        title: 'POKYNY NA VYKONANIE ZÁVETU',
        holographic: {
          title: 'Holografický závet',
          steps: [
            'Napíšte celý závet vlastnou rukou',
            'Podpíšte svojím menom a priezviskom',
            'Uvedte dátum a miesto vytvorenia',
            'Uložte na bezpečnom mieste',
          ],
          requirements: [
            'Musí byť celý napísaný vlastnou rukou',
            'Musí byť podpísaný',
            'Odporúča sa uviesť dátum',
            'Nepoužívajte písací stroj ani počítač',
          ],
          warnings: [
            'Nepísané alebo počítačové časti sú neplatné',
            'Nečitateľné písmo môže spôsobiť problémy',
            'Opravy môžu vzbudiť pochybnosti',
          ],
        },
        witnessed: {
          title: 'Závet pred svedkami',
          steps: [
            'Podpíšte závet v prítomnosti dvoch svedkov',
            'Svedkovia musia podpísať súčasne',
            'Vyhlásíte, že je to váš závet',
            'Svedkovia potvrdia podpisom',
          ],
          requirements: [
            'Dvaja svedkovia musia byť prítomní súčasne',
            'Svedkovia nesmú byť dedičmi ani príbuznými dedičov',
            'Svedkovia musia byť spôsobilí na právne úkony',
          ],
          warnings: [
            'Nesprávni svedkovia môžu spôsobiť neplatnosť',
            'Svedkovia musia chápať, čo podpisujú',
          ],
        },
        notarial: {
          title: 'Notársky závet',
          steps: [
            'Navštívte notára',
            'Predložte požiadavky na závet',
            'Notár spíše závet podľa vášho prejavu',
            'Podpíšte pred notárom',
          ],
          requirements: [
            'Musí byť spísaný notárom',
            'Podpis pred notárom',
            'Notárska pečať a podpis',
          ],
          warnings: [
            'Najdrahšia forma závetu',
            'Vyžaduje si osobnú prítomnosť',
          ],
        },
      },
      jurisdictionInfo: {
        title: 'INFORMÁCIE O JURISDIKCII SLOVENSKO',
        legalFramework: '§ 476-478 Občianskeho zákonníka SR',
        currency: 'EUR',
        minimumAge: '18 rokov',
        witnessRequirements: '2 svedkovia, nie dedičia ani príbuzní',
        holographicRequirements: 'Vlastnoručný podpis, odporúča sa dátum',
        notaryRequirements: 'Notárska forma poskytuje najvyššiu právnu istotu',
      },
      legalNotes: {
        title: 'PRÁVNE POUČENIE',
        notes: [
          'Závet musí byť napísaný v jazyku, ktorému poručiteľ rozumie.',
          'Neopominuteľní dedičia (potomkovia) majú právo na povinnú časť dedičstva - maloletí na celý dedičský podiel, plnoletí na polovicu.',
          'Závet môže zrušiť len poručiteľ, a to výslovným odvolaním alebo vyhotovením nového závetu.',
          'Pri holografickom závete sa odporúča uviesť dátum vyhotovenia pre určenie poradia závetov.',
          'Dedič môže dedičstvo odmietnuť, ale len ako celok, nie čiastočne.',
          'Ak poručiteľ neurčí podiely dedičov, dedia rovnakým dielom.',
          'Závet sa otvára a vyhlasuje na súde v dedičskom konaní.',
          'Notársky závet sa automaticky registruje v Notárskom centrálnom registri listín.',
          'Svedkovia závetu by mali byť plnoleté osoby spôsobilé na právne úkony.',
          'Manžel/manželka má zákonné dedičské právo aj bez uvedenia v závete.',
        ],
      },
      legalDisclaimer:
        'Tento závet bol vytvorený s pomocou umelej inteligencie. Odporúčame konzultovať s kvalifikovaným právnikom pred vykonaním závetu. Tento dokument nenahrádzá profesionálnu právnu pomoc.',
      footerText:
        'Vygenerované systémom LegacyGuard AI - Ochrana vašho odkazu pre budúce generácie',
    });

    // CS-SK (Czech interface, Slovak jurisdiction)
    this.templates.set('cs_SK', {
      documentTitle: 'ZÁVĚŤ',
      headerText: 'Poslední vůle a závěť podle slovenského práva',
      sections: {
        personalInfo: 'I. ZŮSTAVITEL',
        revocation: 'II. ODVOLÁNÍ PŘEDCHOZÍCH ZÁVĚTÍ',
        beneficiaries: 'III. USTANOVENÍ DĚDICŮ',
        forcedHeirs: 'IV. NEPOMINUTELNÍ DĚDICOVÉ',
        specificBequests: 'V. ODKAZY',
        executor: 'VI. VYKONAVATEL ZÁVĚTI',
        guardianship: 'VII. PORUČNICTVÍ',
        finalWishes: 'VIII. POSLEDNÍ PŘÁNÍ',
        residuary: 'IX. ZBYTEK POZŮSTALOSTI',
        signature: 'X. PODPIS',
        witnesses: 'SVĚDCI',
      },
      executionInstructions: {
        title: 'POKYNY K PROVEDENÍ ZÁVĚTI',
        holographic: {
          title: 'Holografní závěť',
          steps: [
            'Napište celou závěť vlastní rukou',
            'Podepište svým jménem a příjmením',
            'Uvedte datum a místo vytvoření',
            'Uložte na bezpečném místě',
          ],
          requirements: [
            'Musí být celá napsaná vlastní rukou',
            'Musí být podepsaná',
            'Doporučuje se uvést datum',
            'Nepoužívejte psací stroj ani počítač',
          ],
          warnings: [
            'Nepsané nebo počítačové části jsou neplatné',
            'Nečitelné písmo může způsobit problémy',
            'Opravy mohou vzbudit pochybnosti',
          ],
        },
        witnessed: {
          title: 'Závěť před svědky',
          steps: [
            'Podepište závěť v přítomnosti dvou svědků',
            'Svědci musí podepsat současně',
            'Prohlásíte, že je to vaše závěť',
            'Svědci potvrdí podpisem',
          ],
          requirements: [
            'Dva svědci musí být přítomni současně',
            'Svědci nesmí být dědici ani příbuzní dědiců',
            'Svědci musí být způsobilí k právním úkonům',
          ],
          warnings: [
            'Nesprávní svědci mohou způsobit neplatnost',
            'Svědci musí chápat, co podepisují',
          ],
        },
        notarial: {
          title: 'Notářská závěť',
          steps: [
            'Navštivte notáře',
            'Předložte požadavky na závěť',
            'Notář sepíše závěť podle vašeho projevu',
            'Podepište před notářem',
          ],
          requirements: [
            'Musí být sepsaná notářem',
            'Podpis před notářem',
            'Notářská pečeť a podpis',
          ],
          warnings: ['Nejdražší forma závěti', 'Vyžaduje osobní přítomnost'],
        },
      },
      jurisdictionInfo: {
        title: 'INFORMACE O JURISDIKCI SLOVENSKO',
        legalFramework: '§ 476-478 slovenského občanského zákoníku',
        currency: 'EUR',
        minimumAge: '18 let',
        witnessRequirements: '2 svědci, ne dědici ani příbuzní',
        holographicRequirements: 'Vlastnoruční podpis, doporučuje se datum',
        notaryRequirements: 'Notářská forma poskytuje nejvyšší právní jistotu',
      },
      legalNotes: {
        title: 'PRÁVNÍ POUČENÍ',
        notes: [
          'Závěť musí být napsána v jazyce, kterému zůstavitel rozumí.',
          'Nepominutelní dědici (potomci) mají právo na povinný podíl dědictví - nezletilí na celý dědický podíl, zletilí na polovinu.',
          'Závěť může zrušit pouze zůstavitel, a to výslovným odvoláním nebo vytvořením nové závěti.',
          'U holografní závěti se doporučuje uvést datum vytvoření pro určení pořadí závětí.',
          'Dědic může dědictví odmítnout, ale pouze jako celek, ne částečně.',
          'Pokud zůstavitel neurčí podíly dědiců, dědí rovným dílem.',
          'Závěť se otevírá a vyhlašuje u soudu v dědickém řízení.',
          'Notářská závěť se automaticky registruje v Notářském centrálním registru listin.',
          'Svědkové závěti by měli být plnoleté osoby způsobilé k právním úkonům.',
          'Manžel/manželka má zákonné dědické právo i bez uvedení v závěti.',
        ],
      },
      legalDisclaimer:
        'Tato závěť byla vytvořena s pomocí umělé inteligence. Doporučujeme konzultaci s kvalifikovaným právníkem před provedením závěti. Tento dokument nenahrazuje profesionální právní pomoc.',
      footerText:
        'Vygenerováno systémem LegacyGuard AI - Ochrana vašeho odkazu pro budoucí generace',
    });

    // EN-SK (English interface, Slovak jurisdiction)
    this.templates.set('en_SK', {
      documentTitle: 'LAST WILL AND TESTAMENT',
      headerText: 'Last Will and Testament under Slovak Law',
      sections: {
        personalInfo: 'I. TESTATOR',
        revocation: 'II. REVOCATION OF PREVIOUS WILLS',
        beneficiaries: 'III. APPOINTMENT OF HEIRS',
        forcedHeirs: 'IV. FORCED HEIRS',
        specificBequests: 'V. SPECIFIC BEQUESTS',
        executor: 'VI. EXECUTOR',
        guardianship: 'VII. GUARDIANSHIP',
        finalWishes: 'VIII. FINAL WISHES',
        residuary: 'IX. RESIDUARY ESTATE',
        signature: 'X. SIGNATURE',
        witnesses: 'WITNESSES',
      },
      executionInstructions: {
        title: 'WILL EXECUTION INSTRUCTIONS',
        holographic: {
          title: 'Holographic Will',
          steps: [
            'Write the entire will by hand',
            'Sign with your full name',
            'Include date and place of creation',
            'Store in a secure location',
          ],
          requirements: [
            'Must be entirely handwritten',
            'Must be signed',
            'Dating is recommended',
            'Do not use typewriter or computer',
          ],
          warnings: [
            'Typed or computer parts are invalid',
            'Illegible handwriting may cause problems',
            'Corrections may raise doubts',
          ],
        },
        witnessed: {
          title: 'Witnessed Will',
          steps: [
            'Sign will in presence of two witnesses',
            'Witnesses must sign simultaneously',
            'Declare that this is your will',
            'Witnesses confirm with their signatures',
          ],
          requirements: [
            'Two witnesses must be present simultaneously',
            'Witnesses cannot be heirs or relatives of heirs',
            'Witnesses must be legally competent',
          ],
          warnings: [
            'Improper witnesses may cause invalidity',
            'Witnesses must understand what they are signing',
          ],
        },
        notarial: {
          title: 'Notarial Will',
          steps: [
            'Visit a notary',
            'Present your will requirements',
            'Notary will draft will according to your statement',
            'Sign before the notary',
          ],
          requirements: [
            'Must be drafted by notary',
            'Signature before notary',
            'Notarial seal and signature',
          ],
          warnings: [
            'Most expensive form of will',
            'Requires personal presence',
          ],
        },
      },
      jurisdictionInfo: {
        title: 'SLOVAKIA JURISDICTION INFORMATION',
        legalFramework: '§ 476-478 of Slovak Civil Code',
        currency: 'EUR',
        minimumAge: '18 years',
        witnessRequirements: '2 witnesses, not heirs or relatives',
        holographicRequirements: 'Handwritten signature, dating recommended',
        notaryRequirements: 'Notarial form provides highest legal certainty',
      },
      legalNotes: {
        title: 'LEGAL GUIDANCE',
        notes: [
          'The will must be written in a language the testator understands.',
          'Forced heirs (descendants) have a right to a compulsory portion - minors to the full inheritance share, adults to half.',
          'Only the testator can revoke a will, either by express revocation or by creating a new will.',
          'For holographic wills, it is recommended to include the date to determine the order of wills.',
          'An heir can refuse an inheritance, but only in its entirety, not partially.',
          'If the testator does not specify heir shares, they inherit equally.',
          'The will is opened and announced in court during probate proceedings.',
          'Notarial wills are automatically registered in the Central Notarial Registry.',
          'Will witnesses should be adults with legal capacity.',
          'Spouses have statutory inheritance rights even without being named in the will.',
        ],
      },
      legalDisclaimer:
        'This will was created with artificial intelligence assistance. We recommend consultation with a qualified attorney before executing the will. This document does not replace professional legal advice.',
      footerText:
        'Generated by LegacyGuard AI system - Protecting your legacy for future generations',
    });

    // DE-SK (German interface, Slovak jurisdiction)
    this.templates.set('de_SK', {
      documentTitle: 'LETZTER WILLE UND TESTAMENT',
      headerText: 'Letzter Wille und Testament nach slowakischem Recht',
      sections: {
        personalInfo: 'I. ERBLASSER',
        revocation: 'II. WIDERRUF FRÜHERER TESTAMENTE',
        beneficiaries: 'III. ERBEINSETZUNG',
        forcedHeirs: 'IV. PFLICHTTEILSBERECHTIGTE',
        specificBequests: 'V. VERMÄCHTNISSE',
        executor: 'VI. TESTAMENTSVOLLSTRECKER',
        guardianship: 'VII. VORMUNDSCHAFT',
        finalWishes: 'VIII. LETZTE WÜNSCHE',
        residuary: 'IX. NACHLASSREST',
        signature: 'X. UNTERSCHRIFT',
        witnesses: 'ZEUGEN',
      },
      executionInstructions: {
        title: 'ANWEISUNGEN ZUR TESTAMENTSVOLLSTRECKUNG',
        holographic: {
          title: 'Eigenhändiges Testament',
          steps: [
            'Schreiben Sie das gesamte Testament handschriftlich',
            'Unterschreiben Sie mit vollem Namen',
            'Geben Sie Datum und Ort der Erstellung an',
            'Bewahren Sie es an sicherem Ort auf',
          ],
          requirements: [
            'Muss vollständig handschriftlich sein',
            'Muss unterschrieben sein',
            'Datierung wird empfohlen',
            'Verwenden Sie keine Schreibmaschine oder Computer',
          ],
          warnings: [
            'Getippte oder Computer-Teile sind ungültig',
            'Unleserliche Handschrift kann Probleme verursachen',
            'Korrekturen können Zweifel aufkommen lassen',
          ],
        },
        witnessed: {
          title: 'Testament vor Zeugen',
          steps: [
            'Unterschreiben Sie das Testament in Gegenwart zweier Zeugen',
            'Zeugen müssen gleichzeitig unterschreiben',
            'Erklären Sie, dass dies Ihr Testament ist',
            'Zeugen bestätigen mit ihren Unterschriften',
          ],
          requirements: [
            'Zwei Zeugen müssen gleichzeitig anwesend sein',
            'Zeugen dürfen nicht Erben oder Verwandte von Erben sein',
            'Zeugen müssen geschäftsfähig sein',
          ],
          warnings: [
            'Ungeeignete Zeugen können Ungültigkeit verursachen',
            'Zeugen müssen verstehen, was sie unterschreiben',
          ],
        },
        notarial: {
          title: 'Notarielles Testament',
          steps: [
            'Besuchen Sie einen Notar',
            'Legen Sie Ihre Testament-Anforderungen vor',
            'Notar wird Testament nach Ihrer Erklärung verfassen',
            'Unterschreiben Sie vor dem Notar',
          ],
          requirements: [
            'Muss vom Notar verfasst werden',
            'Unterschrift vor Notar',
            'Notarsiegel und -unterschrift',
          ],
          warnings: [
            'Teuerste Form des Testaments',
            'Erfordert persönliche Anwesenheit',
          ],
        },
      },
      jurisdictionInfo: {
        title: 'SLOWAKEI JURISDIKTION INFORMATION',
        legalFramework: '§ 476-478 des slowakischen BGB',
        currency: 'EUR',
        minimumAge: '18 Jahre',
        witnessRequirements: '2 Zeugen, nicht Erben oder Verwandte',
        holographicRequirements:
          'Handschriftliche Unterschrift, Datierung empfohlen',
        notaryRequirements: 'Notarielle Form bietet höchste Rechtssicherheit',
      },
      legalNotes: {
        title: 'RECHTLICHE HINWEISE',
        notes: [
          'Das Testament muss in einer Sprache verfasst sein, die der Erblasser versteht.',
          'Pflichtteilsberechtigte (Nachkommen) haben Anspruch auf einen Pflichtteil - Minderjährige auf den vollen Erbteil, Volljährige auf die Hälfte.',
          'Nur der Erblasser kann ein Testament widerrufen, entweder durch ausdrücklichen Widerruf oder durch Errichtung eines neuen Testaments.',
          'Bei eigenhändigen Testamenten wird empfohlen, das Datum anzugeben, um die Reihenfolge der Testamente zu bestimmen.',
          'Ein Erbe kann die Erbschaft ablehnen, aber nur als Ganzes, nicht teilweise.',
          'Wenn der Erblasser die Erbanteile nicht festlegt, erben sie zu gleichen Teilen.',
          'Das Testament wird im Nachlassverfahren vor Gericht eröffnet und verkündet.',
          'Notarielle Testamente werden automatisch im Zentralen Notariatsregister registriert.',
          'Testamentszeugen sollten volljährige, geschäftsfähige Personen sein.',
          'Ehepartner haben gesetzliche Erbrechte auch ohne Nennung im Testament.',
        ],
      },
      legalDisclaimer:
        'Dieses Testament wurde mit Hilfe künstlicher Intelligenz erstellt. Wir empfehlen eine Beratung durch einen qualifizierten Rechtsanwalt vor der Testamentsvollstreckung. Dieses Dokument ersetzt keine professionelle Rechtsberatung.',
      footerText:
        'Erstellt vom LegacyGuard AI System - Schutz Ihres Erbes für zukünftige Generationen',
    });

    // SK-CZ (Slovak interface, Czech jurisdiction)
    this.templates.set('sk_CZ', {
      documentTitle: 'ZÁVET',
      headerText: 'Posledná vôľa a závet podľa českého práva',
      sections: {
        personalInfo: 'I. PORUČITEĽ',
        revocation: 'II. ODVOLANIE PREDCHÁDZAJÚCICH ZÁVETOV',
        beneficiaries: 'III. USTANOVENIE DEDIČOV',
        forcedHeirs: 'IV. NEOPOMINUTEĽNÍ DEDIČIA',
        specificBequests: 'V. ODKAZY',
        executor: 'VI. VYKONÁVATEĽ ZÁVETU',
        guardianship: 'VII. PORUČNÍCTVO',
        finalWishes: 'VIII. POSLEDNÉ PRIANIA',
        residuary: 'IX. ZVYŠOK POZOSTALOSTI',
        signature: 'X. PODPIS',
        witnesses: 'SVEDKOVIA',
      },
      executionInstructions: {
        title: 'POKYNY NA VYKONANIE ZÁVETU',
        holographic: {
          title: 'Holografický závet',
          steps: [
            'Napíšte celý závet vlastnou rukou',
            'Podpíšte svojím menom a priezviskom',
            'POVINNE uvedte dátum vytvorenia',
            'Uložte na bezpečnom mieste',
          ],
          requirements: [
            'Musí byť celý napísaný vlastnou rukou',
            'Musí byť podpísaný',
            'POVINNÉ je uviesť dátum',
            'Nepoužívajte písací stroj ani počítač',
          ],
          warnings: [
            'Nepísané alebo počítačové časti sú neplatné',
            'Chýbajúci dátum spôsobí neplatnosť',
            'Nečitateľné písmo môže spôsobiť problémy',
          ],
        },
        witnessed: {
          title: 'Závet pred svedkami',
          steps: [
            'Podpíšte závet v prítomnosti dvoch svedkov',
            'Svedkovia musia podpísať súčasne',
            'Vyhlásíte, že je to váš závet',
            'Svedkovia potvrdia podpisom',
          ],
          requirements: [
            'Dvaja svedkovia musia byť prítomní súčasne',
            'Svedkovia nesmú byť dedičmi ani ich manželia/manželky',
            'Svedkovia musia byť spôsobilí na právne úkony',
          ],
          warnings: [
            'Manželia/manželky dedičov nemôžu byť svedkami',
            'Nesprávni svedkovia spôsobia neplatnosť',
          ],
        },
        notarial: {
          title: 'Notársky závet',
          steps: [
            'Navštívte notára',
            'Predložte požiadavky na závet',
            'Notár spíše závet podľa vášho prejavu',
            'Podpíšte pred notárom',
          ],
          requirements: [
            'Musí byť spísaný notárom',
            'Podpis pred notárom',
            'Notárska pečať a podpis',
          ],
          warnings: [
            'Najdrahšia forma závetu',
            'Vyžaduje si osobnú prítomnosť',
          ],
        },
      },
      jurisdictionInfo: {
        title: 'INFORMÁCIE O JURISDIKCII ČESKÁ REPUBLIKA',
        legalFramework: '§ 1540-1542 Občianskeho zákonníka ČR',
        currency: 'CZK',
        minimumAge: '15 rokov',
        witnessRequirements: '2 svedkovia, nie dedičia ani ich manželia',
        holographicRequirements: 'Vlastnoručný podpis, POVINNÝ dátum',
        notaryRequirements: 'Notárska forma poskytuje najvyššiu právnu istotu',
      },
      legalNotes: {
        title: 'PRÁVNE POUČENIE',
        notes: [
          'Závet môže vyhotoviť osoba staršia ako 15 rokov, ale len vo forme notarskej zápisnicy.',
          'Holografický závet MUSÍ obsahovať dátum vyhotovenia, inak je neplatný.',
          'Neopominuteľní dedičia (potomkovia) majú právo na povinný podiel - maloletí na 3/4, plnoletí na 1/4 podielu zo zákona.',
          'Manželia dedičov nemôžu byť svedkami závetu - spôsobí to neplatnosť.',
          'Závet môže obsahovať podmienky, príkazy alebo dobu, ale nesmú byť nemorné alebo nezakonné.',
          'Dedič môže dedičstvo odmietnuť len voči súdu v lehote 1 mesiaca od upovedomenia.',
          'Závet sa otvára a zisťuje na súde po smrti poručiteľa v dedičskom konaní.',
          'Ak je viac závetov, platný je posledný - podľa dátumu vyhotovenia.',
          'Poručiteľ môže kedykoľvek závet zmeniť alebo zrušiť.',
          'Notárska zápisnicia o závete sa uchováva v Notárskom centrálnom registri závetov.',
        ],
      },
      legalDisclaimer:
        'Tento závet bol vytvorený s pomocou umelej inteligencie. Odporúčame konzultovať s kvalifikovaným právnikom pred vykonaním závetu. Tento dokument nenahrádza profesionálnu právnu pomoc.',
      footerText:
        'Vygenerované systémom LegacyGuard AI - Ochrana vašho odkazu pre budúce generácie',
    });

    // CS-CZ (Czech interface, Czech jurisdiction)
    this.templates.set('cs_CZ', {
      documentTitle: 'ZÁVĚŤ',
      headerText: 'Poslední vůle a závěť podle českého práva',
      sections: {
        personalInfo: 'I. ZŮSTAVITEL',
        revocation: 'II. ODVOLÁNÍ PŘEDCHOZÍCH ZÁVĚTÍ',
        beneficiaries: 'III. USTANOVENÍ DĚDICŮ',
        forcedHeirs: 'IV. NEPOMINUTELNÍ DĚDICOVÉ',
        specificBequests: 'V. ODKAZY',
        executor: 'VI. VYKONAVATEL ZÁVĚTI',
        guardianship: 'VII. PORUČNICTVÍ',
        finalWishes: 'VIII. POSLEDNÍ PŘÁNÍ',
        residuary: 'IX. ZBYTEK POZŮSTALOSTI',
        signature: 'X. PODPIS',
        witnesses: 'SVĚDCI',
      },
      executionInstructions: {
        title: 'POKYNY K PROVEDENÍ ZÁVĚTI',
        holographic: {
          title: 'Holografní závěť',
          steps: [
            'Napište celou závěť vlastní rukou',
            'Podepište svým jménem a příjmením',
            'POVINNĚ uvedte datum vytvoření',
            'Uložte na bezpečném místě',
          ],
          requirements: [
            'Musí být celá napsaná vlastní rukou',
            'Musí být podepsaná',
            'POVINNÉ je uvést datum',
            'Nepoužívejte psací stroj ani počítač',
          ],
          warnings: [
            'Nepsané nebo počítačové části jsou neplatné',
            'Chybějící datum způsobí neplatnost',
            'Nečitelné písmo může způsobit problémy',
          ],
        },
        witnessed: {
          title: 'Závěť před svědky',
          steps: [
            'Podepište závěť v přítomnosti dvou svědků',
            'Svědci musí podepsat současně',
            'Prohlásíte, že je to vaše závěť',
            'Svědci potvrdí podpisem',
          ],
          requirements: [
            'Dva svědci musí být přítomni současně',
            'Svědci nesmí být dědici ani jejich manželé/manželky',
            'Svědci musí být způsobilí k právním úkonům',
          ],
          warnings: [
            'Manželé/manželky dědiců nemohou být svědci',
            'Nesprávní svědci způsobí neplatnost',
          ],
        },
        notarial: {
          title: 'Notářská závěť',
          steps: [
            'Navštivte notáře',
            'Předložte požadavky na závěť',
            'Notář sepíše závěť podle vašeho projevu',
            'Podepište před notářem',
          ],
          requirements: [
            'Musí být sepsaná notářem',
            'Podpis před notářem',
            'Notářská pečeť a podpis',
          ],
          warnings: ['Nejdražší forma závěti', 'Vyžaduje osobní přítomnost'],
        },
      },
      jurisdictionInfo: {
        title: 'INFORMACE O JURISDIKCI ČESKÁ REPUBLIKA',
        legalFramework: '§ 1540-1542 občanského zákoníku ČR',
        currency: 'CZK',
        minimumAge: '15 let',
        witnessRequirements: '2 svědci, ne dědici ani jejich manželé',
        holographicRequirements: 'Vlastnoruční podpis, POVINNÉ datum',
        notaryRequirements: 'Notářská forma poskytuje nejvyšší právní jistotu',
      },
      legalNotes: {
        title: 'PRÁVNÍ POUČENÍ',
        notes: [
          'Závěť může pořídit osoba starší 15 let, ale pouze ve formě notářského zápisu.',
          'Holografní závěť MUSÍ obsahovat datum pořízení, jinak je neplatná.',
          'Nepominutelní dědici (potomci) mají právo na povinný díl - nezletilí na 3/4, zletilí na 1/4 podílu ze zákona.',
          'Manželé dědiců nemohou být svědky závěti - způsobí to neplatnost.',
          'Závěť může obsahovat podmínky, příkazy nebo dobu, ale nesmí být nemravné nebo nezákonné.',
          'Dědic může dědictví odmítnout pouze vůči soudu ve lhůtě 1 měsíce od upovědomění.',
          'Závěť se otevírá a zjišťuje u soudu po smrti zůstavitele v dědickém řízení.',
          'Je-li více závětí, platná je poslední - podle data pořízení.',
          'Zůstavitel může kdykoliv závěť změnit nebo zrušit.',
          'Notářský zápis o závěti se uchovává v Centrální evidenci závětí.',
        ],
      },
      legalDisclaimer:
        'Tato závěť byla vytvořena s pomocí umělé inteligence. Doporučujeme konzultaci s kvalifikovaným právníkem před provedením závěti. Tento dokument nenahrazuje profesionální právní pomoc.',
      footerText:
        'Vygenerováno systémem LegacyGuard AI - Ochrana vašeho odkazu pro budoucí generace',
    });

    // EN-CZ (English interface, Czech jurisdiction)
    this.templates.set('en_CZ', {
      documentTitle: 'LAST WILL AND TESTAMENT',
      headerText: 'Last Will and Testament under Czech Law',
      sections: {
        personalInfo: 'I. TESTATOR',
        revocation: 'II. REVOCATION OF PREVIOUS WILLS',
        beneficiaries: 'III. APPOINTMENT OF HEIRS',
        forcedHeirs: 'IV. FORCED HEIRS',
        specificBequests: 'V. SPECIFIC BEQUESTS',
        executor: 'VI. EXECUTOR',
        guardianship: 'VII. GUARDIANSHIP',
        finalWishes: 'VIII. FINAL WISHES',
        residuary: 'IX. RESIDUARY ESTATE',
        signature: 'X. SIGNATURE',
        witnesses: 'WITNESSES',
      },
      executionInstructions: {
        title: 'WILL EXECUTION INSTRUCTIONS',
        holographic: {
          title: 'Holographic Will',
          steps: [
            'Write the entire will by hand',
            'Sign with your full name',
            'MANDATORY to include date of creation',
            'Store in a secure location',
          ],
          requirements: [
            'Must be entirely handwritten',
            'Must be signed',
            'Dating is MANDATORY',
            'Do not use typewriter or computer',
          ],
          warnings: [
            'Typed or computer parts are invalid',
            'Missing date causes invalidity',
            'Illegible handwriting may cause problems',
          ],
        },
        witnessed: {
          title: 'Witnessed Will',
          steps: [
            'Sign will in presence of two witnesses',
            'Witnesses must sign simultaneously',
            'Declare that this is your will',
            'Witnesses confirm with their signatures',
          ],
          requirements: [
            'Two witnesses must be present simultaneously',
            'Witnesses cannot be heirs or their spouses',
            'Witnesses must be legally competent',
          ],
          warnings: [
            'Spouses of heirs cannot be witnesses',
            'Improper witnesses cause invalidity',
          ],
        },
        notarial: {
          title: 'Notarial Will',
          steps: [
            'Visit a notary',
            'Present your will requirements',
            'Notary will draft will according to your statement',
            'Sign before the notary',
          ],
          requirements: [
            'Must be drafted by notary',
            'Signature before notary',
            'Notarial seal and signature',
          ],
          warnings: [
            'Most expensive form of will',
            'Requires personal presence',
          ],
        },
      },
      jurisdictionInfo: {
        title: 'CZECH REPUBLIC JURISDICTION INFORMATION',
        legalFramework: '§ 1540-1542 of Czech Civil Code',
        currency: 'CZK',
        minimumAge: '15 years',
        witnessRequirements: '2 witnesses, not heirs or their spouses',
        holographicRequirements: 'Handwritten signature, MANDATORY date',
        notaryRequirements: 'Notarial form provides highest legal certainty',
      },
      legalNotes: {
        title: 'LEGAL GUIDANCE',
        notes: [
          'A person over 15 years old can make a will, but only in the form of a notarial deed.',
          'A holographic will MUST contain the date of creation, otherwise it is invalid.',
          'Forced heirs (descendants) have a right to a compulsory share - minors to 3/4, adults to 1/4 of the statutory share.',
          'Spouses of heirs cannot be witnesses to the will - this causes invalidity.',
          'A will may contain conditions, instructions or time limits, but they must not be immoral or illegal.',
          'An heir can refuse an inheritance only through the court within 1 month of notification.',
          "The will is opened and verified in court after the testator's death in probate proceedings.",
          'If there are multiple wills, the last one is valid - according to the date of creation.',
          'The testator can change or revoke the will at any time.',
          'The notarial record of the will is stored in the Central Registry of Wills.',
        ],
      },
      legalDisclaimer:
        'This will was created with artificial intelligence assistance. We recommend consultation with a qualified attorney before executing the will. This document does not replace professional legal advice.',
      footerText:
        'Generated by LegacyGuard AI system - Protecting your legacy for future generations',
    });

    // DE-CZ (German interface, Czech jurisdiction)
    this.templates.set('de_CZ', {
      documentTitle: 'LETZTER WILLE UND TESTAMENT',
      headerText: 'Letzter Wille und Testament nach tschechischem Recht',
      sections: {
        personalInfo: 'I. ERBLASSER',
        revocation: 'II. WIDERRUF FRÜHERER TESTAMENTE',
        beneficiaries: 'III. ERBEINSETZUNG',
        forcedHeirs: 'IV. PFLICHTTEILSBERECHTIGTE',
        specificBequests: 'V. VERMÄCHTNISSE',
        executor: 'VI. TESTAMENTSVOLLSTRECKER',
        guardianship: 'VII. VORMUNDSCHAFT',
        finalWishes: 'VIII. LETZTE WÜNSCHE',
        residuary: 'IX. NACHLASSREST',
        signature: 'X. UNTERSCHRIFT',
        witnesses: 'ZEUGEN',
      },
      executionInstructions: {
        title: 'ANWEISUNGEN ZUR TESTAMENTSVOLLSTRECKUNG',
        holographic: {
          title: 'Eigenhändiges Testament',
          steps: [
            'Schreiben Sie das gesamte Testament handschriftlich',
            'Unterschreiben Sie mit vollem Namen',
            'PFLICHTMÄSSIG Datum der Erstellung angeben',
            'Bewahren Sie es an sicherem Ort auf',
          ],
          requirements: [
            'Muss vollständig handschriftlich sein',
            'Muss unterschrieben sein',
            'Datierung ist PFLICHT',
            'Verwenden Sie keine Schreibmaschine oder Computer',
          ],
          warnings: [
            'Getippte oder Computer-Teile sind ungültig',
            'Fehlendes Datum verursacht Ungültigkeit',
            'Unleserliche Handschrift kann Probleme verursachen',
          ],
        },
        witnessed: {
          title: 'Testament vor Zeugen',
          steps: [
            'Unterschreiben Sie das Testament in Gegenwart zweier Zeugen',
            'Zeugen müssen gleichzeitig unterschreiben',
            'Erklären Sie, dass dies Ihr Testament ist',
            'Zeugen bestätigen mit ihren Unterschriften',
          ],
          requirements: [
            'Zwei Zeugen müssen gleichzeitig anwesend sein',
            'Zeugen dürfen nicht Erben oder deren Ehepartner sein',
            'Zeugen müssen geschäftsfähig sein',
          ],
          warnings: [
            'Ehepartner von Erben können nicht Zeugen sein',
            'Ungeeignete Zeugen verursachen Ungültigkeit',
          ],
        },
        notarial: {
          title: 'Notarielles Testament',
          steps: [
            'Besuchen Sie einen Notar',
            'Legen Sie Ihre Testament-Anforderungen vor',
            'Notar wird Testament nach Ihrer Erklärung verfassen',
            'Unterschreiben Sie vor dem Notar',
          ],
          requirements: [
            'Muss vom Notar verfasst werden',
            'Unterschrift vor Notar',
            'Notarsiegel und -unterschrift',
          ],
          warnings: [
            'Teuerste Form des Testaments',
            'Erfordert persönliche Anwesenheit',
          ],
        },
      },
      jurisdictionInfo: {
        title: 'TSCHECHISCHE REPUBLIK JURISDIKTION INFORMATION',
        legalFramework: '§ 1540-1542 des tschechischen BGB',
        currency: 'CZK',
        minimumAge: '15 Jahre',
        witnessRequirements: '2 Zeugen, nicht Erben oder deren Ehegatten',
        holographicRequirements: 'Handschriftliche Unterschrift, PFLICHTDATUM',
        notaryRequirements: 'Notarielle Form bietet höchste Rechtssicherheit',
      },
      legalNotes: {
        title: 'RECHTLICHE HINWEISE',
        notes: [
          'Eine Person über 15 Jahre kann ein Testament errichten, aber nur in Form einer notariellen Urkunde.',
          'Ein eigenhändiges Testament MUSS das Errichtungsdatum enthalten, sonst ist es ungültig.',
          'Pflichtteilsberechtigte (Nachkommen) haben Anspruch auf einen Pflichtteil - Minderjährige auf 3/4, Volljährige auf 1/4 des gesetzlichen Anteils.',
          'Ehegatten von Erben können nicht Zeugen des Testaments sein - dies führt zur Ungültigkeit.',
          'Ein Testament kann Bedingungen, Anweisungen oder Fristen enthalten, sie dürfen aber nicht sittenwidrig oder rechtswidrig sein.',
          'Ein Erbe kann die Erbschaft nur über das Gericht innerhalb von 1 Monat nach Benachrichtigung ablehnen.',
          'Das Testament wird nach dem Tod des Erblassers im Nachlassverfahren vor Gericht eröffnet und geprüft.',
          'Bei mehreren Testamenten ist das letzte gültig - nach dem Errichtungsdatum.',
          'Der Erblasser kann das Testament jederzeit ändern oder widerrufen.',
          'Die notarielle Urkunde über das Testament wird im Zentralen Testamentsregister aufbewahrt.',
        ],
      },
      legalDisclaimer:
        'Dieses Testament wurde mit Hilfe künstlicher Intelligenz erstellt. Wir empfehlen eine Beratung durch einen qualifizierten Rechtsanwalt vor der Testamentsvollstreckung. Dieses Dokument ersetzt keine professionelle Rechtsberatung.',
      footerText:
        'Erstellt vom LegacyGuard AI System - Schutz Ihres Erbes für zukünftige Generationen',
    });
  }

  // Helper methods for localized text generation
  private getPersonalDeclaration(
    willData: WillExportData,
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const declarations = {
      sk: `Ja, ${willData.testatorName}, dátum narodenia ${willData.birthDate}, miesto narodenia ${willData.birthPlace}, trvale bytom ${willData.address}, občan ${willData.citizenship}, osobné číslo ${willData.personalId || 'neuvedené'}, činím týmto svoj závet. Vyhlasujem, že som pri plnej duševnej sile a spôsobilý na právne úkony.`,
      cs: `Já, ${willData.testatorName}, datum narození ${willData.birthDate}, místo narození ${willData.birthPlace}, trvale bydlem ${willData.address}, občan ${willData.citizenship}, osobní číslo ${willData.personalId || 'neuvedeno'}, činím tímto svou závěť. Prohlašuji, že jsem při plné duševní síle a způsobilý k právním úkonům.`,
      en: `I, ${willData.testatorName}, born ${willData.birthDate} in ${willData.birthPlace}, permanently residing at ${willData.address}, citizen of ${willData.citizenship}, personal ID ${willData.personalId || 'not specified'}, hereby make my will. I declare that I am of sound mind and legally competent.`,
      de: `Ich, ${willData.testatorName}, geboren am ${willData.birthDate} in ${willData.birthPlace}, wohnhaft ${willData.address}, Staatsangehöriger ${willData.citizenship}, Personalausweis ${willData.personalId || 'nicht angegeben'}, errichte hiermit mein Testament. Ich erkläre, dass ich bei vollem Bewusstsein und geschäftsfähig bin.`,
    };
    return declarations[language] || declarations.sk;
  }

  private getRevocationText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Týmto odvolávam všetky svoje skôr urobené závety a dodatky k nim.',
      cs: 'Tímto odvolávám všechny své dříve učiněné závěti a dodatky k nim.',
      en: 'I hereby revoke all wills and codicils previously made by me.',
      de: 'Hiermit widerrufe ich alle von mir früher errichteten Testamente und Zusätze dazu.',
    };
    return texts[language] || texts.sk;
  }

  private getRealEstateText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Nehnuteľnosť',
      cs: 'Nemovitost',
      en: 'Real Estate',
      de: 'Immobilie',
    };
    return texts[language] || texts.sk;
  }

  private getBankAccountText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Bankový účet',
      cs: 'Bankovní účet',
      en: 'Bank Account',
      de: 'Bankkonto',
    };
    return texts[language] || texts.sk;
  }

  private getVehicleText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Vozidlo',
      cs: 'Vozidlo',
      en: 'Vehicle',
      de: 'Fahrzeug',
    };
    return texts[language] || texts.sk;
  }

  private getExecutorText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Vykonávateľ závetu',
      cs: 'Vykonavatel závěti',
      en: 'Executor',
      de: 'Testamentsvollstrecker',
    };
    return texts[language] || texts.sk;
  }

  private getBackupExecutorText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Náhradný vykonávateľ',
      cs: 'Náhradní vykonavatel',
      en: 'Backup Executor',
      de: 'Ersatz-Testamentsvollstrecker',
    };
    return texts[language] || texts.sk;
  }

  private getGuardianText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Poručník',
      cs: 'Poručník',
      en: 'Guardian',
      de: 'Vormund',
    };
    return texts[language] || texts.sk;
  }

  private getBackupGuardianText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Náhradný poručník',
      cs: 'Náhradní poručník',
      en: 'Backup Guardian',
      de: 'Ersatz-Vormund',
    };
    return texts[language] || texts.sk;
  }

  private getFuneralWishesText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Pohrebné želania',
      cs: 'Pohřební přání',
      en: 'Funeral Wishes',
      de: 'Bestattungswünsche',
    };
    return texts[language] || texts.sk;
  }

  private getOrganDonationText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Súhlasím s darovaním svojich orgánov na transplantačné účely.',
      cs: 'Souhlasím s darováním svých orgánů pro transplantační účely.',
      en: 'I consent to the donation of my organs for transplantation purposes.',
      de: 'Ich stimme der Organspende für Transplantationszwecke zu.',
    };
    return texts[language] || texts.sk;
  }

  private getPersonalMessagesText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Osobný odkaz',
      cs: 'Osobní vzkaz',
      en: 'Personal Message',
      de: 'Persönliche Nachricht',
    };
    return texts[language] || texts.sk;
  }

  private getWitnessText(
    template: LocalizedTemplateContent,
    language: LanguageCode
  ): string {
    const texts = {
      sk: 'Tento závet bol podpísaný v našej prítomnosti a my ho na žiadosť poručiteľa podpisujeme ako svedkovia:',
      cs: 'Tato závěť byla podepsána v naší přítomnosti a my ji na žádost zůstavitele podpisujeme jako svědci:',
      en: "This will was signed in our presence and we sign it as witnesses at the testator's request:",
      de: 'Dieses Testament wurde in unserer Gegenwart unterzeichnet und wir unterzeichnen es auf Wunsch des Erblassers als Zeugen:',
    };
    return texts[language] || texts.sk;
  }

  private getJurisdictionName(jurisdiction: JurisdictionCode): string {
    return jurisdiction === 'SK' ? 'SLOVENSKO' : 'ČESKÁ REPUBLIKA';
  }

  private getCurrency(jurisdiction: JurisdictionCode): string {
    return jurisdiction === 'SK' ? 'EUR' : 'CZK';
  }

  private isMinor(birthDate: string): boolean {
    const birth = new Date(birthDate);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      return age - 1 < 18;
    }
    return age < 18;
  }

  private getInCityText(language: LanguageCode): string {
    const texts = {
      sk: 'V',
      cs: 'V',
      en: 'In',
      de: 'In',
    };
    return texts[language] || texts.sk;
  }

  private getDateText(language: LanguageCode): string {
    const texts = {
      sk: 'dňa',
      cs: 'dne',
      en: 'on',
      de: 'am',
    };
    return texts[language] || texts.sk;
  }

  private getTestatorText(language: LanguageCode): string {
    const texts = {
      sk: 'poručiteľ',
      cs: 'zůstavitel',
      en: 'testator',
      de: 'Erblasser',
    };
    return texts[language] || texts.sk;
  }

  private getWitnessLabelText(language: LanguageCode): string {
    const texts = {
      sk: 'Svedok',
      cs: 'Svědek',
      en: 'Witness',
      de: 'Zeuge',
    };
    return texts[language] || texts.sk;
  }

  private getLegalDisclaimerTitle(language: LanguageCode): string {
    const texts = {
      sk: 'Právne upozornenie',
      cs: 'Právní upozornění',
      en: 'Legal Disclaimer',
      de: 'Rechtlicher Hinweis',
    };
    return texts[language] || texts.sk;
  }

  private getConditionsText(language: LanguageCode): string {
    const texts = {
      sk: 'Podmienky',
      cs: 'Podmínky',
      en: 'Conditions',
      de: 'Bedingungen',
    };
    return texts[language] || texts.sk;
  }

  private getRealEstateHeadingText(language: LanguageCode): string {
    const texts = {
      sk: 'Nehnuteľnosti',
      cs: 'Nemovitosti',
      en: 'Real Estate',
      de: 'Immobilien',
    };
    return texts[language] || texts.sk;
  }

  private getAddressText(language: LanguageCode): string {
    const texts = {
      sk: 'Adresa',
      cs: 'Adresa',
      en: 'Address',
      de: 'Adresse',
    };
    return texts[language] || texts.sk;
  }

  private getValueText(language: LanguageCode): string {
    const texts = {
      sk: 'Hodnota',
      cs: 'Hodnota',
      en: 'Value',
      de: 'Wert',
    };
    return texts[language] || texts.sk;
  }

  private getBankAccountsHeadingText(language: LanguageCode): string {
    const texts = {
      sk: 'Bankové účty',
      cs: 'Bankovní účty',
      en: 'Bank Accounts',
      de: 'Bankkonten',
    };
    return texts[language] || texts.sk;
  }

  private getAccountNumberText(language: LanguageCode): string {
    const texts = {
      sk: 'Číslo účtu',
      cs: 'Číslo účtu',
      en: 'Account Number',
      de: 'Kontonummer',
    };
    return texts[language] || texts.sk;
  }

  private getVehiclesHeadingText(language: LanguageCode): string {
    const texts = {
      sk: 'Vozidlá',
      cs: 'Vozidla',
      en: 'Vehicles',
      de: 'Fahrzeuge',
    };
    return texts[language] || texts.sk;
  }

  private getRelationshipText(language: LanguageCode): string {
    const texts = {
      sk: 'Vzťah',
      cs: 'Vztah',
      en: 'Relationship',
      de: 'Beziehung',
    };
    return texts[language] || texts.sk;
  }

  private getTypeText(language: LanguageCode): string {
    const texts = {
      sk: 'Typ',
      cs: 'Typ',
      en: 'Type',
      de: 'Typ',
    };
    return texts[language] || texts.sk;
  }

  /**
   * Download the generated file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get appropriate filename for export
   */
  getFilename(willData: WillExportData, options: ExportOptions): string {
    const date = new Date().toISOString().split('T')[0];
    const extension = options.format === 'markdown' ? 'md' : options.format;
    return `Zavet-${willData.testatorName.replace(/\s+/g, '_')}-${options.language}-${options.jurisdiction}-${date}.${extension}`;
  }
}

// Export singleton instance
export const willExportService = new WillExportService();
export default willExportService;
