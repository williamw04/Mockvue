import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Resume Architect', path: '/resume-architect' },
  { label: 'Stories', path: '/stories' },
  { label: 'Cheat Sheets', path: '/document' },
  { label: 'Practice', path: '/practice' },
];

export function TopNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-card flex items-center px-14 py-4 border-b border-rule w-full relative z-50">
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNavigate('/')}>
        <div className="w-5 h-5 rounded bg-ink relative overflow-hidden">
          <div className="absolute inset-[4px] border-2 border-accent-hi rounded-[1px] border-l-0 border-t-0" />
        </div>
        <div className="font-serif text-xl font-medium tracking-tight text-ink">Mockvue</div>
      </div>

      <nav className="flex gap-7 text-[14px] text-ink-2 ml-8">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path || (item.path === '/' && location.pathname === '');
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`transition-colors font-sans hover:text-ink ${
                isActive ? 'text-ink font-medium border-b-2 border-accent-hi pb-0.5' : ''
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2 text-[13px] text-ink-2 mr-6 cursor-pointer hover:text-ink transition-colors">
        <span className="font-mono text-[11px] text-ink-3">⌘K</span> Search
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-8 h-8 rounded-full bg-accent-lo text-accent-hi flex items-center justify-center font-semibold text-[13px] font-sans hover:opacity-80 transition-opacity"
        >
          DU
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 mt-3 w-48 bg-card border border-rule rounded shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-1">
            <div className="px-4 py-2 border-b border-rule mb-1">
              <div className="font-medium text-[13px] text-ink">Dev User</div>
              <div className="text-[12px] text-ink-3">dev@mockvue.com</div>
            </div>
            <button className="w-full text-left px-4 py-1.5 text-[13px] text-ink hover:bg-bg transition-colors font-sans">
              Settings
            </button>
            <button className="w-full text-left px-4 py-1.5 text-[13px] text-ink hover:bg-bg transition-colors font-sans">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
