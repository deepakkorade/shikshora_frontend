import { useState, useEffect } from 'react';
import { CheckSquare, Calendar, CheckCircle2, User, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';

export default function AttendanceModule() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await api.get('/academics/classes');
        setClasses(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadClasses();
  }, []);

  const loadAttendanceSheet = async () => {
    if (!selectedClass || !selectedSection || !attendanceDate) return;
    setLoading(true);
    setNotice(null);
    try {
      const data = await api.get(`/attendance?classId=${selectedClass}&sectionId=${selectedSection}&date=${attendanceDate}`);
      setStudentsList(data);
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to load attendance roster.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceSheet();
  }, [selectedClass, selectedSection, attendanceDate]);

  const handleStatusChange = (studentId, status) => {
    setStudentsList(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, status } : s
    ));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudentsList(prev => prev.map(s => 
      s.studentId === studentId ? { ...s, remarks } : s
    ));
  };

  const handleSaveAttendance = async () => {
    setSaveLoading(true);
    setNotice(null);

    const payload = {
      classId: selectedClass,
      sectionId: selectedSection,
      date: attendanceDate,
      records: studentsList.map(s => ({
        studentId: s.studentId,
        status: s.status,
        remarks: s.remarks
      }))
    };

    try {
      await api.post('/attendance/bulk', payload);
      setNotice({ type: 'success', message: 'Attendance records saved successfully.' });
      loadAttendanceSheet(); // refresh
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Failed to save attendance logs.' });
    } finally {
      setSaveLoading(false);
    }
  };

  const getActiveSections = () => {
    const cls = classes.find(c => c.id === parseInt(selectedClass));
    return cls ? cls.Sections || [] : [];
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Attendance Marker Panel</h2>
        <p className="text-sm text-text-muted">Take class attendance and review active student attendance registries.</p>
      </div>

      {/* Class Section Selectors */}
      <div className="flex flex-wrap gap-4 items-end bg-card border border-border/60 p-4 rounded-2xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted">Class</label>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setSelectedSection(''); setStudentsList([]); }}
            className="h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none w-44"
          >
            <option value="">-- Select Class --</option>
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
            <option value="">-- Select Section --</option>
            {getActiveSections().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted">Attendance Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none w-44"
          />
        </div>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl border flex gap-3 text-sm ${
          notice.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{notice.message}</span>
        </div>
      )}

      {/* Roster Grid */}
      {selectedClass && selectedSection ? (
        <div className="space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-foreground">Roster Listing ({studentsList.length} Students)</span>
              <Button onClick={handleSaveAttendance} isLoading={saveLoading} size="sm">
                Save Attendance Sheet
              </Button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-text-muted">Fetching roster sheet...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Attendance Status</th>
                      <th className="py-3 px-4">Remarks/Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {studentsList.map((student) => (
                      <tr key={student.studentId} className="hover:bg-card-border/5">
                        <td className="py-3 px-4 font-bold text-foreground">#{student.rollNumber || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold text-foreground">{student.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {['Present', 'Absent', 'Late', 'Leave'].map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusChange(student.studentId, status)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  student.status === status 
                                    ? status === 'Present' ? 'bg-green-500 text-white shadow-sm' :
                                      status === 'Absent' ? 'bg-red-500 text-white shadow-sm' :
                                      status === 'Late' ? 'bg-orange-500 text-white shadow-sm' : 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-card-border/30 hover:bg-card-border/60 text-text-muted'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={student.remarks}
                            onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                            placeholder="Add note (optional)"
                            className="h-8 px-2.5 rounded-lg bg-input border border-border/40 text-xs text-foreground focus:outline-none w-full max-w-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-2xl">
          Please select a class and section to load the daily student attendance marking sheet.
        </div>
      )}
    </div>
  );
}
