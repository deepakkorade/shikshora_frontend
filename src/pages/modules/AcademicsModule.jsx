import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, AlertTriangle, Plus, Check, MapPin } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function AcademicsModule() {
  const [activeSubTab, setActiveSubTab] = useState('classes'); // classes, subjects, timetable
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [years, setYears] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const triggerSuccess = (msg) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetableSlots, setTimetableSlots] = useState([]);
  
  // Modals / Form Fields
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [newClass, setNewClass] = useState({ name: '', code: '' });
  const [newSection, setNewSection] = useState({ name: '', capacity: 40 });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', type: 'Theory' });
  const [newSchedule, setNewSchedule] = useState({
    subjectId: '', teacherId: '', dayOfWeek: 'Monday', periodNumber: 1, startTime: '09:00', endTime: '09:45', roomNumber: ''
  });

  const [conflictWarning, setConflictWarning] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadAcademicsData = async () => {
    try {
      const clsData = await api.get('/academics/classes');
      setClasses(clsData);
      const subData = await api.get('/academics/subjects');
      setSubjects(subData);
      const yearData = await api.get('/academics/years');
      setYears(yearData);
      
      const teacherData = await api.get('/staff/teachers');
      setTeachers(teacherData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAcademicsData();
  }, []);

  const loadTimetable = async () => {
    if (!selectedClass || !selectedSection) return;
    try {
      const slots = await api.get(`/academics/timetable?classId=${selectedClass}&sectionId=${selectedSection}`);
      setTimetableSlots(slots);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedClass, selectedSection]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academics/classes', newClass);
      setShowClassModal(false);
      setNewClass({ name: '', code: '' });
      triggerSuccess('Class created successfully.');
      loadAcademicsData();
    } catch (err) {
      setError(err.message || 'Failed to create class');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/academics/classes/${selectedClass}/sections`, newSection);
      setShowSectionModal(false);
      setNewSection({ name: '', capacity: 40 });
      triggerSuccess('Section created successfully.');
      loadAcademicsData();
    } catch (err) {
      setError(err.message || 'Failed to create section');
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academics/subjects', newSubject);
      setShowSubjectModal(false);
      setNewSubject({ name: '', code: '', type: 'Theory' });
      triggerSuccess('Subject created successfully.');
      loadAcademicsData();
    } catch (err) {
      setError(err.message || 'Failed to create subject');
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    setConflictWarning(null);

    const payload = {
      classId: selectedClass,
      sectionId: selectedSection,
      ...newSchedule
    };

    try {
      await api.post('/academics/timetable', payload);
      setShowScheduleModal(false);
      setNewSchedule({
        subjectId: '', teacherId: '', dayOfWeek: 'Monday', periodNumber: 1, startTime: '09:00', endTime: '09:45', roomNumber: ''
      });
      triggerSuccess('Timetable scheduled successfully.');
      loadTimetable();
    } catch (err) {
      // Check for conflict (409) or bad request
      setConflictWarning(err.message || 'Scheduling conflict detected.');
    }
  };

  const getActiveSections = () => {
    const cls = classes.find(c => c.id === parseInt(selectedClass));
    return cls ? cls.Sections || [] : [];
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Academics & Timetables</h2>
          <p className="text-sm text-text-muted">Manage academic structures, semesters, subject catalogs, and timetable lecture plans.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Navigation Sub Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-px">
        {['classes', 'subjects', 'timetable'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2.5 font-semibold text-sm capitalize transition-all border-b-2 cursor-pointer ${
              activeSubTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUB-VIEW 1: CLASSES */}
      {activeSubTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground">Class & Sections Configuration</h3>
            <Button onClick={() => setShowClassModal(true)} size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Class
            </Button>
          </div>  

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-extrabold text-lg text-foreground block">{c.name}</span>
                    <span className="text-xs text-text-muted">Class Code: {c.code}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-foreground">Sections ({c.Sections?.length || 0}):</span>
                    <button
                      onClick={() => { setSelectedClass(c.id); setShowSectionModal(true); }}
                      className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Section
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.Sections?.map(s => (
                      <span key={s.id} className="text-[10px] font-semibold bg-card-border px-2.5 py-1 rounded-md text-text-muted">
                        Section {s.name} ({s.capacity} Max)
                      </span>
                    ))}
                    {(!c.Sections || c.Sections.length === 0) && (
                      <span className="text-xs text-text-muted italic">No sections created yet.</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: SUBJECTS */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground">Subject Catalog</h3>
            <Button onClick={() => setShowSubjectModal(true)} size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Subject
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-4 rounded-xl bg-card border border-border/60 flex justify-between items-center">
                <div>
                  <span className="font-bold text-foreground text-sm block">{sub.name}</span>
                  <span className="text-xs text-text-muted">Code: {sub.code}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  sub.type === 'Practical' ? 'bg-purple-500/10 text-purple-500' : 'bg-primary/10 text-primary'
                }`}>
                  {sub.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TIMETABLE SCHEDULER */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-6">
          {/* Class Selectors */}
          <div className="flex flex-wrap gap-4 items-end bg-card border border-border/60 p-4 rounded-2xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); }}
                className="h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none w-44"
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none w-44"
              >
                <option value="">-- Choose Section --</option>
                {getActiveSections().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {selectedClass && selectedSection && (
              <Button onClick={() => setShowScheduleModal(true)} size="sm" className="ml-auto flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Lecture slot
              </Button>
            )}
          </div>

          {/* Grid Timetable Displays */}
          {selectedClass && selectedSection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {days.map((day) => {
                const daySlots = timetableSlots.filter(s => s.dayOfWeek === day);
                return (
                  <div key={day} className="p-4 rounded-xl bg-card border border-border/60 space-y-3">
                    <span className="font-extrabold text-foreground text-sm border-b border-border/30 pb-1.5 block">{day}</span>
                    <div className="space-y-2">
                      {daySlots.map(slot => (
                        <div key={slot.id} className="p-3 rounded-lg bg-card-border/40 border border-border/40 flex justify-between items-start text-xs hover:border-primary/20 transition-all">
                          <div>
                            <span className="font-bold text-foreground block">{slot.Subject?.name}</span>
                            <span className="text-[10px] text-text-muted block mt-0.5">Teacher: {slot.Teacher?.User?.name || 'N/A'}</span>
                            <span className="text-[10px] text-text-muted block flex items-center gap-0.5 mt-0.5">
                              <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {slot.roomNumber && (
                            <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" /> Room {slot.roomNumber}
                            </span>
                          )}
                        </div>
                      ))}
                      {daySlots.length === 0 && (
                        <span className="text-xs text-text-muted italic block py-4 text-center">No lectures scheduled.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-xl">
              Please select a class and section to configure and schedule weekly timetables.
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD CLASS */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add New Class</h3>
              <button onClick={() => setShowClassModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <Input label="Class Name *" value={newClass.name} onChange={(e) => setNewClass({ ...newClass, name: e.target.value })} placeholder="e.g. Class 10" required />
              <Input label="Class Code *" value={newClass.code} onChange={(e) => setNewClass({ ...newClass, code: e.target.value })} placeholder="e.g. C10" required />
              <Button type="submit">Create Class</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SECTION */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Section</h3>
              <button onClick={() => setShowSectionModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            <form onSubmit={handleCreateSection} className="space-y-4">
              <Input label="Section Name *" value={newSection.name} onChange={(e) => setNewSection({ ...newSection, name: e.target.value })} placeholder="e.g. Section A" required />
              <Input label="Section Student Capacity" type="number" value={newSection.capacity} onChange={(e) => setNewSection({ ...newSection, capacity: e.target.value })} placeholder="40" />
              <Button type="submit">Add Section</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Add Subject Catalog</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <Input label="Subject Name *" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} placeholder="e.g. Physics" required />
              <Input label="Subject Code *" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} placeholder="e.g. PHY" required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted font-medium">Subject Category</label>
                <select value={newSubject.type} onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Both">Both (Theory & Practical)</option>
                </select>
              </div>
              <Button type="submit">Create Subject</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: TIMETABLE SCHEDULE SLOT WITH CONFLICT WARNING */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Schedule Period Lecture</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>

            {conflictWarning && (
              <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs flex gap-2">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                <div>
                  <span className="font-bold">Conflict Warning:</span>
                  <p className="mt-0.5">{conflictWarning}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Subject *</label>
                <select value={newSchedule.subjectId} onChange={(e) => setNewSchedule({ ...newSchedule, subjectId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                  <option value="">-- Choose Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Assign Teacher *</label>
                <select value={newSchedule.teacherId} onChange={(e) => setNewSchedule({ ...newSchedule, teacherId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.User?.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-muted">Weekday *</label>
                  <select value={newSchedule.dayOfWeek} onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })} className="w-full h-11 px-3 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Input label="Period #" type="number" min="1" max="8" value={newSchedule.periodNumber} onChange={(e) => setNewSchedule({ ...newSchedule, periodNumber: parseInt(e.target.value) })} required />
                <Input label="Room No." value={newSchedule.roomNumber} onChange={(e) => setNewSchedule({ ...newSchedule, roomNumber: e.target.value })} placeholder="e.g. 102" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Time *" type="time" value={newSchedule.startTime} onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })} required />
                <Input label="End Time *" type="time" value={newSchedule.endTime} onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })} required />
              </div>

              <Button type="submit">Schedule Period</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
