import { useState, useCallback } from 'react';
import { Plus, X, Save, RotateCcw } from 'lucide-react';

interface SkillsEditorProps {
  skills: string[];
  onUpdate: (newSkills: string[]) => void;
}

export function SkillsEditor({ skills, onUpdate }: SkillsEditorProps) {
  const [localSkills, setLocalSkills] = useState<string[]>(skills);
  const [newSkill, setNewSkill] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const checkForChanges = useCallback(
    (newSkillsArr: string[]) => {
      setHasChanges(JSON.stringify(newSkillsArr.sort()) !== JSON.stringify(skills.sort()));
    },
    [skills]
  );

  const handleAddSkill = useCallback(() => {
    if (newSkill.trim() && !localSkills.includes(newSkill.trim())) {
      const updated = [...localSkills, newSkill.trim()];
      setLocalSkills(updated);
      setNewSkill('');
      checkForChanges(updated);
    }
  }, [localSkills, newSkill, checkForChanges]);

  const handleRemoveSkill = useCallback(
    (skillToRemove: string) => {
      const updated = localSkills.filter((s) => s !== skillToRemove);
      setLocalSkills(updated);
      checkForChanges(updated);
    },
    [localSkills, checkForChanges]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddSkill();
      }
    },
    [handleAddSkill]
  );

  const handleSave = useCallback(() => {
    onUpdate(localSkills);
    setHasChanges(false);
  }, [localSkills, onUpdate]);

  const handleReset = useCallback(() => {
    setLocalSkills(skills);
    setHasChanges(false);
  }, [skills]);

  // Group skills by category (heuristic based on common patterns)
  const categorizeSkills = (skillList: string[]): Record<string, string[]> => {
    const categories: Record<string, string[]> = {
      'Programming Languages': [],
      'Frameworks & Libraries': [],
      'Tools & Platforms': [],
      Databases: [],
      'Cloud & DevOps': [],
      Other: [],
    };

    const programmingLangs = [
      'python',
      'javascript',
      'typescript',
      'java',
      'c++',
      'c',
      'rust',
      'go',
      'ruby',
      'php',
      'swift',
      'kotlin',
      'scala',
      'r',
      'matlab',
      'sql',
    ];
    const frameworks = [
      'react',
      'vue',
      'angular',
      'node',
      'express',
      'django',
      'flask',
      'spring',
      'rails',
      'next',
      'nuxt',
      'svelte',
      'tailwind',
      'bootstrap',
    ];
    const tools = [
      'git',
      'docker',
      'kubernetes',
      'jenkins',
      'webpack',
      'vite',
      'npm',
      'yarn',
      'linux',
      'unix',
      'bash',
      'vim',
      'vs code',
      'intellij',
      'eclipse',
    ];
    const databases = [
      'mysql',
      'postgresql',
      'mongodb',
      'redis',
      'sqlite',
      'oracle',
      'cassandra',
      'elasticsearch',
      'dynamodb',
      'supabase',
      'firebase',
    ];
    const cloud = [
      'aws',
      'azure',
      'gcp',
      'heroku',
      'vercel',
      'netlify',
      'digitalocean',
      'cloudflare',
      's3',
      'ec2',
      'lambda',
      'kubernetes',
    ];

    skillList.forEach((skill) => {
      const lowerSkill = skill.toLowerCase();
      if (programmingLangs.some((l) => lowerSkill.includes(l))) {
        categories['Programming Languages'].push(skill);
      } else if (frameworks.some((f) => lowerSkill.includes(f))) {
        categories['Frameworks & Libraries'].push(skill);
      } else if (tools.some((t) => lowerSkill.includes(t))) {
        categories['Tools & Platforms'].push(skill);
      } else if (databases.some((d) => lowerSkill.includes(d))) {
        categories['Databases'].push(skill);
      } else if (cloud.some((c) => lowerSkill.includes(c))) {
        categories['Cloud & DevOps'].push(skill);
      } else {
        categories['Other'].push(skill);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach((key) => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  };

  const categorizedSkills = categorizeSkills(localSkills);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink">Skills</h2>
          <p className="text-sm text-ink-3 mt-1">{localSkills.length} skills</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
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
              Save
            </button>
          </div>
        )}
      </div>

      {/* Add Skill Input */}
      <div className="bg-card border border-rule p-4 mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a skill (e.g., Python, React, AWS)"
            className="flex-1 bg-bg border border-rule px-3 py-2 text-sm focus:outline-none focus:border-ink"
          />
          <button
            onClick={handleAddSkill}
            disabled={!newSkill.trim()}
            className="flex items-center gap-1.5 text-sm bg-ink text-white px-3 py-2 hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(categorizedSkills).map(([category, categorySkills]) => (
          <div key={category}>
            <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">
              {category}
            </div>
            <div className="flex flex-wrap gap-2">
              {categorySkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1.5 bg-card border border-rule px-3 py-1.5 text-sm"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-ink-3 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-bg border border-rule">
        <h3 className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">Tips</h3>
        <ul className="space-y-2 text-sm text-ink-2">
          <li>Include skills relevant to your target role.</li>
          <li>Order by proficiency level (most proficient first).</li>
          <li>Avoid listing obsolete or irrelevant skills.</li>
          <li>Consider grouping: technical, soft skills, certifications.</li>
        </ul>
      </div>
    </div>
  );
}
