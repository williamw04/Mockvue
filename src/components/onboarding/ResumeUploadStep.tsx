import { useState } from 'react';
import { useTheme } from '../../services/ThemeContext';
import { useUser, useNotifications } from '../../services';
import { WorkExperience, Education } from '../../types';

interface ResumeUploadStepProps {
  onComplete: () => void;
}

export default function ResumeUploadStep({ onComplete }: ResumeUploadStepProps) {
  const { theme } = useTheme();
  const userService = useUser();
  const notifications = useNotifications();
  
  const [inputMethod, setInputMethod] = useState<'upload' | 'manual'>('manual');
  const [workExperiences, setWorkExperiences] = useState<Partial<WorkExperience>[]>([
    { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [''] }
  ]);
  const [education, setEducation] = useState<Partial<Education>[]>([
    { school: '', degree: '', field: '', startDate: '', endDate: '' }
  ]);
  const [skills, setSkills] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const addWorkExperience = () => {
    setWorkExperiences([...workExperiences, {
      company: '', position: '', startDate: '', endDate: '', description: '', achievements: ['']
    }]);
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
      // Filter out empty entries and add IDs
      const validExperiences: WorkExperience[] = workExperiences
        .filter(exp => exp.company && exp.position)
        .map(exp => ({
          id: crypto.randomUUID(),
          company: exp.company || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate,
          description: exp.description || '',
          achievements: (exp.achievements || []).filter(a => a.trim() !== ''),
        }));

      const validEducation: Education[] = education
        .filter(edu => edu.school && edu.degree)
        .map(edu => ({
          id: crypto.randomUUID(),
          school: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa,
        }));

      const skillsList = skills.split(',').map(s => s.trim()).filter(s => s !== '');

      await userService.saveResume({
        workExperiences: validExperiences,
        education: validEducation,
        skills: skillsList,
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
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Add Your Resume
        </h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Your experiences will help us create better interview responses
        </p>
      </div>

      <div className={`rounded-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        {/* Input Method Toggle */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setInputMethod('manual')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              inputMethod === 'manual'
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✏️ Manual Entry
          </button>
          <button
            onClick={() => setInputMethod('upload')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              inputMethod === 'upload'
                ? 'bg-blue-600 text-white'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📤 Upload Resume
          </button>
        </div>

        {inputMethod === 'upload' ? (
          <div className={`border-2 border-dashed rounded-lg p-12 text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
            <div className="text-4xl mb-4">📁</div>
            <p className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Upload your resume
            </p>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              PDF, DOC, or DOCX up to 10MB
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Choose File
            </button>
            <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Coming soon! For now, please use manual entry.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Work Experience */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Work Experience
                </h3>
                <button
                  onClick={addWorkExperience}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + Add Experience
                </button>
              </div>

              {workExperiences.map((exp, expIndex) => (
                <div key={expIndex} className={`p-6 rounded-lg mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Company *"
                      value={exp.company || ''}
                      onChange={(e) => updateWorkExperience(expIndex, 'company', e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <input
                      type="text"
                      placeholder="Position *"
                      value={exp.position || ''}
                      onChange={(e) => updateWorkExperience(expIndex, 'position', e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="month"
                      placeholder="Start Date"
                      value={exp.startDate || ''}
                      onChange={(e) => updateWorkExperience(expIndex, 'startDate', e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                    <input
                      type="month"
                      placeholder="End Date (leave empty if current)"
                      value={exp.endDate || ''}
                      onChange={(e) => updateWorkExperience(expIndex, 'endDate', e.target.value)}
                      className={`px-4 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-600 border-gray-500 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>

                  <textarea
                    placeholder="Brief description of your role"
                    value={exp.description || ''}
                    onChange={(e) => updateWorkExperience(expIndex, 'description', e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border mb-4 ${
                      theme === 'dark'
                        ? 'bg-gray-600 border-gray-500 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />

                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Key Achievements
                    </label>
                    {(exp.achievements || ['']).map((achievement, achIndex) => (
                      <input
                        key={achIndex}
                        type="text"
                        placeholder="e.g., Led team of 5 engineers to deliver feature ahead of schedule"
                        value={achievement}
                        onChange={(e) => updateAchievement(expIndex, achIndex, e.target.value)}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                    ))}
                    <button
                      onClick={() => addAchievement(expIndex)}
                      className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      + Add achievement
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Skills
              </h3>
              <textarea
                placeholder="Enter your skills separated by commas (e.g., Python, React, Leadership, Communication)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={isSaving || workExperiences.every(exp => !exp.company && !exp.position)}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                {isSaving ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
