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
        className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {label}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
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
          className={`absolute mt-1 min-w-[200px] bg-white border border-slate-200 rounded-md shadow-lg py-1 z-20 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) =>
            'to' in item ? (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
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
                className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
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
