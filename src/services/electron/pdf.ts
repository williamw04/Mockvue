/**
 * Electron PDF Service (Frontend wrapper)
 * Calls IPC handlers exposed by the main process
 */

import type { IPDFService } from '../interfaces';
import type { ResumeTemplate, PDFGenerationResult, Resume } from '../../types';

export class ElectronPDFService implements IPDFService {
  async getTemplates(): Promise<ResumeTemplate[]> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.pdfGetTemplates();
  }

  async generatePDF(
    resume: Resume,
    templateId: string,
    userProfile?: { name?: string; email?: string }
  ): Promise<PDFGenerationResult> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.pdfGenerate(resume, templateId, userProfile);
  }

  async openPDF(pdfPath: string): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('Electron API not available');
    }
    return window.electronAPI.pdfOpen(pdfPath);
  }

  getTemplatesPath(): string {
    // Templates path is in electron directory
    return 'electron/templates';
  }
}
