/**
 * Electron Prep Sheet Service
 * Stub implementation - will be fully implemented in future phases
 */

import type { IPrepSheetService } from '../interfaces';
import type {
  PrepSheet,
  PrepSheetSectionId,
  PrepSheetSection,
  CompanyTemplate,
  ScrapedCompanyData,
  ParsedJobDescription,
  CreatePrepSheetInput,
} from '../../types';

/**
 * Stub implementation of IPrepSheetService
 * TODO: Implement full functionality in future phases:
 * - CRUD operations with IPC
 * - Section management
 * - Template library
 * - Scraper integration
 * - JD parsing
 */
export class ElectronPrepSheetService implements IPrepSheetService {
  async getPrepSheets(): Promise<PrepSheet[]> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.getPrepSheets: Not implemented');
    return [];
  }

  async getPrepSheet(id: string): Promise<PrepSheet | null> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.getPrepSheet: Not implemented', id);
    return null;
  }

  async createPrepSheet(input: CreatePrepSheetInput): Promise<PrepSheet> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.createPrepSheet: Not implemented', input);
    const now = new Date().toISOString();
    return {
      id: `sheet-${Date.now()}`,
      userId: 'stub-user',
      meta: {
        companyName: input.companyName,
        roleTitle: input.roleTitle,
        templateType: input.templateType,
      },
      sections: {},
      createdAt: now,
      updatedAt: now,
    };
  }

  async updatePrepSheet(id: string, updates: Partial<PrepSheet>): Promise<PrepSheet> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.updatePrepSheet: Not implemented', id, updates);
    throw new Error('ElectronPrepSheetService.updatePrepSheet: Not implemented');
  }

  async deletePrepSheet(id: string): Promise<void> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.deletePrepSheet: Not implemented', id);
  }

  async addSection(sheetId: string, sectionId: PrepSheetSectionId): Promise<PrepSheet> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.addSection: Not implemented', sheetId, sectionId);
    throw new Error('ElectronPrepSheetService.addSection: Not implemented');
  }

  async removeSection(sheetId: string, sectionId: PrepSheetSectionId): Promise<PrepSheet> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.removeSection: Not implemented', sheetId, sectionId);
    throw new Error('ElectronPrepSheetService.removeSection: Not implemented');
  }

  async updateSection(
    sheetId: string,
    sectionId: PrepSheetSectionId,
    _data: Partial<PrepSheetSection>
  ): Promise<PrepSheet> {
    // TODO: Implement IPC call to main process
    console.warn('ElectronPrepSheetService.updateSection: Not implemented', sheetId, sectionId);
    throw new Error('ElectronPrepSheetService.updateSection: Not implemented');
  }

  async getCompanyTemplates(): Promise<CompanyTemplate[]> {
    // TODO: Load from bundled data
    console.warn('ElectronPrepSheetService.getCompanyTemplates: Not implemented');
    return [];
  }

  async getCompanyTemplate(companyName: string): Promise<CompanyTemplate | null> {
    // TODO: Load from bundled data
    console.warn('ElectronPrepSheetService.getCompanyTemplate: Not implemented', companyName);
    return null;
  }

  async getAvailableCompanies(): Promise<string[]> {
    // TODO: Load from bundled data
    console.warn('ElectronPrepSheetService.getAvailableCompanies: Not implemented');
    return [];
  }

  async getScrapedCompanyData(companyName: string): Promise<ScrapedCompanyData | null> {
    // TODO: Load from bundled data or call scraper
    console.warn('ElectronPrepSheetService.getScrapedCompanyData: Not implemented', companyName);
    return null;
  }

  async refreshScrapedData(companyName: string): Promise<ScrapedCompanyData> {
    // TODO: Call scraper pipeline
    console.warn('ElectronPrepSheetService.refreshScrapedData: Not implemented', companyName);
    return {
      companyName,
      behavioralQuestions: [],
      technicalQuestions: [],
      lastScrapedAt: new Date().toISOString(),
      sources: [],
    };
  }

  async parseJobDescription(jdText: string): Promise<ParsedJobDescription> {
    // TODO: Call Gemini API via agent runtime
    console.warn('ElectronPrepSheetService.parseJobDescription: Not implemented', jdText);
    return {
      roleTitle: 'Unknown Role',
      responsibilities: [],
      requiredSkills: [],
    };
  }
}
