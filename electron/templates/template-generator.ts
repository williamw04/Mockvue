/**
 * Template Generator - Converts Resume data to LaTeX content
 * Injects resume sections into LaTeX templates using placeholder substitution
 */

import type { Resume, WorkExperience, Education, Project } from '../internal-types';

// LaTeX escape function - handle special characters
export function escapeLatex(text: string): string {
  const replacements: Record<string, string> = {
    '&': '\\&',
    '%': '\\%',
    $: '\\$',
    '#': '\\#',
    _: '\\_',
    '{': '\\{',
    '}': '\\}',
    '~': '\\textasciitilde',
    '^': '\\textasciicircum',
    '\\': '\\textbackslash',
    '<': '\\textless',
    '>': '\\textgreater',
  };

  return text.replace(/[&%$#_{}~^\\<>]/g, (char) => replacements[char] || char);
}

// Generate work experience entries
export function generateWorkEntries(
  experiences: WorkExperience[],
  style: 'classic' | 'modern' | 'minimal'
): string {
  return experiences
    .map((exp) => {
      const startDate = formatDate(exp.startDate);
      const endDate = exp.endDate ? formatDate(exp.endDate) : 'Present';
      const company = escapeLatex(exp.company);
      const position = escapeLatex(exp.position);
      const description = escapeLatex(exp.description);
      const achievements = exp.achievements.map((a) => escapeLatex(a));

      if (style === 'minimal') {
        return `
\\subheading{${position} at ${company}}{${startDate} -- ${endDate}}
\\vspace{0.2em}
${description}
\\begin{itemize}[leftmargin=*,nosep]
${achievements.map((a) => `\\item ${a}`).join('\n')}
\\end{itemize}
`;
      } else if (style === 'modern') {
        return `
\\textbf{${position}} \\hfill ${startDate} -- ${endDate}
\\textit{${company}}
\\vspace{0.3em}
\\begin{itemize}[leftmargin=*,nosep]
${achievements.map((a) => `\\item ${a}`).join('\n')}
\\end{itemize}
`;
      } else {
        // classic
        return `
\\textbf{${position}}, ${company} \\hfill ${startDate} -- ${endDate}
\\vspace{0.3em}
\\begin{itemize}[leftmargin=*]
${achievements.map((a) => `\\item ${a}`).join('\n')}
\\end{itemize}
`;
      }
    })
    .join('\n\n');
}

// Generate education entries
export function generateEducationEntries(
  education: Education[],
  style: 'classic' | 'modern' | 'minimal'
): string {
  return education
    .map((ed) => {
      const school = escapeLatex(ed.school);
      const degree = escapeLatex(ed.degree);
      const field = escapeLatex(ed.field);
      const startDate = ed.startDate.slice(0, 7);
      const endDate = ed.endDate.slice(0, 7);
      const gpa = ed.gpa ? `GPA: ${ed.gpa}` : '';

      if (style === 'minimal') {
        return `
\\subheading{${degree} in ${field}, ${school}}{${endDate.slice(0, 4)}}
${gpa ? `\\textit{${gpa}}` : ''}
`;
      } else if (style === 'modern') {
        return `
\\textbf{${degree} in ${field}} \\hfill ${endDate.slice(0, 4)}
\\textit{${school}} ${gpa ? `\\quad ${gpa}` : ''}
`;
      } else {
        // classic
        return `
\\textbf{${degree} in ${field}}, ${school} \\hfill ${endDate.slice(0, 4)}
${gpa ? `GPA: ${gpa}` : ''}
`;
      }
    })
    .join('\n\n');
}

// Generate skills list
export function generateSkillsList(
  skills: string[],
  style: 'classic' | 'modern' | 'minimal'
): string {
  const escapedSkills = skills.map((s) => escapeLatex(s));

  if (style === 'minimal') {
    return escapedSkills.join(', ');
  } else if (style === 'modern') {
    // Group skills by category for modern template
    return `\\begin{itemize}[leftmargin=*,nosep]
\\item ${escapedSkills.join(', ')}
\\end{itemize}`;
  } else {
    // classic
    return `\\begin{itemize}[leftmargin=*]
\\item ${escapedSkills.join(', ')}
\\end{itemize}`;
  }
}

// Generate project entries
export function generateProjectEntries(
  projects: Project[],
  style: 'classic' | 'modern' | 'minimal'
): string {
  return projects
    .map((proj) => {
      const title = escapeLatex(proj.title);
      const description = escapeLatex(proj.description);
      const role = escapeLatex(proj.role);
      const technologies = proj.technologies.map((t) => escapeLatex(t)).join(', ');
      const url = proj.url ? `\\href{${proj.url}}{View Project}` : '';

      if (style === 'minimal') {
        return `
\\subheading{${title}}{${role}}
${description}
\\textit{Technologies: ${technologies}} ${url ? `\\quad ${url}` : ''}
`;
      } else if (style === 'modern') {
        return `
\\textbf{${title}} ${url ? `\\quad ${url}` : ''} \\hfill ${role}
\\vspace{0.3em}
${description}
\\textit{Technologies: ${technologies}}
`;
      } else {
        // classic
        return `
\\textbf{${title}} \\hfill ${role}
${description}
\\textit{Technologies: ${technologies}} ${url ? `\\quad ${url}` : ''}
`;
      }
    })
    .join('\n\n');
}

// Format date string
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
}

// Generate complete LaTeX document from template and resume
export function generateLatexDocument(
  templateContent: string,
  resume: Resume,
  style: 'classic' | 'modern' | 'minimal',
  userName: string = 'Your Name',
  userEmail: string = '',
  userPhone: string = '',
  userLocation: string = ''
): string {
  let result = templateContent;

  // Replace header placeholders
  result = result.replace('{{USER_NAME}}', escapeLatex(userName));
  result = result.replace('{{USER_EMAIL}}', escapeLatex(userEmail));
  result = result.replace('{{USER_PHONE}}', escapeLatex(userPhone));
  result = result.replace('{{USER_LOCATION}}', escapeLatex(userLocation));

  // Replace summary (conditionally)
  if (resume.summary) {
    result = result.replace('{{SUMMARY_TEXT}}', escapeLatex(resume.summary));
    // Remove conditional markers if present
    result = result.replace(/%% IF_HAS_SUMMARY %%/g, '');
    result = result.replace(/%% END_IF_SUMMARY %%/g, '');
  } else {
    // Remove summary section if no summary
    result = result.replace(/%% SUMMARY_SECTION %%.*?%% END_SUMMARY_SECTION %%[\s\S]*?/g, '');
    result = result.replace('{{SUMMARY_TEXT}}', '');
    result = result.replace(/\\section\*\{Summary\}\n/g, '');
  }

  // Replace work experience
  const workEntries = generateWorkEntries(resume.workExperiences, style);
  result = result.replace('{{WORK_ENTRIES}}', workEntries);

  // Replace education
  const educationEntries = generateEducationEntries(resume.education, style);
  result = result.replace('{{EDUCATION_ENTRIES}}', educationEntries);

  // Replace skills
  const skillsList = generateSkillsList(resume.skills, style);
  result = result.replace('{{SKILLS_LIST}}', skillsList);

  // Replace projects (conditionally)
  if (resume.projects.length > 0) {
    const projectEntries = generateProjectEntries(resume.projects, style);
    result = result.replace('{{PROJECT_ENTRIES}}', projectEntries);
  } else {
    // Remove projects section if no projects
    result = result.replace(/\\section\*\{Projects\}\n/g, '');
    result = result.replace('{{PROJECT_ENTRIES}}', '');
  }

  // Remove any remaining placeholder markers
  result = result.replace(/%% \w+_SECTION %%/g, '');
  result = result.replace(/%% IF_HAS_\w+ %%/g, '');
  result = result.replace(/%% END_IF_\w+ %%/g, '');

  return result;
}

// Export function to read template file
export async function readTemplate(templatePath: string): Promise<string> {
  const fs = await import('fs/promises');
  return fs.readFile(templatePath, 'utf-8');
}
