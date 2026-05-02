import { useState, useCallback } from 'react';
import { Plus, Trash2, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorkExperience } from '../../types';

interface WorkExperienceEditorProps {
  experiences: WorkExperience[];
  onUpdate: (newExperiences: WorkExperience[]) => void;
}

export function WorkExperienceEditor({ experiences, onUpdate }: WorkExperienceEditorProps) {
  const [localExperiences, setLocalExperiences] = useState<WorkExperience[]>(experiences);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(
    (newExp: WorkExperience[]) => {
      setHasChanges(JSON.stringify(newExp) !== JSON.stringify(experiences));
    },
    [experiences]
  );

  const handleUpdateExperience = useCallback(
    (id: string, updates: Partial<WorkExperience>) => {
      const newExp = localExperiences.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp));
      setLocalExperiences(newExp);
      checkForChanges(newExp);
    },
    [localExperiences, checkForChanges]
  );

  const handleAddExperience = useCallback(() => {
    const newExp: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: new Date().toISOString().slice(0, 7),
      endDate: undefined,
      description: '',
      achievements: [''],
    };
    const updated = [...localExperiences, newExp];
    setLocalExperiences(updated);
    setExpandedIds((prev) => new Set(prev).add(newExp.id));
    checkForChanges(updated);
  }, [localExperiences, checkForChanges]);

  const handleDeleteExperience = useCallback(
    (id: string) => {
      const updated = localExperiences.filter((exp) => exp.id !== id);
      setLocalExperiences(updated);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      checkForChanges(updated);
    },
    [localExperiences, checkForChanges]
  );

  const handleAddAchievement = useCallback(
    (expId: string) => {
      const updated = localExperiences.map((exp) =>
        exp.id === expId ? { ...exp, achievements: [...exp.achievements, ''] } : exp
      );
      setLocalExperiences(updated);
      checkForChanges(updated);
    },
    [localExperiences, checkForChanges]
  );

  const handleUpdateAchievement = useCallback(
    (expId: string, index: number, value: string) => {
      const updated = localExperiences.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              achievements: exp.achievements.map((a, i) => (i === index ? value : a)),
            }
          : exp
      );
      setLocalExperiences(updated);
      checkForChanges(updated);
    },
    [localExperiences, checkForChanges]
  );

  const handleDeleteAchievement = useCallback(
    (expId: string, index: number) => {
      const updated = localExperiences.map((exp) =>
        exp.id === expId
          ? { ...exp, achievements: exp.achievements.filter((_, i) => i !== index) }
          : exp
      );
      setLocalExperiences(updated);
      checkForChanges(updated);
    },
    [localExperiences, checkForChanges]
  );

  const handleSave = useCallback(() => {
    onUpdate(localExperiences);
    setHasChanges(false);
  }, [localExperiences, onUpdate]);

  const handleReset = useCallback(() => {
    setLocalExperiences(experiences);
    setHasChanges(false);
  }, [experiences]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink">Work Experience</h2>
          <p className="text-sm text-ink-3 mt-1">{localExperiences.length} positions</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink px-3 py-1.5 border border-rule hover:border-ink-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-sm bg-accent-hi text-white px-3 py-1.5 hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                Save All
              </button>
            </>
          )}
          <button
            onClick={handleAddExperience}
            className="flex items-center gap-1.5 text-sm border border-rule px-3 py-1.5 hover:bg-bg"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        </div>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {localExperiences.map((exp) => (
          <div key={exp.id} className="bg-card border border-rule">
            {/* Experience Header */}
            <div
              onClick={() => toggleExpanded(exp.id)}
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-bg"
            >
              <div className="flex-1">
                <div className="font-medium text-ink">{exp.position || 'Untitled Position'}</div>
                <div className="text-sm text-ink-3 mt-1">
                  {exp.company || 'Company name'} · {exp.startDate.slice(0, 7)}
                  {exp.endDate ? ` – ${exp.endDate.slice(0, 7)}` : ' – Present'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-ink-3">
                  {exp.achievements.length} bullets
                </span>
                {expandedIds.has(exp.id) ? (
                  <ChevronUp className="w-4 h-4 text-ink-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-3" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIds.has(exp.id) && (
              <div className="px-5 py-4 border-t border-rule space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleUpdateExperience(exp.id, { position: e.target.value })}
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Start Date
                    </label>
                    <input
                      type="month"
                      value={exp.startDate.slice(0, 7)}
                      onChange={(e) =>
                        handleUpdateExperience(exp.id, { startDate: e.target.value + '-01' })
                      }
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      End Date
                    </label>
                    <input
                      type="month"
                      value={exp.endDate?.slice(0, 7) || ''}
                      onChange={(e) =>
                        handleUpdateExperience(exp.id, {
                          endDate: e.target.value ? e.target.value + '-01' : undefined,
                        })
                      }
                      placeholder="Leave empty for current"
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    Role Description
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, { description: e.target.value })
                    }
                    placeholder="Brief description of your role and responsibilities..."
                    className="w-full min-h-[80px] bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink resize-y"
                  />
                </div>

                {/* Achievements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
                      Achievement Bullets
                    </label>
                    <button
                      onClick={() => handleAddAchievement(exp.id)}
                      className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
                    >
                      <Plus className="w-3 h-3" />
                      Add Bullet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {exp.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="font-mono text-xs text-ink-3 pt-2">{index + 1}.</span>
                        <textarea
                          value={achievement}
                          onChange={(e) => handleUpdateAchievement(exp.id, index, e.target.value)}
                          placeholder="Describe an achievement with metrics when possible..."
                          className="flex-1 min-h-[40px] bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink resize-none"
                        />
                        <button
                          onClick={() => handleDeleteAchievement(exp.id, index)}
                          className="p-1 text-ink-3 hover:text-red-600"
                          disabled={exp.achievements.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete Experience */}
                <div className="pt-4 border-t border-rule">
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Position
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {localExperiences.length === 0 && (
        <div className="bg-card border border-rule p-10 text-center">
          <p className="text-sm text-ink-3">No work experience entries yet.</p>
          <button
            onClick={handleAddExperience}
            className="mt-4 flex items-center gap-1.5 text-sm bg-accent-hi text-white px-4 py-2 hover:opacity-90 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Your First Position
          </button>
        </div>
      )}
    </div>
  );
}
