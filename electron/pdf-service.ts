/**
 * Electron PDF Service Implementation
 * Handles LaTeX compilation and PDF generation using node-latex-compiler
 */

import { app, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { compile } from 'node-latex-compiler';
import type {
  ResumeTemplate,
  PDFGenerationResult,
  Resume,
  WorkExperience,
  Education,
  Project,
} from './internal-types';
import { readTemplate, generateLatexDocument } from './templates/template-generator';

// Template metadata
const TEMPLATES: ResumeTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout with clean typography',
    style: 'classic',
    texPath: 'classic.tex',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with contemporary styling',
    style: 'modern',
    texPath: 'modern.tex',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean minimalist design with focus on content',
    style: 'minimal',
    texPath: 'minimal.tex',
  },
];

export class ElectronPDFService {
  private templatesPath: string;
  private outputDir: string;

  constructor() {
    // Templates are bundled with the app
    this.templatesPath = path.join(app.getAppPath(), 'electron', 'templates');

    // Output directory for generated PDFs
    this.outputDir = path.join(app.getPath('userData'), 'generated-pdfs');
  }

  async getTemplates(): Promise<ResumeTemplate[]> {
    return TEMPLATES;
  }

  getTemplatesPath(): string {
    return this.templatesPath;
  }

  async generatePDF(
    resume: Resume,
    templateId: string,
    userProfile?: { name?: string; email?: string }
  ): Promise<PDFGenerationResult> {
    // Find the template
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });

    // Read template file
    const templatePath = path.join(this.templatesPath, template.texPath);
    const templateContent = await readTemplate(templatePath);

    // Generate LaTeX content
    const latexContent = generateLatexDocument(
      templateContent,
      resume,
      template.style,
      userProfile?.name || 'Your Name',
      userProfile?.email || '',
      '', // phone
      '' // location
    );

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pdfFilename = `resume-${resume.id}-${templateId}-${timestamp}.pdf`;
    const pdfPath = path.join(this.outputDir, pdfFilename);

    // Compile LaTeX to PDF
    try {
      const result = await compile({
        tex: latexContent,
        outputDir: this.outputDir,
        outputFile: pdfPath,
        onStderr: (data) => {
          console.warn('LaTeX compilation warning:', data.trim());
        },
      });

      if (result.status === 'failed') {
        throw new Error(
          `LaTeX compilation failed: ${result.stderr || result.error || 'Unknown error'}`
        );
      }

      return {
        pdfPath: result.pdfPath || pdfPath,
        generatedAt: new Date().toISOString(),
        templateId,
      };
    } catch (error) {
      // Check if the error is about missing packages or compilation issues
      const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
      console.error('PDF generation error:', errorMessage);
      throw new Error(`Failed to generate PDF: ${errorMessage}`);
    }
  }

  async openPDF(pdfPath: string): Promise<void> {
    await shell.openPath(pdfPath);
  }
}
