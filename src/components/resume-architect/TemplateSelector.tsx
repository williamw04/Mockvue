import { useState, useEffect } from 'react';
import { X, FileText, Loader2, Check, ExternalLink } from 'lucide-react';
import { usePDF, useUser } from '../../services';
import type { Resume, ResumeTemplate, PDFGenerationResult } from '../../types';

interface TemplateSelectorProps {
  resume: Resume;
  onClose: () => void;
}

export function TemplateSelector({ resume, onClose }: TemplateSelectorProps) {
  const pdfService = usePDF();
  const userService = useUser();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<PDFGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await pdfService.getTemplates();
        setTemplates(fetchedTemplates);
        if (fetchedTemplates.length > 0) {
          setSelectedTemplate(fetchedTemplates[0]);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [pdfService]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setGenerating(true);
    setError(null);

    try {
      // Get user profile for name/email
      const userProfile = await userService.getUserProfile();
      const result = await pdfService.generatePDF(resume, selectedTemplate.id, {
        name: userProfile?.name,
        email: userProfile?.email,
      });
      setGeneratedResult(result);
    } catch (err) {
      console.error('PDF generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPDF = async () => {
    if (generatedResult?.pdfPath) {
      try {
        await pdfService.openPDF(generatedResult.pdfPath);
      } catch (err) {
        console.error('Error opening PDF:', err);
      }
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50">
      <div className="bg-bg border border-rule w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rule flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-ink">Export Resume as PDF</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Resume Preview Summary */}
          <div className="mb-6 p-4 bg-card border border-rule">
            <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-2">
              Resume Preview
            </div>
            <div className="space-y-1 text-sm">
              {resume.summary && (
                <div className="text-ink-2">Summary: {resume.summary.slice(0, 50)}...</div>
              )}
              <div className="text-ink-2">
                Work Experience: {resume.workExperiences.length} positions
              </div>
              {resume.education.length > 0 && (
                <div className="text-ink-2">Education: {resume.education.length} entries</div>
              )}
              <div className="text-ink-2">Skills: {resume.skills.length} skills</div>
              {resume.projects.length > 0 && (
                <div className="text-ink-2">Projects: {resume.projects.length} projects</div>
              )}
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-6">
            <div className="font-mono text-[10px] text-ink-3 tracking-widest uppercase mb-3">
              Choose Template
            </div>

            {loadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-ink-3" />
                <span className="text-sm text-ink-3 ml-2">Loading templates...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-4 border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-accent-hi bg-accent-lo'
                        : 'border-rule hover:border-ink-2 bg-card'
                    }`}
                  >
                    {/* Template Preview Icon */}
                    <div className="w-full aspect-[3/4] bg-bg border border-rule mb-3 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-ink-3" />
                    </div>
                    <div className="font-medium text-sm text-ink">{template.name}</div>
                    <div className="text-xs text-ink-3 mt-1">{template.description}</div>
                    {selectedTemplate?.id === template.id && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-accent-hi">
                        <Check className="w-3 h-3" />
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Generated Success */}
          {generatedResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center justify-between">
              <span>PDF generated successfully!</span>
              <button
                onClick={handleOpenPDF}
                className="flex items-center gap-1 text-green-700 hover:text-green-800 underline"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-rule flex items-center justify-between">
          <button onClick={onClose} className="text-sm text-ink-3 hover:text-ink px-4 py-2">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!selectedTemplate || generating}
            className="flex items-center gap-2 bg-accent-hi text-white px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : generatedResult ? (
              <>
                <FileText className="w-4 h-4" />
                Regenerate PDF
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Generate PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
