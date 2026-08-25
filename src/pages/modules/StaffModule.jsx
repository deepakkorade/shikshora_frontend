import { useState, useEffect } from 'react';
import { Users, UserPlus, Plus, Mail, ShieldAlert, FileText, Upload, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';

export default function StaffModule() {
  const [teachers, setTeachers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('teachers'); // teachers, employees
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const triggerSuccess = (msg) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Form Modals
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // CSV Bulk Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState(1); // 1: dropzone, 2: progress, 3: mapping, 4: success
  const [isImporting, setIsImporting] = useState(false);

  // Form Fields
  const [newTeacher, setNewTeacher] = useState({
    name: '', email: '', password: '', phone: '', employeeId: '', qualification: '', joiningDate: ''
  });

  const [newEmployee, setNewEmployee] = useState({
    name: '', email: '', password: '', phone: '', employeeId: '', department: 'Finance', designation: 'Accountant', qualification: '', joiningDate: '', roleName: 'Accountant'
  });

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const teachList = await api.get('/staff/teachers');
      setTeachers(teachList);

      const empList = await api.get('/staff/employees');
      setEmployees(empList);
    } catch (err) {
      setError(err.message || 'Failed to load staff records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/teachers', newTeacher);
      setShowTeacherModal(false);
      setNewTeacher({ name: '', email: '', password: '', phone: '', employeeId: '', qualification: '', joiningDate: '' });
      triggerSuccess('Teacher onboarding successful!');
      loadStaffData();
    } catch (err) {
      setError(err.message || 'Failed to create teacher.');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/employees', newEmployee);
      setShowEmployeeModal(false);
      setNewEmployee({
        name: '', email: '', password: '', phone: '', employeeId: '', department: 'Finance', designation: 'Accountant', qualification: '', joiningDate: '', roleName: 'Accountant'
      });
      triggerSuccess('Employee onboarding successful!');
      loadStaffData();
    } catch (err) {
      setError(err.message || 'Failed to register employee.');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentTeachers = teachers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesTeachers = Math.ceil(teachers.length / itemsPerPage);

  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPagesEmployees = Math.ceil(employees.length / itemsPerPage);

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
      if (activeSubTab === 'teachers') {
        setTeachers(prev => [
          {
            id: Date.now(),
            employeeId: 'EMP-T-987',
            User: { name: 'Dr. John Watson (CSV)', email: 'watson@school.com' },
            qualification: 'Ph.D. in Literature',
            joiningDate: '2026-08-20',
            status: 'Active'
          },
          ...prev
        ]);
      } else {
        setEmployees(prev => [
          {
            id: Date.now(),
            employeeId: 'EMP-S-988',
            User: { name: 'Sherlock Holmes (CSV)', email: 'holmes@school.com' },
            qualification: 'Diploma in Security Science',
            designation: 'Warden / Guard',
            joiningDate: '2026-08-22',
            status: 'Active'
          },
          ...prev
        ]);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border/20 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Faculty & Employees Directory</h2>
          <p className="text-sm text-text-muted">Manage teacher accounts, class teacher assignments, accountant profiles, and support staff.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setImportStep(1);
              setImportFile(null);
              setImportProgress(0);
              setShowImportModal(true);
            }}
            className="px-4 py-2 border border-border/60 hover:bg-card-border/20 text-xs font-bold rounded-xl text-foreground flex items-center gap-1 cursor-pointer font-sans"
          >
            <FileText className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          {activeSubTab === 'teachers' ? (
            <Button onClick={() => setShowTeacherModal(true)} size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Teacher
            </Button>
          ) : (
            <Button onClick={() => setShowEmployeeModal(true)} size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          )}
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Tabs selectors */}
      <div className="flex gap-2 border-b border-border/40 pb-px">
        {['teachers', 'employees'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2.5 font-semibold text-sm capitalize transition-all border-b-2 cursor-pointer ${
              activeSubTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: TEACHERS */}
      {activeSubTab === 'teachers' && (
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Teacher Profile</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {currentTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-card-border/10">
                    <td className="py-3.5 px-4 font-bold text-foreground">{t.employeeId}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-foreground block">{t.User?.name}</span>
                      <span className="text-xs text-text-muted">{t.User?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">{t.qualification || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-text-muted">{t.joiningDate ? new Date(t.joiningDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-text-muted">No teachers registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPagesTeachers > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
              <span className="text-xs text-text-muted">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, teachers.length)} of {teachers.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-semibold hover:bg-card-border/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-foreground font-sans"
                >
                  Previous
                </button>
                {Array.from({ length: totalPagesTeachers }, (_, i) => i + 1).map(p => (
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
                  disabled={currentPage === totalPagesTeachers}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesTeachers))}
                  className="px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-semibold hover:bg-card-border/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-foreground font-sans"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: EMPLOYEES */}
      {activeSubTab === 'employees' && (
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Employee Profile</th>
                  <th className="py-3 px-4">Dept & Designation</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {currentEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-card-border/10">
                    <td className="py-3.5 px-4 font-bold text-foreground">{emp.employeeId}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-foreground block">{emp.User?.name}</span>
                      <span className="text-xs text-text-muted">{emp.User?.email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-foreground block">{emp.designation}</span>
                      <span className="text-xs text-text-muted">Dept: {emp.department}</span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-text-muted">No staff employees registered.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPagesEmployees > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
              <span className="text-xs text-text-muted">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, employees.length)} of {employees.length} entries
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-semibold hover:bg-card-border/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-foreground font-sans"
                >
                  Previous
                </button>
                {Array.from({ length: totalPagesEmployees }, (_, i) => i + 1).map(p => (
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
                  disabled={currentPage === totalPagesEmployees}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesEmployees))}
                  className="px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-semibold hover:bg-card-border/20 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer text-foreground font-sans"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD TEACHER */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Faculty Teacher</h3>
              <button onClick={() => setShowTeacherModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <Input label="Teacher Full Name *" value={newTeacher.name} onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })} required />
              <Input label="Email Address *" type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} required />
              <Input label="Login Password *" type="password" value={newTeacher.password} onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })} required />
              <Input label="Employee ID (Unique) *" value={newTeacher.employeeId} onChange={(e) => setNewTeacher({ ...newTeacher, employeeId: e.target.value })} placeholder="e.g. TCH-092" required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Qualification / Degrees" value={newTeacher.qualification} onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })} placeholder="M.Sc Physics" />
                <Input label="Joining Date" type="date" value={newTeacher.joiningDate} onChange={(e) => setNewTeacher({ ...newTeacher, joiningDate: e.target.value })} />
              </div>
              <Input label="Phone Number" value={newTeacher.phone} onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })} />
              <Button type="submit">Onboard Teacher</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD OTHER EMPLOYEES */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Staff Employee</h3>
              <button onClick={() => setShowEmployeeModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <Input label="Employee Name *" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} required />
              <Input label="Email Address *" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
              <Input label="Login Password *" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} required />
              <Input label="Employee ID *" value={newEmployee.employeeId} onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })} placeholder="e.g. EMP-081" required />
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Department *</label>
                  <select value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} className="w-full h-11 px-2.5 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Library">Library</option>
                    <option value="Admissions">Admissions</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Designation *</label>
                  <select value={newEmployee.designation} onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })} className="w-full h-11 px-2.5 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                    <option value="Accountant">Accountant</option>
                    <option value="Transport Manager">Transport Manager</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Admission Counsellor">Admission Counsellor</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">ERP Role *</label>
                  <select value={newEmployee.roleName} onChange={(e) => setNewEmployee({ ...newEmployee, roleName: e.target.value })} className="w-full h-11 px-2.5 rounded-xl bg-input border border-border/50 text-xs text-foreground focus:outline-none">
                    <option value="Accountant">Accountant</option>
                    <option value="Transport Manager">Transport Manager</option>
                    <option value="Librarian">Librarian</option>
                    <option value="Admission Counsellor">Admission Counsellor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Qualification" value={newEmployee.qualification} onChange={(e) => setNewEmployee({ ...newEmployee, qualification: e.target.value })} />
                <Input label="Joining Date" type="date" value={newEmployee.joiningDate} onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })} />
              </div>
              <Button type="submit">Onboard Employee</Button>
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
                  <h3 className="font-bold text-foreground text-sm">Staff CSV Bulk Importer</h3>
                  <span className="text-[10px] text-text-muted">Onboard teachers or employees in bulk via spreadsheet</span>
                </div>
              </div>

              {importStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-text-muted">
                    Please upload your CSV file matching standard columns: Employee ID, Full Name, Email, Department, Qualification, and Joining Date.
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
                    onClick={() => alert('⚡ Simulated Action: Sample staff_onboarding_template.csv template file downloaded.')}
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
                    <span>File parsed successfully: 1 staff record detected.</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-foreground">Verify CSV Headers Mapping:</span>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-border/30 rounded-xl p-2 bg-card-border/10">
                      {[
                        { csv: 'employee_id', matches: 'Employee ID' },
                        { csv: 'full_name', matches: 'Full Name' },
                        { csv: 'email_address', matches: 'Email Address' },
                        { csv: 'qualification', matches: 'Degree/Qualification' },
                        { csv: 'joining_date', matches: 'Onboarding Date' }
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
                    <p className="text-xs text-text-muted mt-1">New accounts have been created and bound to the payroll registry.</p>
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
