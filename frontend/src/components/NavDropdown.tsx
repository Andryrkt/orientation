import { ReactNode, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export type NavDropdownItem = { to: string; label: string } | { label: string; onClick: () => void };

interface NavDropdownProps {
  label: ReactNode;
  items: NavDropdownItem[];
  align?: 'left' | 'right';
  active?: boolean;
}

export function NavDropdown({ label, items, align = 'left', active }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive =
    active ?? items.some((item) => 'to' in item && location.pathname.startsWith(item.to));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
          isActive
            ? 'bg-neon-purple/20 text-purple-300 border border-purple-500/30'
            : 'text-slate-300 hover:text-white hover:bg-white/8'
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180 text-purple-400' : 'text-slate-500'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute mt-2 min-w-[220px] py-2 z-20 rounded-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          style={{
            background: 'rgba(15, 12, 41, 0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(168,85,247,0.1)',
          }}
        >
          {items.map((item) =>
            'to' in item ? (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block mx-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <button
                key={item.label}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className="block w-[calc(100%-16px)] mx-2 text-left px-3.5 py-2 text-sm font-medium text-slate-300 hover:bg-white/8 hover:text-white rounded-xl transition-all"
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
