import { useState, useCallback } from 'react';
import { Plus, Trash2, Save, RotateCcw, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectsEditorProps {
  projects: Project[];
  onUpdate: (newProjects: Project[]) => void;
}

export function ProjectsEditor({ projects, onUpdate }: ProjectsEditorProps) {
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(
    (newProj: Project[]) => {
      setHasChanges(JSON.stringify(newProj) !== JSON.stringify(projects));
    },
    [projects]
  );

  const handleUpdateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      const newProj = localProjects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      );
      setLocalProjects(newProj);
      checkForChanges(newProj);
    },
    [localProjects, checkForChanges]
  );

  const handleAddProject = useCallback(() => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      role: '',
      technologies: [],
      url: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    const updated = [...localProjects, newProj];
    setLocalProjects(updated);
    setExpandedIds((prev) => new Set(prev).add(newProj.id));
    checkForChanges(updated);
  }, [localProjects, checkForChanges]);

  const handleDeleteProject = useCallback(
    (id: string) => {
      const updated = localProjects.filter((proj) => proj.id !== id);
      setLocalProjects(updated);
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      checkForChanges(updated);
    },
    [localProjects, checkForChanges]
  );

  const handleAddTechnology = useCallback(
    (projId: string) => {
      const updated = localProjects.map((proj) =>
        proj.id === projId ? { ...proj, technologies: [...proj.technologies, ''] } : proj
      );
      setLocalProjects(updated);
      checkForChanges(updated);
    },
    [localProjects, checkForChanges]
  );

  const handleUpdateTechnology = useCallback(
    (projId: string, index: number, value: string) => {
      const updated = localProjects.map((proj) =>
        proj.id === projId
          ? {
              ...proj,
              technologies: proj.technologies.map((t, i) => (i === index ? value : t)),
            }
          : proj
      );
      setLocalProjects(updated);
      checkForChanges(updated);
    },
    [localProjects, checkForChanges]
  );

  const handleRemoveTechnology = useCallback(
    (projId: string, index: number) => {
      const updated = localProjects.map((proj) =>
        proj.id === projId
          ? { ...proj, technologies: proj.technologies.filter((_, i) => i !== index) }
          : proj
      );
      setLocalProjects(updated);
      checkForChanges(updated);
    },
    [localProjects, checkForChanges]
  );

  const handleSave = useCallback(() => {
    // Filter out empty technologies before saving
    const cleaned = localProjects.map((proj) => ({
      ...proj,
      technologies: proj.technologies.filter((t) => t.trim()),
    }));
    onUpdate(cleaned);
    setHasChanges(false);
  }, [localProjects, onUpdate]);

  const handleReset = useCallback(() => {
    setLocalProjects(projects);
    setHasChanges(false);
  }, [projects]);

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
          <h2 className="font-serif text-xl font-medium text-ink">Projects</h2>
          <p className="text-sm text-ink-3 mt-1">{localProjects.length} projects</p>
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
            onClick={handleAddProject}
            className="flex items-center gap-1.5 text-sm border border-rule px-3 py-1.5 hover:bg-bg"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {localProjects.map((proj) => (
          <div key={proj.id} className="bg-card border border-rule">
            {/* Project Header */}
            <div
              onClick={() => toggleExpanded(proj.id)}
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-bg"
            >
              <div className="flex-1">
                <div className="font-medium text-ink">{proj.title || 'Untitled Project'}</div>
                <div className="text-sm text-ink-3 mt-1">
                  {proj.role || 'Role'} ·{' '}
                  {proj.technologies.filter((t) => t.trim()).length > 0
                    ? proj.technologies.filter((t) => t.trim()).join(', ')
                    : 'No technologies'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {proj.url && (
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink-3 hover:text-ink"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {expandedIds.has(proj.id) ? (
                  <ChevronUp className="w-4 h-4 text-ink-3" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-ink-3" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIds.has(proj.id) && (
              <div className="px-5 py-4 border-t border-rule space-y-4">
                {/* Title */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleUpdateProject(proj.id, { title: e.target.value })}
                    placeholder="e.g., E-commerce Platform"
                    className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={proj.role}
                    onChange={(e) => handleUpdateProject(proj.id, { role: e.target.value })}
                    placeholder="e.g., Lead Developer, Backend Engineer"
                    className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    Description
                  </label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                    placeholder="Describe the project, its purpose, and your contributions..."
                    className="w-full min-h-[80px] bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink resize-y"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                    Project URL (optional)
                  </label>
                  <input
                    type="url"
                    value={proj.url || ''}
                    onChange={(e) =>
                      handleUpdateProject(proj.id, { url: e.target.value || undefined })
                    }
                    placeholder="e.g., https://github.com/username/project"
                    className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      Start Date (optional)
                    </label>
                    <input
                      type="month"
                      value={proj.startDate?.slice(0, 7) || ''}
                      onChange={(e) =>
                        handleUpdateProject(proj.id, {
                          startDate: e.target.value ? e.target.value + '-01' : undefined,
                        })
                      }
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="month"
                      value={proj.endDate?.slice(0, 7) || ''}
                      onChange={(e) =>
                        handleUpdateProject(proj.id, {
                          endDate: e.target.value ? e.target.value + '-01' : undefined,
                        })
                      }
                      className="w-full bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[10px] text-ink-3 tracking-widest uppercase">
                      Technologies Used
                    </label>
                    <button
                      onClick={() => handleAddTechnology(proj.id)}
                      className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proj.technologies.map((tech, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleUpdateTechnology(proj.id, index, e.target.value)}
                          placeholder="e.g., React"
                          className="bg-bg border border-rule px-2 py-1 text-sm focus:outline-none focus:border-ink w-auto"
                        />
                        <button
                          onClick={() => handleRemoveTechnology(proj.id, index)}
                          className="text-ink-3 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delete */}
                <div className="pt-4 border-t border-rule">
                  <button
                    onClick={() => handleDeleteProject(proj.id)}
                    className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {localProjects.length === 0 && (
        <div className="bg-card border border-rule p-10 text-center">
          <p className="text-sm text-ink-3">No projects yet.</p>
          <button
            onClick={handleAddProject}
            className="mt-4 flex items-center gap-1.5 text-sm bg-accent-hi text-white px-4 py-2 hover:opacity-90 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
