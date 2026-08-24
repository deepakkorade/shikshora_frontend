import { useState } from 'react';
import { Bell, Plus, Calendar, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function NoticeModule() {
  const [notices, setNotices] = useState([
    { id: 1, title: 'Annual School Sports Meet 2026', content: 'The annual sports meet will commence from September 15. All students are invited to register for events.', date: '2026-08-20', audience: 'All' },
    { id: 2, title: 'Teacher Training Workshop', content: 'A mandatory pedagogical training session is scheduled for all faculty members this Saturday.', date: '2026-08-22', audience: 'Staff' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '', audience: 'All', date: new Date().toISOString().split('T')[0] });

  const handleCreateNotice = (e) => {
    e.preventDefault();
    setNotices([ { id: Date.now(), ...newNotice }, ...notices ]);
    setShowAddForm(false);
    setNewNotice({ title: '', content: '', audience: 'All', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notice Board</h2>
          <p className="text-sm text-text-muted">Post general campus announcements, school-wide notices, or targeted updates.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Post Notice
        </Button>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <div key={n.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1 flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-foreground text-sm">{n.title}</h3>
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {n.date}</span>
              </div>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{n.content}</p>
              <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-2">Target: {n.audience}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Publish Announcement</h3>
              <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <Input label="Notice Title *" value={newNotice.title} onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="e.g. Labor Day Holiday" required />
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Target Audience *</label>
                <select value={newNotice.audience} onChange={(e) => setNewNotice({ ...newNotice, audience: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="All">Entire School Campus</option>
                  <option value="Staff">Faculty & Employees Only</option>
                  <option value="Parent">Parents Only</option>
                  <option value="Student">Students Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Notice Details *</label>
                <textarea value={newNotice.content} onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })} className="w-full p-3 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none min-h-[90px]" placeholder="Announce date and instruction details..." required />
              </div>

              <Button type="submit">Publish Announcement</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
