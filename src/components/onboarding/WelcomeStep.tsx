import { useState } from 'react';

interface WelcomeStepProps {
  onComplete: (name: string, targetRole: string) => void;
}

export default function WelcomeStep({ onComplete }: WelcomeStepProps) {
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && targetRole.trim()) {
      onComplete(name, targetRole);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-serif text-5xl tracking-tight mb-4">Welcome to Mockvue</h1>
        <p className="text-ink-2 text-base">Your AI-powered behavioral interview prep assistant</p>
      </div>

      <div className="bg-card border border-rule p-10">
        <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
          Let's get to know you
        </div>
        <h2 className="font-serif text-3xl mb-8">Quick Setup</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-ink-2">
              What's your name?
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 border bg-bg border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="targetRole" className="block text-sm font-medium mb-2 text-ink-2">
              What role are you interviewing for?
            </label>
            <input
              type="text"
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Software Engineer, Product Manager"
              required
              className="w-full px-4 py-3 border bg-bg border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="targetCompany" className="block text-sm font-medium mb-2 text-ink-2">
              Target company (optional)
            </label>
            <input
              type="text"
              id="targetCompany"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g., Google, Meta, Startup"
              className="w-full px-4 py-3 border bg-bg border-rule text-ink placeholder-ink-3 focus:border-accent-hi focus:outline-none"
            />
          </div>

          <div className="bg-accent-lo border border-rule p-5">
            <p className="text-sm text-ink-2 leading-relaxed">
              Behavioral interviews focus on your past experiences. We'll help you craft compelling
              stories that showcase your skills and achievements.
            </p>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !targetRole.trim()}
            className="w-full bg-accent-hi text-white border-none px-6 py-3 text-[13px] font-semibold cursor-pointer disabled:bg-ink-3 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
