import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Profile', path: '/profile' },
  { label: 'Stories', path: '/stories' },
  { label: 'AI Assistant', path: '/ai-assistant' },
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
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Nav Bar */}
      <div className="backdrop-blur-xl rounded-2xl px-5 py-3 flex items-center gap-8 shadow-lg bg-white/30 border border-white/50">
        <button
          onClick={() => handleNavigate('/')}
          className="font-semibold tracking-tight text-lg text-gray-900"
        >
          MockVue
        </button>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Search className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2">
          <div className="backdrop-blur-xl rounded-2xl p-3 w-64 shadow-xl bg-white/40 border border-white/60">
            {/* Profile Section */}
            <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg bg-white/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                DU
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Dev User</div>
                <div className="text-xs text-gray-600">dev@mockvue.com</div>
              </div>
            </div>

            <div className="my-2 h-px bg-gray-300/50" />

            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'hover:bg-white/50 text-gray-900'
                  }`}
              >
                {item.label}
              </button>
            ))}

            <div className="my-2 h-px bg-gray-300/50" />

            <button className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-white/50 text-gray-900 text-sm">
              Settings
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg transition-colors hover:bg-white/50 text-gray-900 text-sm">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
