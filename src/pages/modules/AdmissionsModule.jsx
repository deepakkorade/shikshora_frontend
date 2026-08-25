import { useState, useEffect } from 'react';
import { UserPlus, Calendar, Plus, PhoneCall, Check, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';

export default function AdmissionsModule() {
  const [leads, setLeads] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const triggerSuccess = (msg) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };
  
  // Modals / Actions states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form Fields
  const [newLead, setNewLead] = useState({
    firstName: '', lastName: '', dob: '', gender: 'Male', classId: '',
    fatherName: '', motherName: '', email: '', mobile: '', address: '', occupation: '', comments: ''
  });

  const [followUp, setFollowUp] = useState({
    contactDate: new Date().toISOString().split('T')[0],
    feedback: '', nextFollowUpDate: '', status: 'Follow-up'
  });

  const [convertData, setConvertData] = useState({
    sectionId: '', rollNumber: ''
  });
  
  const [sectionsList, setSectionsList] = useState([]);

  // Load Admissions and Classes
  const loadAdmissionsData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/admissions');
      setLeads(data);
      const classesData = await api.get('/academics/classes');
      setClasses(classesData);
    } catch (err) {
      setError(err.message || 'Failed to load admissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissionsData();
  }, []);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admissions', newLead);
      setShowAddForm(false);
      setNewLead({
        firstName: '', lastName: '', dob: '', gender: 'Male', classId: '',
        fatherName: '', motherName: '', email: '', mobile: '', address: '', occupation: '', comments: ''
      });
      triggerSuccess('Lead profile created successfully.');
      loadAdmissionsData();
    } catch (err) {
      setError(err.message || 'Failed to create lead');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admissions/${selectedLead.id}/followups`, followUp);
      setShowFollowUpForm(false);
      setFollowUp({
        contactDate: new Date().toISOString().split('T')[0],
        feedback: '', nextFollowUpDate: '', status: 'Follow-up'
      });
      triggerSuccess('Follow-up logged successfully.');
      loadAdmissionsData();
    } catch (err) {
      setError(err.message || 'Failed to log follow-up');
    }
  };

  const handleOpenConvert = (lead) => {
    setSelectedLead(lead);
    // Find sections for the lead's class
    const targetClass = classes.find(c => c.id === lead.classId);
    setSectionsList(targetClass ? targetClass.Sections || [] : []);
    setConvertData({ sectionId: '', rollNumber: '' });
    setShowConvertForm(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/admissions/${selectedLead.id}/convert`, convertData);
      triggerSuccess(res.message || 'Lead successfully converted to Student!');
      setShowConvertForm(false);
      loadAdmissionsData();
    } catch (err) {
      setError(err.message || 'Failed to convert lead');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = leads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(leads.length / itemsPerPage);

  if (loading) return <div className="p-6"><Skeleton.Page /></div>;

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admissions CRM Pipeline</h2>
          <p className="text-sm text-text-muted">Track student enquiries, log follow-ups, and convert leads to registered student records.</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New Enquiry</span>
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Leads List */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <h3 className="font-bold text-foreground mb-4">Admissions Registry</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                <th className="py-3 px-4">Applicant Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {currentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-card-border/10">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-foreground block">{lead.firstName} {lead.lastName}</span>
                    <span className="text-xs text-text-muted">DOB: {new Date(lead.dob).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {lead.Class?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground block">{lead.fatherName}</span>
                    <span className="text-xs text-text-muted">{lead.mobile}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      lead.status === 'Converted' ? 'bg-green-500/10 text-green-500' :
                      lead.status === 'New' ? 'bg-primary/10 text-primary' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      {lead.status !== 'Converted' && (
                        <>
                          <button
                            onClick={() => { setSelectedLead(lead); setShowFollowUpForm(true); }}
                            className="p-1.5 rounded-lg border border-border hover:bg-card-border text-text-muted transition-colors cursor-pointer"
                            title="Log Follow-up"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenConvert(lead)}
                            className="p-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/15 text-primary transition-colors cursor-pointer"
                            title="Approve & Enroll Student"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">No admission enquiries recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
            <span className="text-xs text-text-muted">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, leads.length)} of {leads.length} entries
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

      {/* MODAL 1: ADD NEW ENQUIRY */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">New Admission Lead Entry</h3>
              <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name *" value={newLead.firstName} onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })} required />
                <Input label="Last Name *" value={newLead.lastName} onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date of Birth *" type="date" value={newLead.dob} onChange={(e) => setNewLead({ ...newLead, dob: e.target.value })} required />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Gender *</label>
                  <select value={newLead.gender} onChange={(e) => setNewLead({ ...newLead, gender: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Applying Class *</label>
                <select value={newLead.classId} onChange={(e) => setNewLead({ ...newLead, classId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                  <option value="">-- Select Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="border-t border-border/20 pt-4">
                <h4 className="font-semibold text-sm text-foreground mb-3">Parent Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Father's Name *" value={newLead.fatherName} onChange={(e) => setNewLead({ ...newLead, fatherName: e.target.value })} required />
                  <Input label="Mother's Name" value={newLead.motherName} onChange={(e) => setNewLead({ ...newLead, motherName: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <Input label="Mobile Number *" value={newLead.mobile} onChange={(e) => setNewLead({ ...newLead, mobile: e.target.value })} required />
                  <Input label="Email Address" type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} />
                </div>
              </div>

              <Button type="submit">Create Enquiry</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FOLLOW UP TRACKING */}
      {showFollowUpForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Log Follow-up Call Details</h3>
              <button onClick={() => setShowFollowUpForm(false)} className="text-text-muted hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <Input label="Contact Date *" type="date" value={followUp.contactDate} onChange={(e) => setFollowUp({ ...followUp, contactDate: e.target.value })} required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Feedback Summary *</label>
                <textarea value={followUp.feedback} onChange={(e) => setFollowUp({ ...followUp, feedback: e.target.value })} className="w-full p-3 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none min-h-[80px]" placeholder="Parent interested, requested syllabus details..." required />
              </div>
              <Input label="Next Follow-up Date" type="date" value={followUp.nextFollowUpDate} onChange={(e) => setFollowUp({ ...followUp, nextFollowUpDate: e.target.value })} />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Status Update</label>
                <select value={followUp.status} onChange={(e) => setFollowUp({ ...followUp, status: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="Follow-up">Follow-up Needed</option>
                  <option value="Interested">Interested</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <Button type="submit">Save Follow-up</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: APPROVE & CONVERT TO STUDENT */}
      {showConvertForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Enroll Applicant to Class</h3>
              <button onClick={() => setShowConvertForm(false)} className="text-text-muted hover:text-foreground cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleConvertLead} className="space-y-4">
              <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs flex gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>On approval, a student profile will be created and parent credentials generated.</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Class Section *</label>
                <select value={convertData.sectionId} onChange={(e) => setConvertData({ ...convertData, sectionId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                  <option value="">-- Select Section --</option>
                  {sectionsList.map(s => <option key={s.id} value={s.id}>{s.name} (Capacity: {s.capacity})</option>)}
                </select>
              </div>

              <Input label="Assign Roll Number (Optional)" value={convertData.rollNumber} onChange={(e) => setConvertData({ ...convertData, rollNumber: e.target.value })} placeholder="Auto-assign next roll" />

              <Button type="submit">Confirm Enrollment & Student ID</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
