import type { Resume } from '../../types';

export type ResumeSectionType = 'summary' | 'work-experience' | 'education' | 'skills' | 'projects';

export interface ResumeSection {
  id: ResumeSectionType | string;
  type: ResumeSectionType;
  title: string;
  subtitle?: string;
  count?: number;
}

/**
 * Helper function to generate resume sections from Resume data
 */
export function getResumeSections(resume: Resume): ResumeSection[] {
  const sections: ResumeSection[] = [];

  // Summary section
  if (resume.summary) {
    sections.push({
      id: 'summary',
      type: 'summary',
      title: 'Summary',
      count: 1,
    });
  }

  // Work Experience section
  sections.push({
    id: 'work-experience',
    type: 'work-experience',
    title: 'Work Experience',
    count: resume.workExperiences.length,
  });

  // Education section
  if (resume.education.length > 0) {
    sections.push({
      id: 'education',
      type: 'education',
      title: 'Education',
      count: resume.education.length,
    });
  }

  // Skills section
  if (resume.skills.length > 0) {
    sections.push({
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      count: resume.skills.length,
    });
  }

  // Projects section
  if (resume.projects.length > 0) {
    sections.push({
      id: 'projects',
      type: 'projects',
      title: 'Projects',
      count: resume.projects.length,
    });
  }

  return sections;
}
