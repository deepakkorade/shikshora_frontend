import { useState } from 'react';
import { Calendar, BookOpen, Clock, AlertCircle, FileText, CheckCircle2, User, ChevronRight, LayoutDashboard, CreditCard, Bell } from 'lucide-react';

// ==================== 1. TEACHER DASHBOARD ====================
export function TeacherDashboard() {
  const [schedule] = useState([
    { id: 1, period: 1, time: '09:00 - 09:45', class: 'Class 10-A', subject: 'Physics', room: 'Lab 2' },
    { id: 2, period: 2, time: '09:50 - 10:35', class: 'Class 9-B', subject: 'Basic Science', room: 'Room 102' },
    { id: 3, period: 4, time: '11:30 - 12:15', class: 'Class 10-A', subject: 'Physics Lab', room: 'Lab 2' }
  ]);

  const [homework] = useState([
    { id: 1, title: 'Electromagnetic Waves', class: 'Class 10-A', due: 'In 2 days', submissions: '12/28' },
    { id: 2, title: 'Atomic Theory Questions', class: 'Class 9-B', due: 'In 4 days', submissions: '8/30' }
  ]);

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h1>
        <p className="text-sm text-text-muted">Manage your daily lectures, assignments, and student attendance tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Today's Schedule */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Today's Timetable Lecture Slots</span>
          </h3>
          <div className="space-y-3">
            {schedule.map((slot) => (
              <div key={slot.id} className="p-4 rounded-xl bg-card-border/30 border border-border/40 flex justify-between items-center hover:border-primary/20 transition-all">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Period {slot.period}</span>
                  <span className="font-bold text-foreground text-sm block mt-1">{slot.subject} ({slot.class})</span>
                  <span className="text-xs text-text-muted">{slot.time}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-text-muted block">Location</span>
                  <span className="text-xs text-foreground font-bold">{slot.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Homework */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <span>Active Homework Review</span>
          </h3>
          <div className="space-y-3">
            {homework.map((hw) => (
              <div key={hw.id} className="p-3.5 rounded-xl bg-card-border/30 border border-border/40 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-foreground text-sm block">{hw.title}</span>
                  <span className="text-[9px] bg-purple-500/10 text-purple-500 font-bold px-1.5 py-0.5 rounded-md">{hw.class}</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Due: {hw.due}</span>
                  <span className="font-bold text-primary">{hw.submissions} submitted</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ==================== 2. PARENT PORTAL ====================
export function ParentDashboard() {
  const [children] = useState([
    { id: 1, name: 'Alice Miller', class: 'Class 10-A', roll: '14', attendance: '96%', feeStatus: 'Paid' },
    { id: 2, name: 'Bobby Miller', class: 'Class 7-B', roll: '08', attendance: '92%', feeStatus: 'Pending Invoice' }
  ]);

  const [activeChild, setActiveChild] = useState(children[0]);

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Parent Control Portal</h1>
          <p className="text-sm text-text-muted">Monitor academic marks, daily attendance, and invoice payments.</p>
        </div>

        {/* Multi-Children Switcher */}
        <div className="flex items-center gap-2 bg-card-border/40 p-1.5 rounded-xl border border-border/60">
          <span className="text-xs font-semibold text-text-muted px-2">Active Child:</span>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChild.id === child.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-foreground'
              }`}
            >
              {child.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Child Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Child Card Profile Summary */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {activeChild.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-foreground text-base block">{activeChild.name}</span>
              <span className="text-xs text-text-muted">Roll Number: {activeChild.roll} | {activeChild.class}</span>
            </div>
          </div>
          
          <div className="border-t border-border/20 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Term Attendance:</span>
              <span className="font-bold text-green-500">{activeChild.attendance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Fee Invoice Status:</span>
              <span className={`font-bold ${activeChild.feeStatus === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>{activeChild.feeStatus}</span>
            </div>
          </div>
        </div>

        {/* Academics & Classes History summary */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span>Latest Homework Assignments & Notices</span>
          </h3>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-card-border/30 border border-border/40 flex justify-between items-center">
              <div>
                <span className="font-semibold text-foreground text-sm block">Lab Assessment Preparation</span>
                <span className="text-xs text-text-muted">Due: Tomorrow | Physics Lab</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
            <div className="p-3.5 rounded-xl bg-card-border/30 border border-border/40 flex justify-between items-center">
              <div>
                <span className="font-semibold text-foreground text-sm block">Notice: Upcoming Annual Sports Meet</span>
                <span className="text-xs text-text-muted">Published: 2 days ago | All School</span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==================== 3. STUDENT PORTAL ====================
export function StudentDashboard() {
  const [assignments] = useState([
    { id: 1, title: 'Optics Lab Report', subject: 'Physics', due: 'Today, 23:59', status: 'Pending' },
    { id: 2, title: 'Algebra Equations', subject: 'Math', due: 'In 3 days', status: 'Completed' }
  ]);

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Workspace</h1>
        <p className="text-sm text-text-muted">View your active timetable, upload homework files, and check examination grades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Homework board */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Assignments Task Checklist</span>
          </h3>
          <div className="space-y-3">
            {assignments.map((ass) => (
              <div key={ass.id} className="p-4 rounded-xl bg-card-border/30 border border-border/40 flex justify-between items-center">
                <div>
                  <span className="font-bold text-foreground text-sm block">{ass.title}</span>
                  <span className="text-xs text-text-muted">{ass.subject} • Due: {ass.due}</span>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    ass.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {ass.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fast links panel */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
          <h3 className="text-base font-bold text-foreground">My Portal Actions</h3>
          <div className="space-y-2">
            <button className="w-full p-3 rounded-xl border border-border hover:bg-card-border/20 text-left text-xs font-semibold text-foreground flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> View Class Timetable</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full p-3 rounded-xl border border-border hover:bg-card-border/20 text-left text-xs font-semibold text-foreground flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" /> Exam Result Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="w-full p-3 rounded-xl border border-border hover:bg-card-border/20 text-left text-xs font-semibold text-foreground flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-500" /> School Fee Invoices</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
