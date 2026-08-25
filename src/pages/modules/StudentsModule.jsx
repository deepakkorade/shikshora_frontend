import { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, RefreshCw, UserCheck, ShieldAlert, Award, FileText, CheckCircle2, Upload, X, Check } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';

export default function StudentsModule() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const triggerSuccess = (msg) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  // Profile Detail Panel state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [profileHistory, setProfileHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [profileTab, setProfileTab] = useState('attendance'); // attendance, fees, exams

  // Promotion/Status modal states
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteForm, setPromoteForm] = useState({ academicYearId: '', classId: '', sectionId: '', rollNumber: '' });
  const [sectionsList, setSectionsList] = useState([]);

  // CSV Bulk Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState(1); // 1: dropzone, 2: progress, 3: columns mapping, 4: success
  const [isImporting, setIsImporting] = useState(false);

  const loadStudentsData = async () => {
    setLoading(true);
    try {
      const studs = await api.get('/students');
      setStudents(studs);
      
      const clsData = await api.get('/academics/classes');
      setClasses(clsData);
      
      const yearData = await api.get('/academics/years');
      setYears(yearData);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsData();
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setHistoryLoading(true);
    setProfileTab('attendance');
    try {
      const data = await api.get(`/students/${student.id}`);
      setProfileHistory(data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateStatus = async (studentId, status) => {
    try {
      await api.put(`/students/${studentId}/status`, { status });
      triggerSuccess(`Student marked as ${status} successfully.`);
      loadStudentsData();
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(prev => ({ ...prev, status }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update student status');
    }
  };

  const handleOpenPromote = (student) => {
    setSelectedStudent(student);
    setPromoteForm({ academicYearId: '', classId: '', sectionId: '', rollNumber: student.rollNumber || '' });
    setSectionsList([]);
    setShowPromoteModal(true);
  };

  const handlePromoteClassChange = (classId) => {
    setPromoteForm(prev => ({ ...prev, classId, sectionId: '' }));
    const targetClass = classes.find(c => c.id === parseInt(classId));
    setSectionsList(targetClass ? targetClass.Sections || [] : []);
  };

  const handlePromoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/students/${selectedStudent.id}/promote`, promoteForm);
      triggerSuccess('Student successfully promoted to new academic class!');
      setShowPromoteModal(false);
      loadStudentsData();
    } catch (err) {
      setError(err.message || 'Promotion failed.');
    }
  };

  // Filter students based on search query and class select filter
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.User?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          s.admissionNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter ? s.currentClassId === parseInt(classFilter) : true;
    return matchesSearch && matchesClass;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, classFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  if (loading) return <div className="p-6"><Skeleton.Page /></div>;

  const handleSimulateCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setImportStep(2);
    setImportProgress(0);

    let pct = 0;
    const interval = setInterval(() => {
      pct += 10;
      setImportProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        setImportStep(3);
      }
    }, 150);
  };

  const handleProcessImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      setImportStep(4);
      // Inject two simulated imported students to show the UI list actually updates
      setStudents(prev => [
        {
          id: Date.now(),
          admissionNumber: 'ADM-2026-905',
          rollNumber: '42',
          status: 'Active',
          User: { name: 'John Doe (CSV)' },
          Parent: { fatherName: 'Robert Doe' },
          CurrentClass: { name: 'Class 10' },
          CurrentSection: { name: 'Section A' },
          currentClassId: 10
        },
        {
          id: Date.now() + 1,
          admissionNumber: 'ADM-2026-906',
          rollNumber: '43',
          status: 'Active',
          User: { name: 'Jane Smith (CSV)' },
          Parent: { fatherName: 'Arthur Smith' },
          CurrentClass: { name: 'Class 9' },
          CurrentSection: { name: 'Section B' },
          currentClassId: 9
        },
        ...prev
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground font-sans">Student Registry</h2>
          <p className="text-sm text-text-muted">Manage active student rosters, promote students, and view student history.</p>
        </div>
        <button
          onClick={() => {
            setImportStep(1);
            setImportFile(null);
            setImportProgress(0);
            setShowImportModal(true);
          }}
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer font-sans"
        >
          <FileText className="w-4 h-4" />
          <span>Import CSV</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Main Grid: Directory + Profiles */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Directory List (takes 2 columns if profiles are open, else full width) */}
        <div className={`space-y-4 ${selectedStudent ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          
          {/* Search Filters */}
          <div className="flex flex-col sm:flex-row gap-3 bg-card border border-border/60 p-4 rounded-2xl">
            <div className="relative flex-grow">
              <Search className="w-4.5 h-4.5 text-text-muted absolute left-3 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or admission number..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-input border border-border/40 text-sm text-foreground focus:outline-none"
              />
            </div>

            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-11 px-4 rounded-xl bg-input border border-border/40 text-sm text-foreground focus:outline-none w-44 shrink-0"
            >
              <option value="">-- All Classes --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Directory Table */}
          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                    <th className="py-3 px-4">ADM No. / Roll</th>
                    <th className="py-3 px-4">Student Profile</th>
                    <th className="py-3 px-4">Class Room</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {currentStudents.map((s) => (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-card-border/10 cursor-pointer ${selectedStudent?.id === s.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                      onClick={() => handleSelectStudent(s)}
                    >
                      <td className="py-3 px-4 font-semibold text-foreground">
                        <span className="block">{s.admissionNumber}</span>
                        <span className="text-[10px] text-text-muted">Roll: #{s.rollNumber || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground block">{s.User?.name}</span>
                        <span className="text-xs text-text-muted">Parent: {s.Parent?.fatherName || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {s.CurrentClass?.name} - {s.CurrentSection?.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                          s.status === 'Alumni' ? 'bg-primary/10 text-primary' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {s.status === 'Active' && (
                            <>
                              <button
                                onClick={() => handleOpenPromote(s)}
                                className="p-1 rounded border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 cursor-pointer flex items-center gap-1"
                                title="Promote Student"
                              >
                                <RefreshCw className="w-3 h-3 animate-spin-slow" /> Promote
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(s.id, 'Alumni')}
                                className="p-1 rounded border border-border hover:bg-card-border text-text-muted text-[10px] font-bold px-2 py-1 cursor-pointer"
                              >
                                Alumni
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-text-muted">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
                <span className="text-xs text-text-muted">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                </span>
                <div className="flex gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-semibold hover:bg-card-border/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-foreground font-sans"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        currentPage === p
                          ? 'bg-primary border-primary text-white font-bold'
                          : 'border-border/50 hover:bg-card-border/20 text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-semibold hover:bg-card-border/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-foreground font-sans"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: 360-Degree Profile Panel */}
        {selectedStudent && (
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-6 animate-slideIn">
            <div className="flex justify-between items-start border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg">
                  {selectedStudent.User?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-foreground text-sm block">{selectedStudent.User?.name}</h4>
                  <span className="text-[10px] uppercase font-bold text-text-muted">{selectedStudent.admissionNumber}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="text-text-muted hover:text-foreground text-sm font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Profile Tab selectors */}
            <div className="flex gap-2 border-b border-border/30 pb-px text-xs">
              {['attendance', 'fees', 'exams'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setProfileTab(tab)}
                  className={`pb-2 px-1 font-semibold capitalize transition-all border-b-2 cursor-pointer ${
                    profileTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {historyLoading ? (
              <div className="py-8 text-center text-xs text-text-muted">Loading logs...</div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 text-xs">
                
                {/* Attendance Tab */}
                {profileTab === 'attendance' && (
                  <div className="space-y-2.5">
                    {profileHistory?.attendance?.map((att) => (
                      <div key={att.id} className="flex justify-between items-center p-3.5 bg-card-border/30 border border-border/40 rounded-xl">
                        <div>
                          <span className="font-semibold text-foreground text-xs block">{new Date(att.date).toLocaleDateString()}</span>
                          {att.remarks && <span className="text-[10px] text-text-muted">{att.remarks}</span>}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          att.status === 'Present' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    ))}
                    {(!profileHistory?.attendance || profileHistory.attendance.length === 0) && (
                      <span className="text-text-muted italic block py-4 text-center">No attendance marked.</span>
                    )}
                  </div>
                )}

                {/* Fees Invoices Tab */}
                {profileTab === 'fees' && (
                  <div className="space-y-2.5">
                    {profileHistory?.invoices?.map((inv) => (
                      <div key={inv.id} className="p-3 bg-card-border/30 border border-border/40 rounded-xl space-y-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-foreground">Inv: #{inv.invoiceNumber}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-text-muted">
                          <span>Amount: ${inv.totalAmount}</span>
                          <span>Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {(!profileHistory?.invoices || profileHistory.invoices.length === 0) && (
                      <span className="text-text-muted italic block py-4 text-center">No invoices generated yet.</span>
                    )}
                  </div>
                )}

                {/* Exams Results Tab */}
                {profileTab === 'exams' && (
                  <div className="space-y-2.5">
                    {profileHistory?.examResults?.map((res) => (
                      <div key={res.id} className="p-3 bg-card-border/30 border border-border/40 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-foreground text-xs block">{res.ExamSubject?.Exam?.name}</span>
                          <span className="text-[10px] text-text-muted">Grade: {res.grade || 'N/A'}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary block">{res.marksObtained} Marks</span>
                          <span className="text-[9px] text-text-muted">({res.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                    {(!profileHistory?.examResults || profileHistory.examResults.length === 0) && (
                      <span className="text-text-muted italic block py-4 text-center">No exam results recorded.</span>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>

      {/* PROMOTION DIALOG */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Promote Student Class</h3>
              <button onClick={() => setShowPromoteModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handlePromoteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Academic Term *</label>
                <select 
                  value={promoteForm.academicYearId} 
                  onChange={(e) => setPromoteForm({ ...promoteForm, academicYearId: e.target.value })} 
                  className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">-- Choose Year --</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Promoted Class *</label>
                <select 
                  value={promoteForm.classId} 
                  onChange={(e) => handlePromoteClassChange(e.target.value)} 
                  className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Promoted Section *</label>
                <select 
                  value={promoteForm.sectionId} 
                  onChange={(e) => setPromoteForm({ ...promoteForm, sectionId: e.target.value })} 
                  className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none"
                  disabled={!promoteForm.classId}
                  required
                >
                  <option value="">-- Choose Section --</option>
                  {sectionsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <Input label="New Roll Number" value={promoteForm.rollNumber} onChange={(e) => setPromoteForm({ ...promoteForm, rollNumber: e.target.value })} />

              <Button type="submit">Promote Student</Button>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT DIALOG */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-left">
          <div className="bg-card border border-border/80 rounded-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowImportModal(false)} 
              className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-foreground hover:bg-card-border/30 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Student CSV Bulk Importer</h3>
                  <span className="text-[10px] text-text-muted">Onboard students in bulk via Excel spreadsheets</span>
                </div>
              </div>

              {importStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-text-muted">
                    Please prepare your CSV list following the template. Make sure columns like Student Name, Email, Class, Section, and Roll No are present.
                  </p>
                  
                  {/* File Dropzone */}
                  <label className="border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-card-border/10">
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleSimulateCSVUpload} 
                      className="hidden" 
                    />
                    <Upload className="w-8 h-8 text-text-muted" />
                    <span className="text-xs font-bold text-foreground">Click to browse or drop CSV file</span>
                    <span className="text-[10px] text-text-muted">Max file size allowed: 5MB</span>
                  </label>

                  <button 
                    onClick={() => alert('⚡ Simulated Action: Sample students_onboarding_template.csv template file downloaded.')}
                    className="w-full text-center text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Download CSV Onboarding Template
                  </button>
                </div>
              )}

              {importStep === 2 && (
                <div className="py-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto text-primary animate-pulse">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Uploading {importFile?.name}...</span>
                    <span className="text-[10px] text-text-muted block mt-0.5">Reading spreadsheet byte matrices</span>
                  </div>
                  <div className="w-full h-2 bg-input rounded-full overflow-hidden border border-border/30">
                    <div 
                      className="bg-primary h-full transition-all duration-150"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-text-muted">{importProgress}% completed</span>
                </div>
              )}

              {importStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-500 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>File parsed successfully: 2 student records detected.</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground">Verify CSV Headers Mapping:</span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border/30 rounded-xl p-2 bg-card-border/10">
                      {[
                        { csv: 'student_name', matches: 'Student Full Name' },
                        { csv: 'parent_father', matches: 'Father Name' },
                        { csv: 'grade_class', matches: 'Class Level' },
                        { csv: 'sec_code', matches: 'Section Code' },
                        { csv: 'student_roll', matches: 'Roll Number' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-card border border-border/40 rounded-lg">
                          <span className="font-mono text-text-muted">{item.csv}</span>
                          <span className="text-primary font-bold">➡️ {item.matches}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/20">
                    <button 
                      onClick={() => setImportStep(1)} 
                      className="px-4 py-2 border border-border hover:bg-card-border/20 text-xs font-bold rounded-xl text-foreground cursor-pointer"
                    >
                      Back
                    </button>
                    <Button 
                      onClick={handleProcessImport} 
                      isLoading={isImporting} 
                      className="flex-grow"
                    >
                      Import Verified Records
                    </Button>
                  </div>
                </div>
              )}

              {importStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">Onboarding Complete</h3>
                    <p className="text-xs text-text-muted mt-1">2 new student accounts have been created and bound to class sectors.</p>
                  </div>
                  <button 
                    onClick={() => setShowImportModal(false)}
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Return to Directory
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
