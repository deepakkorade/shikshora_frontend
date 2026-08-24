import { useState, useEffect } from 'react';
import { Users, UserPlus, Plus, Mail, ShieldAlert } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function StaffModule() {
  const [teachers, setTeachers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('teachers'); // teachers, employees
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Modals
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

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
      loadStaffData();
    } catch (err) {
      alert(err.message || 'Failed to create teacher.');
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
      loadStaffData();
    } catch (err) {
      alert(err.message || 'Failed to register employee.');
    }
  };

  if (loading) return <div className="text-center py-8">Loading faculty directory...</div>;

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Faculty & Employees Directory</h2>
          <p className="text-sm text-text-muted">Manage teacher accounts, class teacher assignments, accountant profiles, and support staff.</p>
        </div>
        <div className="flex gap-2">
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
                {teachers.map((t) => (
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
                {employees.map((emp) => (
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
    </div>
  );
}
