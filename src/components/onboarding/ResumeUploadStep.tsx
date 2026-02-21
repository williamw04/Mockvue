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
    { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [''] }
  ]);
  const [education, setEducation] = useState<Partial<Education>[]>([
    { school: '', degree: '', field: '', startDate: '', endDate: '' }
  ]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Parsing State
  const [file, setFile] = useState<{ path: string; name: string } | null>(null);
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [rawText, setRawText] = useState<string | undefined>(undefined);
  const [resumePdfPath, setResumePdfPath] = useState<string | undefined>(undefined);

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
        // Populate state with parsed data
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

        setParseStatus('success');

        // Store raw text and PDF path from response
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
      { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [''] },
    ]);
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: string | string[]) => {
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
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📄</div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Add Your Resume</h1>
        <p className="text-lg text-gray-600">
          Upload a PDF to auto-fill, or enter your details manually below
        </p>
      </div>

      {/* Upload Section — always visible at top */}
      <div className="rounded-2xl p-6 mb-6 bg-surface shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Fill with AI</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* File selector */}
          <div className="flex-1 w-full">
            <button
              onClick={handleFileSelect}
              disabled={isParsing}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              {file ? `📄 ${file.name}` : '📁 Choose PDF Resume...'}
            </button>
          </div>

          {/* API Key */}
          <div className="flex-1 w-full">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API Key"
              className="w-full px-4 py-3 border rounded-lg text-sm bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Parse button */}
          <button
            onClick={handleParse}
            disabled={!file || !apiKey || isParsing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap text-sm"
          >
            {isParsing ? '⏳ Parsing...' : '🚀 Parse'}
          </button>
        </div>

        {/* Status messages */}
        {parseStatus === 'success' && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
            ✅ Resume parsed successfully! Review and edit the details below.
          </div>
        )}
        {parseStatus === 'error' && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            ❌ Parsing failed. Please check your API key and try again, or enter details manually.
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Your API key is sent only to Google for parsing and is not stored.
        </p>
      </div>

      {/* Manual Entry Section — always visible */}
      <div className="rounded-2xl p-8 bg-surface shadow-xl">
        <div className="space-y-8">
          {/* Work Experience */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">💼 Work Experience</h3>
              <button
                onClick={addWorkExperience}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Add Experience
              </button>
            </div>

            {workExperiences.map((exp, expIndex) => (
              <div key={expIndex} className="p-6 rounded-lg mb-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Company *"
                    value={exp.company || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'company', e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="text"
                    placeholder="Position *"
                    value={exp.position || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'position', e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="month"
                    placeholder="Start Date"
                    value={exp.startDate || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'startDate', e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <input
                    type="month"
                    placeholder="End Date (leave empty if current)"
                    value={exp.endDate || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'endDate', e.target.value)}
                    className="px-4 py-2 rounded-lg border bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <textarea
                  placeholder="Brief description of your role"
                  value={exp.description || ''}
                  onChange={(e) => updateWorkExperience(expIndex, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border mb-4 bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Key Achievements</label>
                  {(exp.achievements || ['']).map((achievement, achIndex) => (
                    <input
                      key={achIndex}
                      type="text"
                      placeholder="e.g., Led team of 5 engineers to deliver feature ahead of schedule"
                      value={achievement}
                      onChange={(e) => updateAchievement(expIndex, achIndex, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  ))}
                  <button
                    onClick={() => addAchievement(expIndex)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add achievement
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">🛠️ Skills</h3>
            <textarea
              placeholder="Enter your skills separated by commas (e.g., Python, React, Leadership, Communication)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border bg-surface border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving || workExperiences.every((exp) => !exp.company && !exp.position)}
              className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              {isSaving ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
