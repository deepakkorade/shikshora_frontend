import { useState } from 'react';
import { BookOpen, Plus, FileText, Calendar, CheckSquare, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function HomeworkModule() {
  const [homeworkList, setHomeworkList] = useState([
    { id: 1, title: 'Optics Reflection & Refraction', subject: 'Physics', class: 'Class 10-A', due: '2026-08-30', desc: 'Read chapter 4 and answer questions 1 to 10 in the workbook.' },
    { id: 2, title: 'Linear Equations in 2 Variables', subject: 'Mathematics', class: 'Class 9-B', due: '2026-09-02', desc: 'Solve exercises 3.1 and 3.2 on graph sheets.' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newHw, setNewHw] = useState({ title: '', subject: 'Physics', class: 'Class 10-A', due: '', desc: '' });

  const handleCreateHw = (e) => {
    e.preventDefault();
    setHomeworkList([...homeworkList, { id: Date.now(), ...newHw }]);
    setShowAddForm(false);
    setNewHw({ title: '', subject: 'Physics', class: 'Class 10-A', due: '', desc: '' });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Homework & Assignments Board</h2>
          <p className="text-sm text-text-muted">Publish homework tasks, attach workbook questions, and grade student submissions.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Add Assignment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {homeworkList.map((hw) => (
          <div key={hw.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{hw.class} • {hw.subject}</span>
                <span className="text-xs text-text-muted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due: {hw.due}</span>
              </div>
              <h3 className="font-bold text-foreground text-base">{hw.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{hw.desc}</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center">
              <span className="text-[10px] text-text-muted">Assigned by: Class Teacher</span>
              <button className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Submit work
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Publish Homework</h3>
              <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateHw} className="space-y-4">
              <Input label="Assignment Title *" value={newHw.title} onChange={(e) => setNewHw({ ...newHw, title: e.target.value })} placeholder="e.g. Chemical Reactions" required />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Subject</label>
                  <select value={newHw.subject} onChange={(e) => setNewHw({ ...newHw, subject: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                    <option value="Physics">Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">General Science</option>
                    <option value="English">English Lit</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Class</label>
                  <select value={newHw.class} onChange={(e) => setNewHw({ ...newHw, class: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                    <option value="Class 10-A">Class 10-A</option>
                    <option value="Class 9-A">Class 9-A</option>
                    <option value="Class 9-B">Class 9-B</option>
                  </select>
                </div>
              </div>

              <Input label="Due Date *" type="date" value={newHw.due} onChange={(e) => setNewHw({ ...newHw, due: e.target.value })} required />
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Instructions / Description *</label>
                <textarea value={newHw.desc} onChange={(e) => setNewHw({ ...newHw, desc: e.target.value })} className="w-full p-3 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none min-h-[80px]" placeholder="Workbook questions..." required />
              </div>

              <Button type="submit">Publish Assignment</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
