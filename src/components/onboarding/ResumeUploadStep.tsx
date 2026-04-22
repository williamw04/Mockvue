/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useUser, useNotifications } from '../../services';
import { WorkExperience, Education } from '../../types';

interface ResumeUploadStepProps {
  onComplete: () => void;
}

export default function ResumeUploadStep({ onComplete }: ResumeUploadStepProps) {
  const userService = useUser();
  const notifications = useNotifications();

  const [workExperiences, setWorkExperiences] = useState<Partial<WorkExperience>[]>([
    { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [''] },
  ]);
  const [education, setEducation] = useState<Partial<Education>[]>([
    { school: '', degree: '', field: '', startDate: '', endDate: '' },
  ]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const [file, setFile] = useState<{ path: string; name: string } | null>(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [rawText, setRawText] = useState<string | undefined>(undefined);
  const [resumePdfPath, setResumePdfPath] = useState<string | undefined>(undefined);
  const [coreStoryMatches, setCoreStoryMatches] = useState<any[]>([]);

  const handleFileSelect = async () => {
    if (!window.electronAPI) return;
    const result = await window.electronAPI.showOpenDialog({
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (!result.canceled && result.filePath) {
      setFile({ path: result.filePath, name: result.fileName || 'Selected File' });
      setParseStatus('idle');
    }
  };

  const handleParse = async () => {
    if (!file || !apiKey) return;
    setIsParsing(true);
    setParseStatus('idle');
    try {
      if (!window.electronAPI) throw new Error('Electron API unavailable');
      const response = await window.electronAPI.parseResume(file.path, apiKey);

      if (response.success && response.data) {
        const data = response.data;
        if (data.workExperience && data.workExperience.length > 0) {
          setWorkExperiences(data.workExperience);
        }
        if (data.education && data.education.length > 0) {
          setEducation(data.education);
        }
        if (data.skills) {
          setSkills(data.skills.join(', '));
        }
        if (data.projects) {
          setProjects(data.projects);
        }
        if (data.coreStoryMatches) {
          setCoreStoryMatches(data.coreStoryMatches);
        }

        setParseStatus('success');

        if (response.rawText) setRawText(response.rawText);
        if (response.pdfPath) setResumePdfPath(response.pdfPath);

        await notifications.showSuccess('Resume parsed! Review and edit the details below.');
      } else {
        throw new Error(response.error || 'Parsing failed');
      }
    } catch (error) {
      console.error(error);
      setParseStatus('error');
      await notifications.showError(error instanceof Error ? error.message : 'Parsing failed');
    } finally {
      setIsParsing(false);
    }
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        achievements: [''],
      },
    ]);
  };

  const updateWorkExperience = (
    index: number,
    field: keyof WorkExperience,
    value: string | string[]
  ) => {
    const updated = [...workExperiences];
    updated[index] = { ...updated[index], [field]: value };
    setWorkExperiences(updated);
  };

  const addAchievement = (expIndex: number) => {
    const updated = [...workExperiences];
    const achievements = updated[expIndex].achievements || [];
    updated[expIndex].achievements = [...achievements, ''];
    setWorkExperiences(updated);
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    const updated = [...workExperiences];
    const achievements = [...(updated[expIndex].achievements || [])];
    achievements[achIndex] = value;
    updated[expIndex].achievements = achievements;
    setWorkExperiences(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const validExperiences: WorkExperience[] = workExperiences
        .filter((exp) => exp.company && exp.position)
        .map((exp) => ({
          id: crypto.randomUUID(),
          company: exp.company || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate,
          description: exp.description || '',
          achievements: (exp.achievements || []).filter((a) => a.trim() !== ''),
        }));

      const validEducation: Education[] = education
        .filter((edu) => edu.school && edu.degree)
        .map((edu) => ({
          id: crypto.randomUUID(),
          school: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa,
        }));

      const skillsList = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');

      await userService.saveResume({
        workExperiences: validExperiences,
        education: validEducation,
        skills: skillsList,
        projects: projects,
        rawText: rawText,
        resumePdfPath: resumePdfPath,
        coreStoryMatches: coreStoryMatches,
      });

      await notifications.showSuccess('Resume saved successfully!');
      onComplete();
    } catch (error) {
      console.error('Error saving resume:', error);
      await notifications.showError('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-5xl tracking-tight mb-4">Add Your Resume</h1>
        <p className="text-ink-2 text-base">
          Upload a PDF to auto-fill, or enter your details manually below
        </p>
      </div>

      <div className="bg-card border border-rule p-8 mb-8">
        <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
          Quick Fill with AI
        </div>
        <h3 className="font-serif text-xl mb-6">Upload Your Resume</h3>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <button
              onClick={handleFileSelect}
              disabled={isParsing}
              className="w-full px-4 py-3 border-2 border-dashed border-rule text-ink-2 hover:border-accent-hi hover:text-accent-hi transition-colors text-sm font-medium bg-bg"
            >
              {file ? file.name : 'Choose PDF Resume...'}
            </button>
          </div>

          <div className="flex-1 w-full">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="w-full px-4 py-3 border bg-bg border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
            />
          </div>

          <button
            onClick={handleParse}
            disabled={!file || !apiKey || isParsing}
            className="bg-accent-hi text-white border-none px-6 py-3 text-[13px] font-semibold cursor-pointer disabled:bg-ink-3 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isParsing ? 'Parsing...' : 'Parse'}
          </button>
        </div>

        {parseStatus === 'success' && (
          <div className="mt-4 text-sm text-ink bg-accent-lo p-4 border border-rule">
            Resume parsed successfully! Review and edit the details below.
          </div>
        )}
        {parseStatus === 'error' && (
          <div className="mt-4 text-sm text-ink bg-bg p-4 border border-rule">
            Parsing failed. Please check your API key and try again, or enter details manually.
          </div>
        )}

        <p className="text-xs text-ink-3 mt-4">
          Your API key is sent only to Google for parsing and is not stored.
        </p>
      </div>

      <div className="bg-card border border-rule p-10">
        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-1">
                  Experience
                </div>
                <h3 className="font-serif text-xl">Work Experience</h3>
              </div>
              <button
                onClick={addWorkExperience}
                className="bg-transparent text-ink border border-rule px-4 py-2 text-[13px] cursor-pointer hover:bg-accent-lo"
              >
                + Add Experience
              </button>
            </div>

            {workExperiences.map((exp, expIndex) => (
              <div key={expIndex} className="p-6 mb-4 bg-bg border border-rule">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'company', e.target.value)}
                    className="px-4 py-2 border bg-card border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'position', e.target.value)}
                    className="px-4 py-2 border bg-card border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="month"
                    placeholder="Start Date"
                    value={exp.startDate || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'startDate', e.target.value)}
                    className="px-4 py-2 border bg-card border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
                  />
                  <input
                    type="month"
                    placeholder="End Date (leave empty if current)"
                    value={exp.endDate || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'endDate', e.target.value)}
                    className="px-4 py-2 border bg-card border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-ink-2">Key Achievements</label>
                  {(exp.achievements || ['']).map((achievement, achIndex) => (
                    <input
                      key={achIndex}
                      type="text"
                      placeholder="e.g., Led team of 5 engineers to deliver feature ahead of schedule"
                      value={achievement}
                      onChange={(e) => updateAchievement(expIndex, achIndex, e.target.value)}
                      className="w-full px-4 py-2 border bg-card border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
                    />
                  ))}
                  <button
                    onClick={() => addAchievement(expIndex)}
                    className="text-sm text-accent-hi font-medium"
                  >
                    + Add achievement
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-1">
              Skills
            </div>
            <h3 className="font-serif text-xl mb-4">Your Skills</h3>
            <textarea
              placeholder="Enter your skills separated by commas (e.g., Python, React, Leadership, Communication)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border bg-bg border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || workExperiences.every((exp) => !exp.company && !exp.position)}
              className="flex-1 bg-accent-hi text-white border-none px-6 py-3 text-[13px] font-semibold cursor-pointer disabled:bg-ink-3 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
