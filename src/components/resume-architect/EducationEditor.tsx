import { useState, useCallback } from 'react';
import { Plus, Trash2, Save, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import type { Education } from '../../types';

interface EducationEditorProps {
  education: Education[];
  onUpdate: (newEducation: Education[]) => void;
}

export function EducationEditor({ education, onUpdate }: EducationEditorProps) {
  const [localEducation, setLocalEducation] = useState<Education[]>(education);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(
    (newEd: Education[]) => {
      setHasChanges(JSON.stringify(newEd) !== JSON.stringify(education));
    },
    [education]
  );

  const handleUpdateEducation = useCallback(
    (id: string, updates: Partial<Education>) => {
      const newEd = localEducation.map((ed) => (ed.id === id ? { ...ed, ...updates } : ed));
      setLocalEducation(newEd);
      checkForChanges(newEd);
    },
    [localEducation, checkForChanges]
  );

  const handleAddEducation = useCallback(() => {
    const newEd: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      field: '',
      startDate: new Date().toISOString().slice(0, 7),
      endDate: new Date().toISOString().slice(0, 7),
      gpa: undefined,
    };
    const updated = [...localEducation, newEd];
    setLocalEducation(updated);
    setExpandedIds((prev) => new Set(prev).add(newEd.id));
    checkForChanges(updated);
  }, [localEducation, checkForChanges]);

  const handleDeleteEducation = useCallback(
    (id: string) => {
      const updated = localEducation.filter((ed) => ed.id !== id);
      setLocalEducation(updated);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      checkForChanges(updated);
    },
    [localEducation, checkForChanges]
  );

  const handleSave = useCallback(() => {
    onUpdate(localEducation);
    setHasChanges(false);
  }, [localEducation, onUpdate]);

  const handleReset = useCallback(() => {
    setLocalEducation(education);
    setHasChanges(false);
  }, [education]);

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
          <h2 className="font-serif text-xl font-medium text-ink">Education</h2>
          <p className="text-sm text-ink-3 mt-1">{localEducation.length} entries</p>
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
            onClick={handleAddEducation}
            className="flex items-center gap-1.5 text-sm border border-rule px-3 py-1.5 hover:bg-bg"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {localEducation.map((ed) => (
          <div key={ed.id} className="bg-card border border-rule">
            {/* Education Header */}
            <div
              onClick={() => toggleExpanded(ed.id)}
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-bg"
            >
              <div className="flex-1">
                <div className="font-medium text-ink">
                  {ed.degree || 'Degree'} in {ed.field || 'Field'}
                </div>
                <div className="text-sm text-ink-3 mt-1">
                  {ed.school || 'School name'} · {ed.startDate.slice(0, 4)} –{' '}
                  {ed.endDate.slice(0, 4)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ed.gpa && <span className="font-mono text-[10px] text-ink-3">GPA: {ed.gpa}</span>}
                {expandedIds.has(ed.id) ? (
                  <ChevronUp className="w-4 h-4 text-ink-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-3" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIds.has(ed.id) && (
              <div className="px-5 py-4 border-t border-rule space-y-4">
                {/* School */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    School / Institution
                  </label>
                  <input
                    type="text"
                    value={ed.school}
                    onChange={(e) => handleUpdateEducation(ed.id, { school: e.target.value })}
                    className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                  />
                </div>

                {/* Degree & Field */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={ed.degree}
                      onChange={(e) => handleUpdateEducation(ed.id, { degree: e.target.value })}
                      placeholder="e.g., Bachelor of Science"
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={ed.field}
                      onChange={(e) => handleUpdateEducation(ed.id, { field: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Start Date
                    </label>
                    <input
                      type="month"
                      value={ed.startDate.slice(0, 7)}
                      onChange={(e) =>
                        handleUpdateEducation(ed.id, { startDate: e.target.value + '-01' })
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
                      value={ed.endDate.slice(0, 7)}
                      onChange={(e) =>
                        handleUpdateEducation(ed.id, { endDate: e.target.value + '-01' })
                      }
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {/* GPA */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    GPA (optional)
                  </label>
                  <input
                    type="text"
                    value={ed.gpa || ''}
                    onChange={(e) =>
                      handleUpdateEducation(ed.id, { gpa: e.target.value || undefined })
                    }
                    placeholder="e.g., 3.8/4.0"
                    className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                  />
                </div>

                {/* Delete */}
                <div className="pt-4 border-t border-rule">
                  <button
                    onClick={() => handleDeleteEducation(ed.id)}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {localEducation.length === 0 && (
        <div className="bg-card border border-rule p-10 text-center">
          <p className="text-sm text-ink-3">No education entries yet.</p>
          <button
            onClick={handleAddEducation}
            className="mt-4 flex items-center gap-1.5 text-sm bg-accent-hi text-white px-4 py-2 hover:opacity-90 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Your First Education
          </button>
        </div>
      )}
    </div>
  );
}
