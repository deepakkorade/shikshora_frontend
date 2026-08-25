import { useState } from 'react';
import { 
  BookOpen, Clock, 
  ChevronRight, LayoutDashboard, CreditCard, 
  Download, Check, X, Award
} from 'lucide-react';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

// Mock DB states in localStorage for inter-module flow simulations
const getLocalStorage = (key, initial) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
};

const setLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==================== 1. TEACHER DASHBOARD ====================
export function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, gradebook, leaves
  const [schedule] = useState([
    { id: 1, period: 1, time: '09:00 - 09:45', class: 'Class 10-A', subject: 'Physics', room: 'Lab 2' },
    { id: 2, period: 2, time: '09:50 - 10:35', class: 'Class 9-B', subject: 'Basic Science', room: 'Room 102' },
    { id: 3, period: 4, time: '11:30 - 12:15', class: 'Class 10-A', subject: 'Physics Lab', room: 'Lab 2' }
  ]);

  const [homework] = useState([
    { id: 1, title: 'Electromagnetic Waves', class: 'Class 10-A', due: 'In 2 days', submissions: '12/28' },
    { id: 2, title: 'Atomic Theory Questions', class: 'Class 9-B', due: 'In 4 days', submissions: '8/30' }
  ]);

  // Gradebook States
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [selectedExam, setSelectedExam] = useState('Unit Test 1');
  const [studentsList, setStudentsList] = useState([
    { id: 1, name: 'Alice Miller', roll: '14', marks: '88' },
    { id: 2, name: 'Bobby Miller', roll: '08', marks: '76' },
    { id: 3, name: 'Charlie Brown', roll: '11', marks: '92' },
    { id: 4, name: 'Diana Prince', roll: '02', marks: '95' }
  ]);
  const [notice, setNotice] = useState(null);
  const [gradebookLoading, setGradebookLoading] = useState(false);

  // Leaves States
  const [leavesList, setLeavesList] = useState(() => 
    getLocalStorage('shikshora_teacher_leaves', [
      { id: 1, dateRange: '2026-09-02 to 2026-09-04', type: 'Casual Leave', reason: 'Family engagement trip', status: 'Approved' },
      { id: 2, dateRange: '2026-09-18 to 2026-09-19', type: 'Sick Leave', reason: 'Dental appointment checkup', status: 'Pending' }
    ])
  );
  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', type: 'Casual Leave', reason: '' });

  const handleSaveGrades = (e) => {
    e.preventDefault();
    setGradebookLoading(true);
    setNotice(null);
    setTimeout(() => {
      setGradebookLoading(false);
      setNotice({ type: 'success', message: 'Student marks updated and reports updated successfully!' });
      // Cache the grades to simulate data persistence
      setLocalStorage('shikshora_saved_grades', {
        class: selectedClass,
        subject: selectedSubject,
        exam: selectedExam,
        grades: studentsList
      });
    }, 1200);
  };

  const handleMarksChange = (id, val) => {
    // Clamp values between 0 and 100
    const score = val === '' ? '' : Math.min(100, Math.max(0, parseInt(val) || 0)).toString();
    setStudentsList(prev => prev.map(s => s.id === id ? { ...s, marks: score } : s));
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert('Please complete all leave fields.');
      return;
    }
    const updated = [
      ...leavesList,
      {
        id: Date.now(),
        dateRange: `${newLeave.startDate} to ${newLeave.endDate}`,
        type: newLeave.type,
        reason: newLeave.reason,
        status: 'Pending'
      }
    ];
    setLeavesList(updated);
    setLocalStorage('shikshora_teacher_leaves', updated);
    // Also save in global leave queue so admin can approve it
    const globalLeaves = getLocalStorage('shikshora_global_leaves', []);
    globalLeaves.push({
      id: Date.now(),
      applicantName: 'Teacher James (Physics)',
      role: 'Teacher',
      dateRange: `${newLeave.startDate} to ${newLeave.endDate}`,
      type: newLeave.type,
      reason: newLeave.reason,
      status: 'Pending'
    });
    setLocalStorage('shikshora_global_leaves', globalLeaves);

    setNewLeave({ startDate: '', endDate: '', type: 'Casual Leave', reason: '' });
    alert('Leave request submitted successfully for approval.');
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Teacher Dashboard</h1>
          <p className="text-sm text-text-muted">Manage classes, grade exam reports, and file school administrative files.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-card-border/40 p-1.5 rounded-xl border border-border/60 font-sans">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('gradebook')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'gradebook' ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'}`}
          >
            Academic Gradebook
          </button>
          <button 
            onClick={() => setActiveTab('leaves')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'leaves' ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'}`}
          >
            My Leaves
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
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
      )}

      {/* 2. GRADEBOOK VIEW */}
      {activeTab === 'gradebook' && (
        <div className="bg-card border border-border/60 p-5 rounded-2xl space-y-6 font-sans">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Interactive Student Grading Sheets</h2>
              <p className="text-xs text-text-muted">Input subject scoring marks directly. Automatically binds values to students.</p>
            </div>
          </div>

          {notice && <Alert type={notice.type} message={notice.message} />}

          {/* Filtering selection block */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-card-border/30 border border-border/40">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Target Class</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                <option value="Class 10-A">Class 10-A</option>
                <option value="Class 9-B">Class 9-B</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Graded Subject</label>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Basic Science">Basic Science</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Exam Term</label>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                <option value="Unit Test 1">Unit Test 1 (Weight: 20%)</option>
                <option value="Mid Term Exam">Mid Term Exam (Weight: 40%)</option>
                <option value="Final Term Exam">Final Term Exam (Weight: 40%)</option>
              </select>
            </div>
          </div>

          {/* Student list entries */}
          <form onSubmit={handleSaveGrades} className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card-border/20 border-b border-border/40 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 w-40 text-center">Marks Obtain (Max: 100)</th>
                    <th className="p-3 w-40">Grade Equivalent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {studentsList.map((stud) => {
                    const score = parseInt(stud.marks) || 0;
                    let grade = 'F';
                    if (score >= 90) grade = 'A+';
                    else if (score >= 80) grade = 'A';
                    else if (score >= 70) grade = 'B';
                    else if (score >= 60) grade = 'C';
                    else if (score >= 50) grade = 'D';

                    return (
                      <tr key={stud.id} className="hover:bg-card-border/10">
                        <td className="p-3 font-semibold text-text-muted">{stud.roll}</td>
                        <td className="p-3 font-bold text-foreground">{stud.name}</td>
                        <td className="p-3 text-center">
                          <input 
                            type="number"
                            value={stud.marks}
                            onChange={(e) => handleMarksChange(stud.id, e.target.value)}
                            className="w-24 h-9 text-center rounded-lg bg-input border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary"
                            placeholder="0"
                            required
                          />
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-xs font-black rounded-md ${
                            grade === 'A+' || grade === 'A' ? 'bg-green-500/10 text-green-500' :
                            grade === 'B' || grade === 'C' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                          }`}>{grade}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button type="submit" isLoading={gradebookLoading}>
                Save & Publish Grades
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 3. LEAVES REQUEST */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Form */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-base font-bold text-foreground">File New Leave Request</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Start Date" 
                  type="date" 
                  value={newLeave.startDate} 
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} 
                  required 
                />
                <Input 
                  label="End Date" 
                  type="date" 
                  value={newLeave.endDate} 
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Leave Type</label>
                <select 
                  value={newLeave.type} 
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Duty Leave">Duty Leave</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Brief Explanation</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full p-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary h-24"
                  placeholder="Explain details of application request..."
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                File Leave Request
              </Button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-base font-bold text-foreground">My Leave Logs</h3>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card-border/20 border-b border-border/40 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="p-3">Date Period</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {leavesList.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-foreground text-xs">{item.dateRange}</td>
                      <td className="p-3 text-xs">{item.type}</td>
                      <td className="p-3 text-text-muted text-xs truncate max-w-xs">{item.reason}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          item.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                          item.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
  const [activeTab, setActiveTab] = useState('overview'); // overview, billing
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  // Checkout simulation states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '4242 4242 4242 4242', expiry: '12/29', cvc: '123' });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Invoices simulation database
  const [invoicesList, setInvoicesList] = useState(() => 
    getLocalStorage('shikshora_parent_invoices', [
      { id: 'INV-2026-001', studentName: 'Alice Miller', category: 'Term 1 Tuition', amount: 2500, dueDate: '2026-08-10', status: 'Paid' },
      { id: 'INV-2026-002', studentName: 'Bobby Miller', category: 'Term 1 Tuition', amount: 2500, dueDate: '2026-09-01', status: 'Unpaid' },
      { id: 'INV-2026-003', studentName: 'Bobby Miller', category: 'Bus Transport Fee', amount: 320, dueDate: '2026-09-05', status: 'Unpaid' }
    ])
  );

  const activeChildInvoices = invoicesList.filter(inv => inv.studentName === activeChild.name);

  const handleOpenCheckout = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentSuccess(false);
    setShowCheckout(true);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setCheckoutLoading(true);
    setTimeout(() => {
      setCheckoutLoading(false);
      setPaymentSuccess(true);
      // Update invoice status
      const updated = invoicesList.map(inv => inv.id === selectedInvoice.id ? { ...inv, status: 'Paid' } : inv);
      setInvoicesList(updated);
      setLocalStorage('shikshora_parent_invoices', updated);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Parent Control Portal</h1>
          <p className="text-sm text-text-muted">Monitor child academics, daily logs, and tuition invoices.</p>
        </div>

        {/* Multi-Children Switcher & Tab selector */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 bg-card-border/40 p-1.5 rounded-xl border border-border/60 font-sans">
            <span className="text-xs font-semibold text-text-muted px-2">Child Profile:</span>
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

          <div className="flex bg-card-border/40 p-1.5 rounded-xl border border-border/60 font-sans">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-text-muted'}`}
            >
              Timeline
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'billing' ? 'bg-primary text-white' : 'text-text-muted'}`}
            >
              Fees Billing
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW VIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {/* Student Profile Card */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {activeChild.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-foreground text-base block">{activeChild.name}</span>
                <span className="text-xs text-text-muted">Roll Number: {activeChild.roll} | {activeChild.class}</span>
              </div>
            </div>
            
            <div className="border-t border-border/20 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted text-xs">Term Attendance:</span>
                <span className="font-bold text-green-500 text-xs">{activeChild.attendance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted text-xs">Fee Invoice Status:</span>
                <span className={`font-bold text-xs ${activeChildInvoices.some(i => i.status === 'Unpaid') ? 'text-orange-500' : 'text-green-500'}`}>
                  {activeChildInvoices.some(i => i.status === 'Unpaid') ? 'Pending Invoices' : 'All Paid'}
                </span>
              </div>
            </div>
          </div>

          {/* Academic & Classes History */}
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
                  <span className="text-xs text-text-muted">Published: 2 days ago | All School Announcements</span>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BILLING VIEW */}
      {activeTab === 'billing' && (
        <div className="bg-card border border-border/60 p-5 rounded-2xl space-y-4 font-sans">
          <div>
            <h2 className="text-lg font-bold text-foreground">Tuition Invoices & Payment Ledger</h2>
            <p className="text-xs text-text-muted">Review child term fees or clear outstanding bills instantly via online mock portal.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card-border/20 border-b border-border/40 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="p-3">Invoice Code</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {activeChildInvoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="p-3 font-semibold text-foreground text-xs">{inv.id}</td>
                    <td className="p-3 font-semibold text-xs">{inv.category}</td>
                    <td className="p-3 text-xs text-text-muted">{inv.dueDate}</td>
                    <td className="p-3 font-bold text-xs text-foreground">${inv.amount.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                      }`}>{inv.status}</span>
                    </td>
                    <td className="p-3 text-right">
                      {inv.status === 'Unpaid' ? (
                        <button 
                          onClick={() => handleOpenCheckout(inv)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm cursor-pointer animate-pulse"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-text-muted flex items-center justify-end gap-1"><Check className="w-3.5 h-3.5 text-green-500" /> Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STRIPE-LIKE CHECKOUT DRAWER / MODAL OVERLAY */}
      {showCheckout && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <button 
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-foreground hover:bg-card-border/30 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <form onSubmit={handleProcessPayment} className="space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Secure Payment Gateway</h3>
                    <span className="text-[10px] text-text-muted">Powered by Stripe Simulator</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card-border/30 border border-border/40 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Billing Category</span>
                    <span className="font-bold text-foreground">{selectedInvoice.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Student Name</span>
                    <span className="font-bold text-foreground">{selectedInvoice.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Invoice Reference</span>
                    <span className="font-bold text-foreground text-[10px]">{selectedInvoice.id}</span>
                  </div>
                  <div className="border-t border-border/20 pt-2 flex justify-between text-sm">
                    <span className="font-bold text-foreground">Amount Due</span>
                    <span className="font-black text-primary">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input 
                    label="Cardholder Full Name" 
                    placeholder="Enter full name" 
                    required 
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-muted block">Credit Card Details</label>
                    <div className="flex items-center bg-input border border-border/50 rounded-xl h-11 px-4 text-sm text-foreground focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                      <input 
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full bg-transparent focus:outline-none"
                        placeholder="Card Number"
                        required
                      />
                      <input 
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-12 bg-transparent text-center focus:outline-none ml-2"
                        placeholder="MM/YY"
                        required
                      />
                      <input 
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-10 bg-transparent text-center focus:outline-none ml-2"
                        placeholder="CVC"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" isLoading={checkoutLoading}>
                  Clear Invoice • ${selectedInvoice.amount.toFixed(2)}
                </Button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Transaction Approved</h3>
                  <p className="text-xs text-text-muted mt-1">Receipt reference: TXN-8492048</p>
                </div>

                <div className="p-3.5 rounded-xl bg-card-border/30 border border-border/40 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Settled Invoice</span>
                    <span className="font-semibold text-foreground">{selectedInvoice.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cleared Amount</span>
                    <span className="font-bold text-green-500">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Charged Date</span>
                    <span className="text-foreground">{new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      alert('⚡ Simulated Action: Formatted PDF Invoice Receipt generated and downloaded.');
                    }}
                    className="flex-grow px-4 py-2 border border-border/60 hover:bg-card-border/20 text-xs font-bold rounded-xl text-foreground cursor-pointer flex justify-center items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download PDF Receipt
                  </button>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 3. STUDENT PORTAL ====================
export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, reportCard, leaves
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Optics Lab Report', subject: 'Physics', due: 'Today, 23:59', status: 'Pending' },
    { id: 2, title: 'Algebra Equations', subject: 'Math', due: 'In 3 days', status: 'Completed' }
  ]);

  // Report Card statistics
  const [examResults] = useState([
    { id: 1, subject: 'Physics', marks: '88', grade: 'A', remarks: 'Excellent spatial logic.' },
    { id: 2, subject: 'Mathematics', marks: '92', grade: 'A+', remarks: 'Superior calculus understanding.' },
    { id: 3, subject: 'Chemistry', marks: '84', grade: 'A', remarks: 'Good lab report formatting.' },
    { id: 4, subject: 'English', marks: '78', grade: 'B', remarks: 'Needs to expand vocabulary structure.' }
  ]);

  // Leaves States
  const [leavesList, setLeavesList] = useState(() => 
    getLocalStorage('shikshora_student_leaves', [
      { id: 1, dateRange: '2026-08-10 to 2026-08-11', type: 'Sick Leave', reason: 'Fever rest', status: 'Approved' }
    ])
  );
  const [newLeave, setNewLeave] = useState({ startDate: '', endDate: '', type: 'Sick Leave', reason: '' });

  const handleToggleAssignment = (id) => {
    setAssignments(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'Completed' ? 'Pending' : 'Completed' } : a
    ));
  };

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      alert('Please fill in leave dates and reason.');
      return;
    }
    const updated = [
      ...leavesList,
      {
        id: Date.now(),
        dateRange: `${newLeave.startDate} to ${newLeave.endDate}`,
        type: newLeave.type,
        reason: newLeave.reason,
        status: 'Pending'
      }
    ];
    setLeavesList(updated);
    setLocalStorage('shikshora_student_leaves', updated);
    
    // Add in global queue
    const globalLeaves = getLocalStorage('shikshora_global_leaves', []);
    globalLeaves.push({
      id: Date.now(),
      applicantName: 'Student Alice Miller (Class 10-A)',
      role: 'Student',
      dateRange: `${newLeave.startDate} to ${newLeave.endDate}`,
      type: newLeave.type,
      reason: newLeave.reason,
      status: 'Pending'
    });
    setLocalStorage('shikshora_global_leaves', globalLeaves);

    setNewLeave({ startDate: '', endDate: '', type: 'Sick Leave', reason: '' });
    alert('Leave request submitted successfully for approval.');
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/30 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Workspace</h1>
          <p className="text-sm text-text-muted">Access assignment checkers, print reports, or schedule leave requests.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-card-border/40 p-1.5 rounded-xl border border-border/60 font-sans">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'}`}
          >
            My Timeline
          </button>
          <button 
            onClick={() => setActiveTab('reportCard')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'reportCard' ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'}`}
          >
            Report Card
          </button>
          <button 
            onClick={() => setActiveTab('leaves')} 
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'leaves' ? 'bg-primary text-white' : 'text-text-muted hover:text-foreground'}`}
          >
            File Leave
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Assignments checklist */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Assignments Checklist</span>
            </h3>
            <div className="space-y-3">
              {assignments.map((ass) => (
                <div key={ass.id} className="p-4 rounded-xl bg-card-border/30 border border-border/40 flex justify-between items-center hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleAssignment(ass.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        ass.status === 'Completed' ? 'bg-primary border-primary text-white' : 'border-border/80 hover:border-primary'
                      }`}
                    >
                      {ass.status === 'Completed' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <span className={`font-bold text-sm block ${ass.status === 'Completed' ? 'line-through text-text-muted' : 'text-foreground'}`}>{ass.title}</span>
                      <span className="text-xs text-text-muted">{ass.subject} • Due: {ass.due}</span>
                    </div>
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

          {/* Quick Info details */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span>Timetable Overview</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-card-border/30 border border-border/40 rounded-xl">
                <span className="font-bold text-foreground block">Period 1: Physics</span>
                <span className="text-text-muted">09:00 - 09:45 | Lab 2</span>
              </div>
              <div className="p-3 bg-card-border/30 border border-border/40 rounded-xl">
                <span className="font-bold text-foreground block">Period 2: Chemistry</span>
                <span className="text-text-muted">09:50 - 10:35 | Room 104</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CARD TAB */}
      {activeTab === 'reportCard' && (
        <div className="bg-card border border-border/60 p-6 rounded-2xl space-y-6 font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span>Academic Record Card</span>
              </h2>
              <span className="text-xs text-text-muted">Active Term: Academic Session 2026 • Term 1 Midterms</span>
            </div>

            <button 
              onClick={() => alert('⚡ Simulated Action: Formatted PDF Report Card generated and downloaded.')}
              className="flex items-center gap-1.5 px-4 py-2 border border-border/60 hover:bg-card-border/20 text-xs font-bold rounded-xl text-foreground cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" /> Download PDF Card
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card-border/20 border-b border-border/40 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="p-3">Course / Subject</th>
                  <th className="p-3 text-center">Score (100)</th>
                  <th className="p-3 text-center">Letter Grade</th>
                  <th className="p-3">Faculty Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {examResults.map((res) => (
                  <tr key={res.id}>
                    <td className="p-3 font-bold text-foreground">{res.subject}</td>
                    <td className="p-3 text-center font-semibold">{res.marks}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 text-xs font-black rounded-md ${
                        res.grade.includes('A') ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>{res.grade}</span>
                    </td>
                    <td className="p-3 text-text-muted text-xs">{res.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-card-border/30 border border-border/40 text-xs text-center">
            <div>
              <span className="text-text-muted block">Aggregated Percentage</span>
              <span className="text-base font-black text-foreground">85.5%</span>
            </div>
            <div>
              <span className="text-text-muted block">Term Attendance Rate</span>
              <span className="text-base font-black text-green-500">96.0%</span>
            </div>
            <div>
              <span className="text-text-muted block">Final Evaluation Status</span>
              <span className="text-base font-black text-green-500">PASSED</span>
            </div>
          </div>
        </div>
      )}

      {/* LEAVES TAB */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          {/* Submit form */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-base font-bold text-foreground">File Leave Application</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Start Date" 
                  type="date" 
                  value={newLeave.startDate} 
                  onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} 
                  required 
                />
                <Input 
                  label="End Date" 
                  type="date" 
                  value={newLeave.endDate} 
                  onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Reason Category</label>
                <select 
                  value={newLeave.type} 
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Family Outing">Family Outing / Vacation</option>
                  <option value="Medical Rest">Medical Rest</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Brief Explanation</label>
                <textarea 
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full p-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none focus:border-primary h-24"
                  placeholder="State reason of Absence..."
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Leave Application
              </Button>
            </form>
          </div>

          {/* Logs */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-base font-bold text-foreground">My Leave Logs</h3>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card-border/20 border-b border-border/40 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="p-3">Date Period</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Explanation Reason</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {leavesList.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-foreground text-xs">{item.dateRange}</td>
                      <td className="p-3 text-xs">{item.type}</td>
                      <td className="p-3 text-text-muted text-xs truncate max-w-xs">{item.reason}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                          item.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                          item.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                        }`}>{item.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
