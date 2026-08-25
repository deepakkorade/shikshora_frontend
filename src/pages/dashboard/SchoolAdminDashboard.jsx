import { useState, useEffect } from 'react';
import { Users, GraduationCap, DollarSign, Calendar, BookOpen, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import api from '../../lib/api';
import Skeleton from '../../components/ui/Skeleton';

// Animated count-up hook
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

export default function SchoolAdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 154,
    totalTeachers: 18,
    totalStaff: 6,
    attendanceToday: { present: 142, absent: 8, late: 4, rate: '92%' },
    pendingFees: 3820,
    feesCollectedToday: 450,
    upcomingExams: [
      { name: 'Unit Test 1', startDate: '2026-09-10', class: 'Class 10' },
      { name: 'Practical Assessment', startDate: '2026-09-14', class: 'Class 9' }
    ],
    recentActivities: [
      { id: 1, action: 'Student Admission Converted', detail: 'Alice Smith (Class 10-A)', time: '10 mins ago' },
      { id: 2, action: 'Attendance Marked', detail: 'Class 9 - Section A by Teacher James', time: '1 hour ago' },
      { id: 3, action: 'Fee Payment Received', detail: '$250.00 tuition payment for Roll #12', time: '3 hours ago' },
      { id: 4, action: 'Homework Assigned', detail: 'Physics Theory assignment published to Class 10', time: 'Yesterday' }
    ]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamically fetch from endpoints if implemented, otherwise fallback to rich demo values
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const students = await api.get('/students');
        const teachers = await api.get('/staff/teachers');
        const employees = await api.get('/staff/employees');
        
        setStats(prev => ({
          ...prev,
          totalStudents: students.length || prev.totalStudents,
          totalTeachers: teachers.length || prev.totalTeachers,
          totalStaff: employees.length || prev.totalStaff
        }));
      } catch (err) {
        console.log('Using default mock values for display metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Skeleton.Page />;

  const animStudents  = useCountUp(stats.totalStudents);
  const animTeachers  = useCountUp(stats.totalTeachers);
  const animStaff     = useCountUp(stats.totalStaff);
  const animFees      = useCountUp(stats.pendingFees);
  const animPresent   = useCountUp(stats.attendanceToday.present);
  const animAbsent    = useCountUp(stats.attendanceToday.absent);
  const animCollected = useCountUp(stats.feesCollectedToday);

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">School ERP Dashboard</h1>
        <p className="text-sm text-text-muted">Overview of academic years, admissions, fees, and operational activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Students */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Students Registered</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground tabular-nums">{animStudents}</span>
            <span className="text-xs text-green-500 font-semibold block mt-1">Active Academic Term</span>
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Faculty Teachers</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground tabular-nums">{animTeachers}</span>
            <span className="text-xs text-text-muted block mt-1">{animStaff} Support Staff</span>
          </div>
        </div>

        {/* Card 3: Attendance */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Today's Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground">{stats.attendanceToday.rate}</span>
            <span className="text-xs text-green-500 font-semibold block mt-1">
              {animPresent} Present | {animAbsent} Absent
            </span>
          </div>
        </div>

        {/* Card 4: Tuition Collection */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pending Fees</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground tabular-nums">${animFees.toLocaleString()}</span>
            <span className="text-xs text-orange-500 font-semibold block mt-1">
              Today: +${animCollected} Collected
            </span>
          </div>
        </div>

      </div>

      {/* Mid Section: SVG charts + Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Monthly Fee Collection Bar Chart */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 lg:col-span-2">
          <h3 className="text-base font-bold text-foreground mb-4">Monthly Tuition Collection</h3>
          <div className="h-56 w-full flex items-end justify-between px-6 pb-2 border-b border-border/30 relative">
            
            {/* Chart values */}
            {[
              { month: 'Jun', value: 4500 },
              { month: 'Jul', value: 7200 },
              { month: 'Aug', value: 11500 },
              { month: 'Sep', value: 14800 }
            ].map((d, idx) => {
              const heightPct = (d.value / 16000) * 100;
              return (
                <div key={idx} className="flex flex-col items-center group w-16 z-10">
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1">${d.value}</span>
                  <div 
                    className="w-10 bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-300 shadow-md hover:from-primary hover:to-primary-hover"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs text-text-muted mt-2">{d.month}</span>
                </div>
              );
            })}

            {/* Background grids */}
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/10 z-0" />
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-border/10 z-0" />
          </div>
        </div>

        {/* Right Column: Upcoming Examination schedules */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">Upcoming Exams</h3>
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
          </div>
          <div className="space-y-3">
            {stats.upcomingExams.map((exam, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-card-border/30 border border-border/40 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground text-sm block">{exam.name}</span>
                  <span className="text-xs text-primary font-medium">{exam.class}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-text-muted block">Start Date</span>
                  <span className="text-xs text-foreground font-bold">{new Date(exam.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Section: Operations Activity Log */}
      <div className="p-5 rounded-2xl bg-card border border-border/60">
        <h3 className="text-base font-bold text-foreground mb-4">Recent School Operations Log</h3>
        <div className="space-y-4">
          {stats.recentActivities.map((act) => (
            <div key={act.id} className="flex gap-4 items-start text-sm border-b border-border/20 pb-3 last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-card-border flex items-center justify-center text-primary mt-0.5 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">{act.action}</span>
                  <span className="text-[10px] text-text-muted">{act.time}</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{act.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
