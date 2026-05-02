import { useState, useEffect, useMemo } from 'react';
import { useUser, useNotifications } from '../services';
import type { Story, Resume, CoreStoryCategory, CoreStoryMatch } from '../types';
import { TopNavBar } from './TopNavBar';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StoryEditorWorkspace } from './StoryEditorWorkspace';

const CORE_STORIES: {
  category: CoreStoryCategory;
  name: string;
  icon: string;
  description: string;
  target: number;
}[] = [
  {
    category: 'conflict',
    name: 'Conflict',
    icon: '↔',
    description: 'A disagreement with a peer or supervisor and how you resolved it.',
    target: 1,
  },
  {
    category: 'failure',
    name: 'Failure / Learning',
    icon: '↻',
    description: 'A genuine mistake and what you learned from it.',
    target: 1,
  },
  {
    category: 'leadership',
    name: 'Leadership',
    icon: '◈',
    description: 'A time you took the lead, formal title or not.',
    target: 2,
  },
  {
    category: 'adaptability',
    name: 'Adaptability',
    icon: '∿',
    description: 'A time priorities shifted rapidly and you adapted.',
    target: 1,
  },
  {
    category: 'tight-deadline',
    name: 'Tight Deadline',
    icon: '⏱',
    description: 'A time you were overwhelmed and had to prioritize.',
    target: 1,
  },
  {
    category: 'difficult-customer',
    name: 'Difficult Customer',
    icon: '◎',
    description: 'A time you handled a difficult stakeholder or customer.',
    target: 1,
  },
  {
    category: 'data-driven-decision',
    name: 'Data-Driven Decision',
    icon: '⬡',
    description: 'A choice made with incomplete or complex data.',
    target: 1,
  },
  {
    category: 'above-and-beyond',
    name: 'Above and Beyond',
    icon: '↑',
    description: 'A time you exceeded expectations intrinsically.',
    target: 1,
  },
  {
    category: 'persuasion',
    name: 'Persuasion',
    icon: '⇌',
    description: 'A time you used logic or rapport to convince a skeptic.',
    target: 1,
  },
  {
    category: 'proudest-accomplishment',
    name: 'Proudest Accomplishment',
    icon: '⊕',
    description: 'Your "Hero Story" highlighting your best work.',
    target: 1,
  },
];

type CategoryStatus = 'strong' | 'ok' | 'weak' | 'missing';

const STATUS_CONFIG: Record<
  CategoryStatus,
  { label: string; bg: string; border: string; dot: string; text: string }
> = {
  strong: {
    label: 'Strong',
    bg: 'bg-[#f0fdf4]',
    border: 'border-[#86efac]',
    dot: 'bg-[#3d8a4a]',
    text: 'text-[#166534]',
  },
  ok: {
    label: 'OK',
    bg: 'bg-[#fff7ed]',
    border: 'border-[#fed7aa]',
    dot: 'bg-[#c7851a]',
    text: 'text-[#9a3412]',
  },
  weak: {
    label: 'Thin',
    bg: 'bg-[#fffbeb]',
    border: 'border-[#fde68a]',
    dot: 'bg-[#d97706]',
    text: 'text-[#92400e]',
  },
  missing: {
    label: 'Missing',
    bg: 'bg-[#fafaf8]',
    border: 'border-rule',
    dot: 'bg-ink-3',
    text: 'text-ink-3',
  },
};

function computeStatus(count: number, target: number, hasResultMetrics: boolean): CategoryStatus {
  if (count === 0) return 'missing';
  if (count >= target && hasResultMetrics) return 'strong';
  if (count >= target) return 'ok';
  return 'weak';
}

function hasMetrics(text: string): boolean {
  return /\d/.test(text);
}

function StrengthBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? '#3d8a4a' : pct >= 60 ? '#d9532b' : '#c7851a';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1 bg-rule">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="font-mono text-[10px] text-ink-3 w-5">{pct}</div>
    </div>
  );
}

function computeStoryStrength(story: Story): number {
  let score = 50;
  if (story.title.length > 10) score += 10;
  if (story.situation.length > 30) score += 8;
  if (story.task.length > 20) score += 8;
  if (story.action.length > 40) score += 12;
  if (hasMetrics(story.result)) score += 20;
  if (story.result.length > 30) score += 10;
  if (!story.action.toLowerCase().includes('we')) score += 5;
  return Math.min(100, score);
}

export default function StoriesPage() {
  const userService = useUser();
  const notifications = useNotifications();

  const [stories, setStories] = useState<Story[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<CoreStoryCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Story>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [allStories, userResume] = await Promise.all([
          userService.getStories(),
          userService.getResume(),
        ]);
        setStories(allStories);
        setResume(userResume);
      } catch (error) {
        console.error('Error loading data:', error);
        await notifications.showError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStoriesForCategory = (category: CoreStoryCategory) => {
    return stories.filter((s) => s.coreCategory === category);
  };

  const getAiMatchForCategory = (category: CoreStoryCategory): CoreStoryMatch | null => {
    if (!resume?.coreStoryMatches) return null;
    return resume.coreStoryMatches.find((m) => m.category === category) || null;
  };

  const getCategoryStatus = (category: CoreStoryCategory): CategoryStatus => {
    const categoryStories = getStoriesForCategory(category);
    const count = categoryStories.length;
    const hasMetricsInResult = categoryStories.some((s) => hasMetrics(s.result));
    const meta = CORE_STORIES.find((c) => c.category === category)!;
    return computeStatus(count, meta.target, hasMetricsInResult);
  };

  const builtCount = useMemo(() => {
    return CORE_STORIES.filter((c) => getCategoryStatus(c.category) !== 'missing').length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories]);

  const handleCategoryClick = (category: CoreStoryCategory) => {
    setSelectedCategory(category);
    setIsEditing(false);
  };

  const handleEdit = (category: CoreStoryCategory) => {
    const existingStories = getStoriesForCategory(category);
    const meta = CORE_STORIES.find((c) => c.category === category)!;
    const match = getAiMatchForCategory(category);

    if (existingStories.length > 0) {
      setEditForm(existingStories[0]);
    } else {
      setEditForm({
        id: crypto.randomUUID(),
        title: match ? `[Draft] ${match.relatedExperienceId}` : meta.name,
        coreCategory: category,
        situation: '',
        task: '',
        action: '',
        result: '',
        tags: [],
      });
    }
    setSelectedCategory(category);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedCategory || !editForm.title) return;

    try {
      const isNew = !stories.find((s) => s.id === editForm.id);

      let savedStory: Story;
      if (isNew) {
        savedStory = await userService.createStory(
          editForm as Omit<Story, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
        );
        setStories([...stories, savedStory]);
      } else {
        savedStory = await userService.updateStory(editForm.id!, editForm);
        setStories(stories.map((s) => (s.id === savedStory.id ? savedStory : s)));
      }

      setIsEditing(false);
      await notifications.showSuccess('Story saved!');
    } catch (error) {
      console.error('Error saving story:', error);
      await notifications.showError('Failed to save story');
    }
  };

  const selectedMeta = useMemo(
    () => CORE_STORIES.find((c) => c.category === selectedCategory),
    [selectedCategory]
  );

  const selectedStories = selectedCategory ? getStoriesForCategory(selectedCategory) : [];
  const aiMatch = selectedCategory ? getAiMatchForCategory(selectedCategory) : null;

  if (loading) {
    return <LoadingSpinner message="" />;
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopNavBar />

      {isEditing && selectedMeta ? (
        <StoryEditorWorkspace
          meta={selectedMeta}
          editForm={editForm}
          setEditForm={setEditForm}
          aiMatch={aiMatch}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex-1 pt-14 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto px-7 py-7 pb-14">
            <div className="max-w-[900px]">
              <div className="mb-6">
                <div className="font-mono text-[10px] tracking-[0.15em] text-ink-3 uppercase mb-1.5">
                  The Rule of 10
                </div>
                <h1 className="font-serif text-[32px] font-normal tracking-tight m-0">
                  Your Story Library
                </h1>
                <p className="text-[13px] text-ink-3 mt-1.5">
                  Cover all 10 categories before your first final round.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-rule rounded-sm">
                    <div
                      className="h-full bg-accent-hi rounded-sm transition-all duration-500"
                      style={{ width: `${(builtCount / 10) * 100}%` }}
                    />
                  </div>
                  <div className="font-mono text-[11px] text-accent-hi font-semibold">
                    {builtCount}/10
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CORE_STORIES.map((meta) => {
                  const categoryStories = stories.filter((s) => s.coreCategory === meta.category);
                  const count = categoryStories.length;
                  const hasMetricsInResult = categoryStories.some((s) => hasMetrics(s.result));
                  const status = computeStatus(count, meta.target, hasMetricsInResult);
                  const ss = STATUS_CONFIG[status];
                  const isSelected = selectedCategory === meta.category;

                  return (
                    <div
                      key={meta.category}
                      onClick={() => handleCategoryClick(meta.category)}
                      className={`${ss.bg} border ${isSelected ? 'border-accent-hi shadow-[0_0_0_2px_rgba(217,83,43,0.15)]' : ss.border} px-4 py-4 cursor-pointer transition-all duration-150`}
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-sm ${ss.dot} shrink-0`} />
                          <div className="text-[14px] font-semibold text-ink">{meta.name}</div>
                        </div>
                        <div
                          className={`font-mono text-[10px] tracking-[0.05em] px-1.5 py-0.5 bg-white/60 border ${ss.border} ${ss.text}`}
                        >
                          {ss.label.toUpperCase()}
                        </div>
                      </div>

                      {categoryStories.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {categoryStories.map((st) => (
                            <div
                              key={st.id}
                              className="px-2.5 py-1.5 bg-white/70 border border-white/50 flex items-center gap-2.5"
                            >
                              <div className="flex-1 text-[12px] text-ink font-medium">
                                {st.title}
                              </div>
                              <StrengthBar pct={computeStoryStrength(st)} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2.5 flex items-center gap-2">
                          <div className="text-[12px] text-ink-3 italic">No story yet</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(meta.category);
                            }}
                            className="bg-transparent border border-dashed border-ink-3 px-2.5 py-0.5 text-[11px] text-ink-3 cursor-pointer hover:bg-white/50 transition-colors"
                          >
                            + Add
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="w-[300px] border-l border-rule bg-card overflow-y-auto px-5 py-6">
            {selectedCategory ? (
              <CategoryDetailPanel
                meta={selectedMeta!}
                stories={selectedStories}
                aiMatch={aiMatch}
                onEdit={() => handleEdit(selectedCategory)}
              />
            ) : (
              <LibraryStatsPanel stories={stories} />
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function CategoryDetailPanel({
  meta,
  stories,
  aiMatch,
  onEdit,
}: {
  meta: {
    category: CoreStoryCategory;
    name: string;
    icon: string;
    description: string;
    target: number;
  };
  stories: Story[];
  aiMatch: CoreStoryMatch | null;
  onEdit: () => void;
}) {
  const status = computeStatus(
    stories.length,
    meta.target,
    stories.some((s) => hasMetrics(s.result))
  );
  const ss = STATUS_CONFIG[status];

  return (
    <div>
      <div className="mb-5">
        <div className={`font-mono text-[10px] tracking-[0.15em] ${ss.text} uppercase mb-1.5`}>
          {ss.label.toUpperCase()} · {stories.length} OF {meta.target} STORIES
        </div>
        <h3 className="font-serif text-[24px] font-medium tracking-tight m-0">{meta.name}</h3>
      </div>

      {stories.length > 0 ? (
        <div className="flex flex-col gap-4">
          {stories.map((st) => (
            <div key={st.id} className="bg-bg border border-rule px-3.5 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[13px] font-semibold text-ink">{st.title}</div>
                <button
                  onClick={onEdit}
                  className="font-mono text-[10px] text-ink-3 hover:text-accent-hi transition-colors"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-[16px_1fr] gap-y-1.5 gap-x-2 text-[12px]">
                {[
                  ['S', st.situation],
                  ['T', st.task],
                  ['A', st.action],
                  ['R', st.result],
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <div className="font-mono text-[10px] text-accent-hi font-bold pt-0.5">{k}</div>
                    <div
                      className={`leading-relaxed ${k === 'R' ? 'text-ink font-medium' : 'text-ink-2'}`}
                    >
                      {v || <span className="text-ink-3 italic">—</span>}
                    </div>
                  </div>
                ))}
              </div>

              {st.tags.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-dotted border-rule flex gap-1.5">
                  {st.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="font-mono text-[10px] px-1.5 py-0.5 bg-card border border-rule text-ink-3"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : aiMatch ? (
        <div className="bg-accent-lo border-l-3 border-accent-hi px-3.5 py-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="font-mono text-[11px] text-accent-hi font-semibold">
              AI Recommended Match
            </div>
          </div>
          <div className="text-[13px] font-medium text-ink mb-1">{aiMatch.relatedExperienceId}</div>
          <div className="text-[12px] text-ink-2">{aiMatch.reasoning}</div>
          <button
            onClick={onEdit}
            className="mt-3 bg-accent-hi text-white border-none px-4 py-2 text-[12px] font-semibold cursor-pointer"
          >
            Draft this Story
          </button>
        </div>
      ) : (
        <div className="py-5 text-center">
          <div className="font-serif text-[15px] text-ink-3 italic mb-3">
            No stories in this category yet.
          </div>
          <button
            onClick={onEdit}
            className="bg-accent-hi text-white border-none px-4 py-2.5 text-[12px] font-semibold cursor-pointer"
          >
            + Build a {meta.name} story
          </button>
        </div>
      )}
    </div>
  );
}

function LibraryStatsPanel({ stories }: { stories: Story[] }) {
  const counts: Record<CategoryStatus, number> = {
    strong: 0,
    ok: 0,
    weak: 0,
    missing: 0,
  };

  CORE_STORIES.forEach((c) => {
    const categoryStories = stories.filter((s) => s.coreCategory === c.category);
    const count = categoryStories.length;
    const hasMetricsInResult = categoryStories.some((s) => hasMetrics(s.result));
    const status = computeStatus(count, c.target, hasMetricsInResult);
    counts[status]++;
  });

  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.15em] text-ink-3 uppercase mb-3.5">
        Overview
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { label: 'Strong', count: counts.strong, c: '#3d8a4a', bg: '#f0fdf4' },
          { label: 'OK', count: counts.ok, c: '#c7851a', bg: '#fff7ed' },
          { label: 'Thin', count: counts.weak, c: '#d97706', bg: '#fffbeb' },
          { label: 'Missing', count: counts.missing, c: '#8a857d', bg: '#fafaf8' },
        ].map((x) => (
          <div key={x.label} className="px-3 py-3 bg-[${x.bg}] border border-rule text-center">
            <div className="font-serif text-[32px] font-normal leading-none" style={{ color: x.c }}>
              {x.count}
            </div>
            <div className="font-mono text-[9px] mt-1 tracking-[0.15em]" style={{ color: x.c }}>
              {x.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-accent-lo border-l-3 border-accent-hi px-3.5 py-3.5 text-[13px] leading-relaxed">
        <b className="text-ink">Click any category</b> to see its stories, or add a new one.
      </div>
    </div>
  );
}
