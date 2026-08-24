import { useState } from 'react';
import { Award, Plus, Calendar, Star, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ExamsModule() {
  const [exams, setExams] = useState([
    { id: 1, name: 'First Unit Assessment', type: 'Unit Test', date: '2026-09-10', subjects: 'Physics, Mathematics, Chemistry', status: 'Published' },
    { id: 2, name: 'Mid-Term Examinations', type: 'Mid-Term', date: '2026-10-15', subjects: 'All Subjects', status: 'Scheduled' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', type: 'Unit Test', date: '', subjects: '' });

  const handleCreateExam = (e) => {
    e.preventDefault();
    setExams([...exams, { id: Date.now(), ...newExam, status: 'Scheduled' }]);
    setShowAddForm(false);
    setNewExam({ name: '', type: 'Unit Test', date: '', subjects: '' });
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Examination Center</h2>
          <p className="text-sm text-text-muted">Configure exam dates, publish mid-term and final assessments, and generate report cards.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="flex items-center gap-1">
          <Plus className="w-4 h-4" /> Create Exam Term
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.map((ex) => (
          <div key={ex.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  ex.type === 'Mid-Term' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'
                }`}>
                  {ex.type}
                </span>
                <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{ex.status}</span>
              </div>
              <h3 className="font-bold text-foreground text-base">{ex.name}</h3>
              <p className="text-xs text-foreground font-semibold">Subjects: <span className="text-text-muted font-medium">{ex.subjects}</span></p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center">
              <span className="text-xs text-text-muted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Start Date: {ex.date}</span>
              <button className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer">
                <Star className="w-3.5 h-3.5" /> Enter Marks
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Exam Term</h3>
              <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateExam} className="space-y-4">
              <Input label="Exam Name *" value={newExam.name} onChange={(e) => setNewExam({ ...newExam, name: e.target.value })} placeholder="e.g. Mid-Term 2026" required />
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Assessment Category *</label>
                <select value={newExam.type} onChange={(e) => setNewExam({ ...newExam, type: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term">Mid-Term Exam</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Practical">Practical Assessment</option>
                  <option value="Internal Assessment">Internal Assessment</option>
                </select>
              </div>

              <Input label="Exam Start Date *" type="date" value={newExam.date} onChange={(e) => setNewExam({ ...newExam, date: e.target.value })} required />
              <Input label="Subjects list (comma separated)" value={newExam.subjects} onChange={(e) => setNewExam({ ...newExam, subjects: e.target.value })} placeholder="Math, Science, English" />

              <Button type="submit">Create Exam Term</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
