import { useState, useEffect, useRef } from 'react';
import { Search, GraduationCap, Users, BookOpen, CreditCard, Bell, BarChart3, X, ArrowRight } from 'lucide-react';

// Static searchable index — maps keywords to module nav IDs
const SEARCH_INDEX = [
  // Students
  { label: 'Student Registry',      sub: 'View and manage all students',      tab: 'students',      icon: GraduationCap, tags: ['student', 'registry', 'enroll', 'admission list'] },
  { label: 'Add New Student',       sub: 'Register a new student',            tab: 'students',      icon: GraduationCap, tags: ['add student', 'new student', 'enroll'] },
  // Staff
  { label: 'Faculty & Staff',       sub: 'Manage teachers and employees',     tab: 'staff',         icon: Users,         tags: ['staff', 'teacher', 'faculty', 'employee', 'hr'] },
  // Admissions
  { label: 'Admissions CRM',        sub: 'Track admission enquiries',         tab: 'admissions',    icon: GraduationCap, tags: ['admission', 'enquiry', 'crm', 'lead', 'application'] },
  // Academics
  { label: 'Academics Config',      sub: 'Manage classes, subjects, timetable', tab: 'academics',  icon: BookOpen,      tags: ['academic', 'class', 'subject', 'timetable', 'schedule'] },
  // Attendance
  { label: 'Attendance Marker',     sub: 'Mark daily attendance',             tab: 'attendance',    icon: BookOpen,      tags: ['attendance', 'present', 'absent', 'mark', 'daily'] },
  // Fees
  { label: 'Fees & Invoices',       sub: 'Manage fee collection and invoices', tab: 'fees',         icon: CreditCard,    tags: ['fees', 'invoice', 'payment', 'collection', 'due', 'pending'] },
  // Homework
  { label: 'Homework Board',        sub: 'Assign and track homework',         tab: 'homework',      icon: BookOpen,      tags: ['homework', 'assignment', 'task'] },
  // Exams
  { label: 'Examinations',          sub: 'Manage exams and results',          tab: 'exams',         icon: BookOpen,      tags: ['exam', 'test', 'result', 'marks', 'grade', 'report card'] },
  // Transport
  { label: 'Transport Logistics',   sub: 'Bus routes and driver management',  tab: 'transport',     icon: BookOpen,      tags: ['transport', 'bus', 'route', 'driver', 'vehicle'] },
  // Library
  { label: 'Library Catalog',       sub: 'Books and lending management',      tab: 'library',       icon: BookOpen,      tags: ['library', 'book', 'catalog', 'lending', 'issue'] },
  // Notices
  { label: 'Notice Board',          sub: 'Publish announcements',             tab: 'communication', icon: Bell,          tags: ['notice', 'announcement', 'circular', 'board', 'publish'] },
  // Reports
  { label: 'Analytics & Reports',   sub: 'View school performance reports',   tab: 'reports',       icon: BarChart3,     tags: ['report', 'analytics', 'performance', 'chart', 'stats'] },
  // Leave
  { label: 'Leave Approvals',       sub: 'Review and approve leave requests', tab: 'leaves-approval', icon: Users,       tags: ['leave', 'approval', 'request', 'absent', 'holiday'] },
  // Settings
  { label: 'Settings & Permissions',sub: 'User roles and access control',     tab: 'settings',      icon: BookOpen,      tags: ['settings', 'permission', 'role', 'access', 'config'] },
  // Dashboard
  { label: 'Dashboard',             sub: 'Go to main dashboard',              tab: 'dashboard',     icon: BarChart3,     tags: ['dashboard', 'home', 'overview'] },
];

export default function GlobalSearch({ onNavigate }) {
  const [query, setQuery]     = useState('');
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Filter results
  const results = query.trim().length < 1 ? [] : SEARCH_INDEX.filter(item => {
    const q = query.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      item.sub.toLowerCase().includes(q) ||
      item.tags.some(t => t.includes(q))
    );
  }).slice(0, 6);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+K or / to open
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); }
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, 0)); }
      if (e.key === 'Enter' && results[focused]) { handleSelect(results[focused]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, focused]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) { setOpen(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (item) => {
    onNavigate(item.tab);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className={`flex items-center gap-2 h-9 px-3 rounded-xl border transition-all duration-200 ${open ? 'border-primary/60 bg-card w-56 sm:w-72' : 'border-border/50 bg-card/50 w-36 sm:w-48'}`}>
        <Search className="w-3.5 h-3.5 text-text-muted shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setFocused(0); }}
          onFocus={() => setOpen(true)}
          placeholder="Search… (Ctrl+K)"
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-text-muted outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-text-muted hover:text-foreground cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {open && query.trim().length > 0 && (
        <div
          className="absolute left-0 top-full mt-2 w-72 bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden z-50"
          style={{ animation: 'scaleIn 0.15s ease-out both', transformOrigin: 'top left' }}
        >
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-muted">
              No results for "<strong>{query}</strong>"
            </div>
          ) : (
            <div className="py-1.5">
              <p className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                {results.length} result{results.length > 1 ? 's' : ''}
              </p>
              {results.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab + i}
                    onMouseEnter={() => setFocused(i)}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${focused === i ? 'bg-primary/10' : 'hover:bg-card-border/30'}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{item.label}</p>
                      <p className="text-[10px] text-text-muted truncate">{item.sub}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-text-muted shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-border/40 flex items-center gap-3 text-[10px] text-text-muted">
            <span><kbd className="px-1.5 py-0.5 bg-card-border/40 rounded text-[9px] font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="px-1.5 py-0.5 bg-card-border/40 rounded text-[9px] font-mono">↵</kbd> select</span>
            <span><kbd className="px-1.5 py-0.5 bg-card-border/40 rounded text-[9px] font-mono">Esc</kbd> close</span>
          </div>
        </div>
      )}
    </div>
  );
}
