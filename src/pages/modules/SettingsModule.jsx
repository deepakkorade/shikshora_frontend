import { useState, useEffect } from 'react';
import { 
  Building, MapPin, Users, Mail, Phone, Plus, Edit2, 
  Trash2, RefreshCw, Key, ShieldCheck, Check, Info, Server,
  Lock, Settings, Briefcase, Award, GraduationCap, X, Sliders, ArrowRight
} from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function SettingsModule() {
  const [schools, setSchools] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cascade Selection States
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Drawer Controls
  // mode: null | 'view-school' | 'edit-school' | 'create-school' | 'view-branch' | 'edit-branch' | 'create-branch' | 'view-user' | 'edit-user' | 'create-user'
  const [drawerMode, setDrawerMode] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null);

  // Form Fields State
  const [schoolForm, setSchoolForm] = useState({ name: '', email: '', phone: '', address: '', city: '', country: 'USA', regNumber: '', type: 'K-12' });
  const [branchForm, setBranchForm] = useState({ schoolId: '', name: '', code: '', email: '', phone: '', address: '', city: '' });
  const [userForm, setUserForm] = useState({ schoolId: '', branchId: '', name: '', email: '', phone: '', password: '', role: 'Teacher' });

  const loadSettingsData = async (initial = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get('/superadmin/schools');
      setSchools(data);
      
      const flatBranches = [];
      const flatUsers = [];
      
      data.forEach(s => {
        if (s.Branches) {
          s.Branches.forEach(b => flatBranches.push({ ...b, schoolName: s.name }));
        }
        if (s.Users) {
          s.Users.forEach(u => {
            flatUsers.push({ ...u, schoolName: s.name, role: u.Role ? u.Role.name : 'Unknown' });
          });
        }
      });

      setBranches(flatBranches);
      setUsers(flatUsers);

      // Default cascade selections
      if (initial && data.length > 0) {
        setSelectedSchool(data[0]);
        if (data[0].Branches && data[0].Branches.length > 0) {
          setSelectedBranch(data[0].Branches[0]);
        }
      } else {
        // Keep active selection in sync
        if (selectedSchool) {
          const updatedSchool = data.find(s => s.id === selectedSchool.id);
          if (updatedSchool) {
            setSelectedSchool(updatedSchool);
            if (selectedBranch) {
              const updatedBranch = updatedSchool.Branches?.find(b => b.id === selectedBranch.id);
              if (updatedBranch) setSelectedBranch(updatedBranch);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to sync hierarchy structure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData(true);
  }, []);

  const triggerSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setDrawerItem(null);
    setSchoolForm({ name: '', email: '', phone: '', address: '', city: '', country: 'USA', regNumber: '', type: 'K-12' });
    setBranchForm({ schoolId: '', name: '', code: '', email: '', phone: '', address: '', city: '' });
    setUserForm({ schoolId: '', branchId: '', name: '', email: '', phone: '', password: '', role: 'Teacher' });
  };

  const openCreateDrawer = (type) => {
    setDrawerItem(null);
    setDrawerMode(`create-${type}`);
    if (type === 'branch') {
      setBranchForm({ schoolId: selectedSchool?.id || '', name: '', code: '', email: '', phone: '', address: '', city: '' });
    } else if (type === 'user') {
      setUserForm({ schoolId: selectedSchool?.id || '', branchId: selectedBranch?.id || '', name: '', email: '', phone: '', password: '', role: 'Teacher' });
    }
  };

  const openViewDrawer = (type, item) => {
    setDrawerItem(item);
    setDrawerMode(`view-${type}`);
  };

  const startEditFromView = (type) => {
    setDrawerMode(`edit-${type}`);
    if (type === 'school') {
      setSchoolForm(drawerItem);
    } else if (type === 'branch') {
      setBranchForm(drawerItem);
    } else {
      setUserForm({ ...drawerItem, password: '' });
    }
  };

  // CRUD API Calls
  const handleSaveSchool = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (drawerMode.startsWith('edit')) {
        await api.put(`/superadmin/schools/${drawerItem.id}`, schoolForm);
        triggerSuccess('School profile updated successfully.');
      } else {
        await api.post('/auth/register-school', {
          schoolName: schoolForm.name,
          regNumber: schoolForm.regNumber,
          schoolType: schoolForm.type,
          email: schoolForm.email,
          phone: schoolForm.phone,
          address: schoolForm.address,
          city: schoolForm.city,
          country: schoolForm.country,
          adminEmail: `admin_${Date.now()}@shikshora.com`,
          adminPassword: 'admin123',
          subscriptionPlan: 'Starter'
        });
        triggerSuccess('New school tenant registered successfully.');
      }
      closeDrawer();
      loadSettingsData();
    } catch (err) {
      setError(err.message || 'Failed to save school.');
    }
  };

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (drawerMode.startsWith('edit')) {
        await api.put(`/superadmin/branches/${drawerItem.id}`, branchForm);
        triggerSuccess('Branch configuration updated.');
      } else {
        await api.post(`/superadmin/schools/${branchForm.schoolId || selectedSchool?.id}/branches`, branchForm);
        triggerSuccess('New branch successfully added.');
      }
      closeDrawer();
      loadSettingsData();
    } catch (err) {
      setError(err.message || 'Failed to save branch.');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...userForm,
        schoolId: userForm.schoolId || selectedSchool?.id,
        branchId: userForm.branchId || selectedBranch?.id
      };
      if (drawerMode.startsWith('edit')) {
        await api.put(`/superadmin/users/${drawerItem.id}`, payload);
        triggerSuccess('User permissions updated successfully.');
      } else {
        await api.post('/superadmin/users', payload);
        triggerSuccess('User credentials created and provisioned.');
      }
      closeDrawer();
      loadSettingsData();
    } catch (err) {
      setError(err.message || 'Failed to save user account.');
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!confirm(`CAUTION: Deleting this ${type} is permanent and will cascade delete nested objects.`)) return;
    setError(null);
    try {
      if (type === 'school') {
        await api.delete(`/superadmin/schools/${id}`);
        setSelectedSchool(null);
        setSelectedBranch(null);
      } else if (type === 'branch') {
        await api.delete(`/superadmin/branches/${id}`);
        setSelectedBranch(null);
      } else {
        await api.delete(`/superadmin/users/${id}`);
      }
      triggerSuccess(`${type} removed from database.`);
      closeDrawer();
      loadSettingsData(true);
    } catch (err) {
      setError(err.message || `Failed to delete ${type}.`);
    }
  };

  // Filter Cascade items
  const activeBranches = branches.filter(b => b.schoolId === selectedSchool?.id);
  const activeUsers = users.filter(u => u.branchId === selectedBranch?.id);

  if (loading && schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-text-muted">Loading directory dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fadeIn font-sans h-[calc(100vh-140px)] flex flex-col relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-border/40 pb-3 shrink-0">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Access Directory Canvas</h2>
          <p className="text-xs text-text-muted">Perform cascading setups across schools, physical campuses, and user credentials.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCreateDrawer('school')} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add School
          </Button>
          <button onClick={() => loadSettingsData()} className="p-2 border border-border/60 hover:bg-card-border rounded-xl text-text-muted cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold flex items-center gap-1.5 shrink-0">
          <Check className="w-3.5 h-3.5" /> {success}
        </div>
      )}
      {error && <Alert type="error" message={error} />}

      {/* THREE COLUMN CASCADE WORKSPACE (Sleek side-by-side flex layout) */}
      <div className="flex-grow flex items-stretch gap-4 overflow-x-auto pb-4 shrink">
        
        {/* COLUMN 1: SCHOOL TENANTS */}
        <div className="w-80 flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden shrink-0">
          <div className="p-3 bg-card-border/10 border-b border-border/30 flex justify-between items-center">
            <span className="font-extrabold text-[10px] uppercase tracking-wider text-text-muted">1. School Workspace</span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">{schools.length} Total</span>
          </div>
          <div className="p-3 overflow-y-auto space-y-2 flex-grow">
            {schools.map(s => {
              const isSelected = selectedSchool?.id === s.id;
              return (
                <div 
                  key={s.id}
                  onClick={() => { setSelectedSchool(s); setSelectedBranch(s.Branches?.[0] || null); }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-24 ${
                    isSelected 
                      ? 'bg-primary/5 border-primary text-primary shadow' 
                      : 'border-border/60 hover:border-border/80 bg-card-border/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-foreground block truncate max-w-[190px]">{s.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openViewDrawer('school', s); }}
                      className="p-1 hover:bg-card-border rounded text-text-muted cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-2 text-[9px] text-text-muted">
                    <span className="font-bold tracking-wider">{s.type}</span>
                    <span>Branches: {s.Branches?.length || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: CAMPUS BRANCHES */}
        <div className="w-80 flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden shrink-0">
          <div className="p-3 bg-card-border/10 border-b border-border/30 flex justify-between items-center">
            <span className="font-extrabold text-[10px] uppercase tracking-wider text-text-muted">2. Campus Satellites</span>
            {selectedSchool && (
              <button 
                onClick={() => openCreateDrawer('branch')}
                className="text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded cursor-pointer"
              >
                + Add
              </button>
            )}
          </div>
          <div className="p-3 overflow-y-auto space-y-2 flex-grow">
            {selectedSchool ? (
              activeBranches.map(b => {
                const isSelected = selectedBranch?.id === b.id;
                return (
                  <div 
                    key={b.id}
                    onClick={() => setSelectedBranch(b)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-24 ${
                      isSelected 
                        ? 'bg-purple-500/5 border-purple-500 text-purple-500 shadow' 
                        : 'border-border/60 hover:border-border/80 bg-card-border/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-black text-xs text-foreground block truncate max-w-[190px]">{b.name}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openViewDrawer('branch', b); }}
                        className="p-1 hover:bg-card-border rounded text-text-muted cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-end mt-2 text-[9px] text-text-muted">
                      <span className="font-bold tracking-wider font-mono">Code: {b.code}</span>
                      <span>{b.city}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-[11px] text-text-muted italic">Select a school tenant first.</div>
            )}
            {selectedSchool && activeBranches.length === 0 && (
              <div className="p-8 text-center text-[11px] text-text-muted italic border border-dashed border-border/40 rounded-xl">No branches found.</div>
            )}
          </div>
        </div>

        {/* COLUMN 3: STAFF & USER LOGINS */}
        <div className="w-80 flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden shrink-0">
          <div className="p-3 bg-card-border/10 border-b border-border/30 flex justify-between items-center">
            <span className="font-extrabold text-[10px] uppercase tracking-wider text-text-muted">3. Credentials Access</span>
            {selectedBranch && (
              <button 
                onClick={() => openCreateDrawer('user')}
                className="text-[9px] font-bold bg-primary/10 text-primary hover:bg-primary/20 px-2 py-0.5 rounded cursor-pointer"
              >
                + Add
              </button>
            )}
          </div>
          <div className="p-3 overflow-y-auto space-y-2 flex-grow">
            {selectedBranch ? (
              activeUsers.map(u => (
                <div 
                  key={u.id}
                  onClick={() => openViewDrawer('user', u)}
                  className="p-3.5 rounded-xl border border-border/60 hover:border-border/80 bg-card hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between h-24"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-black text-xs text-foreground block truncate max-w-[190px]">{u.name}</span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded-full ${
                      u.role.includes('Admin') ? 'bg-green-500/10 text-green-500' :
                      u.role.includes('Principal') ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'
                    }`}>{u.role.replace('Branch ', '')}</span>
                  </div>
                  <div className="flex justify-between items-end mt-2 text-[9px] text-text-muted">
                    <span className="truncate max-w-[140px]">{u.email}</span>
                    <span className="font-bold text-green-500 flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-[11px] text-text-muted italic">Select a campus branch location first.</div>
            )}
            {selectedBranch && activeUsers.length === 0 && (
              <div className="p-8 text-center text-[11px] text-text-muted italic border border-dashed border-border/40 rounded-xl">No users provisioned.</div>
            )}
          </div>
        </div>

      </div>

      {/* CONTEXT SIDE DRAWER PANEL (Slides in from the right edge) */}
      {drawerMode && (
        <div className="fixed inset-y-0 right-0 w-[420px] bg-card border-l border-border/80 shadow-2xl z-50 p-6 flex flex-col justify-between animate-slideIn">
          <div className="space-y-6 overflow-y-auto flex-grow pr-1">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-border/30 pb-4">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {drawerMode.replace('-', ' ')}
                </span>
                <h3 className="font-black text-lg text-foreground mt-2 tracking-tight">
                  {drawerItem ? drawerItem.name : 'Create New Record'}
                </h3>
              </div>
              <button onClick={closeDrawer} className="p-1 hover:bg-card-border rounded-xl text-text-muted hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* DRAWER MODE: VIEW DETAIL CARDS */}
            {drawerMode.startsWith('view') && drawerItem && (
              <div className="space-y-6 text-xs text-foreground">
                
                {/* SCHOOL VIEW */}
                {drawerMode === 'view-school' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-card-border/10 border border-border/40 rounded-xl">
                      <span className="text-[10px] text-text-muted block mb-1">Registration Code</span>
                      <span className="font-bold text-foreground font-mono">{drawerItem.regNumber}</span>
                    </div>
                    <div className="p-3 bg-card-border/10 border border-border/40 rounded-xl">
                      <span className="text-[10px] text-text-muted block mb-1">Educational Level</span>
                      <span className="font-bold text-foreground">{drawerItem.type}</span>
                    </div>
                    <div className="space-y-2 border-t border-border/30 pt-4">
                      <span className="font-bold text-[10px] uppercase text-text-muted">Primary Contacts</span>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-text-muted" /> {drawerItem.email}</div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" /> {drawerItem.phone}</div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-text-muted" /> {drawerItem.address}, {drawerItem.city}</div>
                    </div>
                  </div>
                )}

                {/* BRANCH VIEW */}
                {drawerMode === 'view-branch' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-card-border/10 border border-border/40 rounded-xl">
                      <span className="text-[10px] text-text-muted block mb-1">Branch Code</span>
                      <span className="font-bold text-foreground font-mono">{drawerItem.code}</span>
                    </div>
                    <div className="space-y-2 border-t border-border/30 pt-4">
                      <span className="font-bold text-[10px] uppercase text-text-muted">Campus Communications</span>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-text-muted" /> {drawerItem.email}</div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" /> {drawerItem.phone}</div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-text-muted" /> {drawerItem.address}, {drawerItem.city}</div>
                    </div>
                  </div>
                )}

                {/* USER VIEW */}
                {drawerMode === 'view-user' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-card-border/10 border border-border/40 rounded-xl">
                      <span className="text-[10px] text-text-muted block mb-1">Assigned Role Scope</span>
                      <span className="font-bold text-foreground uppercase tracking-wide text-primary">{drawerItem.role}</span>
                    </div>
                    <div className="space-y-2 border-t border-border/30 pt-4">
                      <span className="font-bold text-[10px] uppercase text-text-muted">Staff Information</span>
                      <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-text-muted" /> {drawerItem.email}</div>
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" /> {drawerItem.phone || 'No phone number registered'}</div>
                      <div className="flex items-center gap-2"><Building className="w-4 h-4 text-text-muted" /> {drawerItem.schoolName}</div>
                    </div>
                  </div>
                )}

                {/* Drawer bottom buttons */}
                <div className="flex gap-2 border-t border-border/30 pt-6 mt-6">
                  <Button size="sm" onClick={() => startEditFromView(drawerMode.split('-')[1])} className="flex-grow flex justify-center items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                  {drawerItem.role !== 'School Admin' && (
                    <button 
                      onClick={() => handleDeleteItem(drawerMode.split('-')[1], drawerItem.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>

              </div>
            )}

            {/* DRAWER MODE: FORMS (EDIT / CREATE) */}
            {!drawerMode.startsWith('view') && (
              <div>
                {/* SCHOOL FORM */}
                {drawerMode.endsWith('school') && (
                  <form onSubmit={handleSaveSchool} className="space-y-4">
                    <Input label="School Name *" value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Registration Code *" value={schoolForm.regNumber} onChange={(e) => setSchoolForm({ ...schoolForm, regNumber: e.target.value })} required />
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-muted">Type *</label>
                        <select value={schoolForm.type} onChange={(e) => setSchoolForm({ ...schoolForm, type: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                          <option value="Primary">Primary School</option>
                          <option value="Secondary">High School</option>
                          <option value="K-12">K-12 Academy</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Email Address *" type="email" value={schoolForm.email} onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })} required />
                      <Input label="Phone Contact *" value={schoolForm.phone} onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })} required />
                    </div>
                    <Input label="Street Address" value={schoolForm.address} onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="City" value={schoolForm.city} onChange={(e) => setSchoolForm({ ...schoolForm, city: e.target.value })} />
                      <Input label="Country" value={schoolForm.country} onChange={(e) => setSchoolForm({ ...schoolForm, country: e.target.value })} />
                    </div>
                    <Button type="submit" className="w-full mt-4">Save School</Button>
                  </form>
                )}

                {/* BRANCH FORM */}
                {drawerMode.endsWith('branch') && (
                  <form onSubmit={handleSaveBranch} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted">Parent School Tenant *</label>
                      <select value={branchForm.schoolId || selectedSchool?.id} onChange={(e) => setBranchForm({ ...branchForm, schoolId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <Input label="Branch Name *" value={branchForm.name} onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} required />
                    <Input label="Unique Branch Code *" value={branchForm.code} onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} required />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Branch Email *" type="email" value={branchForm.email} onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })} required />
                      <Input label="Branch Phone *" value={branchForm.phone} onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} required />
                    </div>
                    <Input label="Street Address" value={branchForm.address} onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} />
                    <Input label="City" value={branchForm.city} onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} />
                    <Button type="submit" className="w-full mt-4">Save Branch</Button>
                  </form>
                )}

                {/* USER FORM */}
                {drawerMode.endsWith('user') && (
                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted">Campus Branch Location *</label>
                      <select value={userForm.branchId || selectedBranch?.id} onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                        {branches.filter(b => b.schoolId === (userForm.schoolId || selectedSchool?.id)).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-muted">ERP Access Role *</label>
                      <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                        <option value="Branch Principal">Branch Principal (Educational Lead)</option>
                        <option value="Teacher">Teacher Faculty (Class Coordinator)</option>
                        <option value="Accountant">Accountant Clerk (Billing Scope)</option>
                        <option value="Librarian">Librarian Clerk (Book Scope)</option>
                        <option value="School Admin">Global Administrator (System Scope)</option>
                      </select>
                    </div>

                    <Input label="Employee Full Name *" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required />
                    <Input label="Login Email Address *" type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
                    
                    {drawerMode === 'create-user' && (
                      <Input label="Create Login Password *" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
                    )}
                    <Input label="Phone Contact" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                    <Button type="submit" className="w-full mt-4">Save User account</Button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
