import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateSheetWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [generationText, setGenerationText] = useState('Initializing AI context...');

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('primary');
  const [logistics, setLogistics] = useState('');
  const [concerns, setConcerns] = useState('');

  const handleNext = () => setStep((s) => Math.min(s + 1, 4));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerate = () => {
    setStep(4);

    // Simulate generation sequence
    setTimeout(() => setGenerationText('Extracting company values & news...'), 1500);
    setTimeout(() => setGenerationText('Parsing Job Description for key signals...'), 3000);
    setTimeout(() => setGenerationText('Mapping your Story Bank to expected questions...'), 4500);
    setTimeout(() => setGenerationText('Drafting TMAY and narrative...'), 6000);
    setTimeout(() => setGenerationText('Finalizing Living Workbook...'), 7500);

    setTimeout(() => {
      navigate('/document/mock-123'); // Redirect to the mock workbook
    }, 8500);
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-rule border-t-accent-hi rounded-full animate-spin mb-8"></div>
        <div className="font-serif text-2xl animate-pulse">{generationText}</div>
        <div className="font-mono text-[10px] text-ink-3 tracking-widest mt-4 uppercase">
          Building your Prep Sheet
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
      <div className="flex items-center p-6 border-b border-rule bg-card shrink-0">
        <button
          onClick={() => navigate('/document')}
          className="bg-transparent border-none font-sans text-ink-2 hover:text-ink cursor-pointer flex items-center gap-2 text-[13px]"
        >
          ← Cancel
        </button>
        <div className="flex-1" />
        <div className="font-mono text-[10px] tracking-widest text-ink-3 uppercase">
          Step {step} of 3
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex justify-center py-16">
        <div className="w-full max-w-[600px] px-8">
          <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-4">
            Create New Cheat Sheet
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-serif text-[40px] font-normal leading-tight m-0 mb-8 tracking-tight">
                The Target
              </h1>
              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-[11px] text-ink-3 tracking-wide uppercase mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full bg-card border border-rule px-4 py-3 text-[15px] font-serif focus:outline-none focus:border-ink transition-colors"
                  />
                  {company.length > 2 && (
                    <div className="mt-2 text-[12px] text-[#3d8a4a] italic flex items-center gap-1.5">
                      ✓ Scraped data available (values, 40+ questions)
                    </div>
                  )}
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-ink-3 tracking-wide uppercase mb-2">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full bg-card border border-rule px-4 py-3 text-[15px] font-serif focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-serif text-[40px] font-normal leading-tight m-0 mb-8 tracking-tight">
                The Context
              </h1>
              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-[11px] text-ink-3 tracking-wide uppercase mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full bg-card border border-rule px-4 py-3 text-[14px] leading-relaxed h-[240px] resize-none focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-ink-3 tracking-wide uppercase mb-2">
                    Baseline Resume
                  </label>
                  <select
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    className="w-full bg-card border border-rule px-4 py-3 text-[14px] focus:outline-none focus:border-ink transition-colors appearance-none cursor-pointer"
                  >
                    <option value="primary">Primary Profile Resume</option>
                    <option value="pm">Product Management Variant</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="font-serif text-[40px] font-normal leading-tight m-0 mb-8 tracking-tight">
                The Nuance
              </h1>
              <p className="text-[14px] text-ink-2 mb-6 leading-relaxed">
                Add any specific context to help the AI tailor your cheat sheet. Who are you meeting
                with? What are you worried about?
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-[11px] text-ink-3 tracking-wide uppercase mb-2">
                    Logistics & Interviewers
                  </label>
                  <textarea
                    value={logistics}
                    onChange={(e) => setLogistics(e.target.value)}
                    placeholder="e.g. Onsite on April 24. Interviewers: Rita Chen (HM), Marcus Vohra (Dir Eng)..."
                    className="w-full bg-card border border-rule px-4 py-3 text-[14px] leading-relaxed h-[100px] resize-none focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-ink-3 tracking-wide uppercase mb-2">
                    Specific Concerns or Focus Areas
                  </label>
                  <textarea
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    placeholder="e.g. I am worried about my lack of B2B experience. Make sure to highlight my data-driven decisions."
                    className="w-full bg-card border border-rule px-4 py-3 text-[14px] leading-relaxed h-[100px] resize-none focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-rule pt-6">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="bg-transparent border border-rule px-5 py-2.5 text-[13px] font-sans cursor-pointer hover:bg-card disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-ink"
            >
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && (!company || !role)}
                className="bg-accent-hi text-white border-none px-5 py-2.5 text-[13px] font-semibold cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="bg-accent-hi text-white border-none px-6 py-2.5 text-[13px] font-semibold cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Generate Sheet
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
