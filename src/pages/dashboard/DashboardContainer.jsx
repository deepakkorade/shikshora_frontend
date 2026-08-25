
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import ThemeToggle from '../../components/ui/ThemeToggle';
import SuperAdminDashboard from './SuperAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { TeacherDashboard, ParentDashboard, StudentDashboard } from './RoleDashboardsStubs';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import GlobalSearch from '../../components/GlobalSearch';
import NotFound from '../NotFound';

// Icons
import { 
  LayoutDashboard, UserPlus, GraduationCap, Users, BookOpen, 
  CheckSquare, CreditCard, Award, FileText, Bus, Library, 
  Bell, Cpu, BarChart3, Settings, Menu, X, LogOut, ShieldAlert, User, BellRing, Check, Timer, ChevronDown
} from 'lucide-react';

// Import Modular Pages directly (stubs will degrade gracefully)
import AdmissionsModule from '../modules/AdmissionsModule';
import AcademicsModule from '../modules/AcademicsModule';
import StudentsModule from '../modules/StudentsModule';
import StaffModule from '../modules/StaffModule';
import AttendanceModule from '../modules/AttendanceModule';
import FeesModule from '../modules/FeesModule';
import HomeworkModule from '../modules/HomeworkModule';
import ExamsModule from '../modules/ExamsModule';
import TransportModule from '../modules/TransportModule';
import LibraryModule from '../modules/LibraryModule';
import NoticeModule from '../modules/NoticeModule';
import AIModule from '../modules/AIModule';
import ReportsModule from '../modules/ReportsModule';
import SettingsModule from '../modules/SettingsModule';

export default function DashboardContainer() {
  const { user, logout, hasPermission } = useAuth();
  const { toast } = useToast();
  const { tab } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Direct clean URL active tab (e.g. /admissions -> 'admissions') ──
  const cleanPath = location.pathname.replace(/^\//, '').split('/')[0];
  const activeTab = tab || cleanPath || 'dashboard';

  const handleTabChange = (targetTab) => {
    navigate(`/${targetTab}`);
  };

  // Start sidebar closed on mobile (<1024px), open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  // Track window resize to update mobile state
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true); // always open on desktop
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Logout Confirm Modal State
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // User Profile Dropdown Menu in Header
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Idle Warning State
  const [showIdleWarning, setShowIdleWarning]   = useState(false);
  const [idleCountdown, setIdleCountdown]       = useState(300); // 5 min in seconds
  const countdownRef = useRef(null);

  useIdleTimer({
    idleMs:    30 * 60 * 1000, // 30 minutes idle → auto logout
    warningMs:  5 * 60 * 1000, // warn 5 minutes before
    onWarning: () => {
      setIdleCountdown(300);
      setShowIdleWarning(true);
      // Countdown tick
      if (countdownRef.current) clearInterval(countdownRef.current);
      countdownRef.current = setInterval(() => {
        setIdleCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setShowIdleWarning(false);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onActive: () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setShowIdleWarning(false);
    },
    onIdle: () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setShowIdleWarning(false);
      logout();
    },
  });

  // Notifications State
  const [showNotifs, setShowNotifs] = useState(false);
  const notifsRef = useRef(null);
  const [notifications, setNotifications] = useState([
    { id: 1, read: false, type: 'info',    title: 'New Admission',       message: 'Riya Sharma applied for Class 9 admission.', time: '2m ago' },
    { id: 2, read: false, type: 'warning', title: 'Fee Overdue',          message: '3 students have overdue fees this month.',    time: '15m ago' },
    { id: 3, read: false, type: 'success', title: 'Leave Approved',       message: 'Teacher James leave was approved.',             time: '1h ago' },
    { id: 4, read: true,  type: 'info',    title: 'Homework Submitted',   message: 'Class 10-A homework batch submitted.',          time: '3h ago' },
    { id: 5, read: true,  type: 'info',    title: 'Notice Published',     message: 'Annual day notice sent to all parents.',        time: '1d ago' },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close notif & user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '555-0199',
    password: ''
  });
  const [profileNotice, setProfileNotice] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Leave Approvals State
  const [globalLeaves, setGlobalLeaves] = useState(() => {
    const data = localStorage.getItem('shikshora_global_leaves');
    if (data) return JSON.parse(data);
    return [
      { id: 101, applicantName: 'Teacher James (Physics)', role: 'Teacher', dateRange: '2026-09-18 to 2026-09-19', type: 'Sick Leave', reason: 'Dental appointment checkup', status: 'Pending' },
      { id: 102, applicantName: 'Student Alice Miller (Class 10-A)', role: 'Student', dateRange: '2026-09-25 to 2026-09-26', type: 'Casual Leave', reason: 'Family travel out of state', status: 'Pending' }
    ];
  });

  if (!user) return null;

  // Sidebar Menu Config
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'admissions', name: 'Admissions CRM', icon: UserPlus, module: 'admissions' },
    { id: 'students', name: 'Student Registry', icon: GraduationCap, module: 'students' },
    { id: 'staff', name: 'Faculty & Staff', icon: Users, module: 'staff' },
    { id: 'leaves-approval', name: 'Leave Approvals', icon: CheckSquare, module: 'staff' }, // Admin approval tab
    { id: 'academics', name: 'Academics Config', icon: BookOpen, module: 'academics' },
    { id: 'attendance', name: 'Attendance Marker', icon: CheckSquare, module: 'attendance' },
    { id: 'fees', name: 'Fees & Invoices', icon: CreditCard, module: 'fees' },
    { id: 'homework', name: 'Homework Board', icon: FileText, module: 'homework' },
    { id: 'exams', name: 'Examinations', icon: Award, module: 'exams' },
    { id: 'transport', name: 'Transport Logistics', icon: Bus, module: 'transport' },
    { id: 'library', name: 'Library catalog', icon: Library, module: 'library' },
    { id: 'communication', name: 'Notice Board', icon: Bell, module: 'communication' },
    { id: 'ai', name: 'AI & Automation', icon: Cpu, module: 'ai' },
    { id: 'reports', name: 'Analytics Reports', icon: BarChart3, module: 'reports' },
    { id: 'settings', name: 'Settings Tree', icon: Settings, module: 'settings' }
  ];

  // Filter menu items by role access permissions
  const allowedMenuItems = menuItems.filter(item => {
    if (item.id === 'dashboard') return true;
    if (user.role === 'Super Admin') return true; // Show all to Super Admin
    return hasPermission(item.module, 'view');
  });

  const handleApproveLeave = (id) => {
    const updated = globalLeaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l);
    setGlobalLeaves(updated);
    localStorage.setItem('shikshora_global_leaves', JSON.stringify(updated));
    toast({ type: 'success', title: 'Leave Approved', message: 'The leave request has been approved successfully.' });
  };

  const handleRejectLeave = (id) => {
    const updated = globalLeaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l);
    setGlobalLeaves(updated);
    localStorage.setItem('shikshora_global_leaves', JSON.stringify(updated));
    toast({ type: 'error', title: 'Leave Rejected', message: 'The leave request has been rejected.' });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileNotice(null);
    setTimeout(() => {
      setProfileSaving(false);
      setProfileNotice({ type: 'success', message: 'Personal profile details updated successfully!' });
      // Update local storage
      const storedUser = localStorage.getItem('shikshora_user');
      if (storedUser) {
        const uObj = JSON.parse(storedUser);
        uObj.name = profileForm.name;
        uObj.email = profileForm.email;
        localStorage.setItem('shikshora_user', JSON.stringify(uObj));
      }
    }, 1200);
  };

  const renderActiveContent = () => {
    // Module Router
    switch (activeTab) {
      case 'dashboard':
        if (user.role === 'Super Admin') return <SuperAdminDashboard />;
        if (user.role === 'School Admin' || user.role === 'Branch Admin') return <SchoolAdminDashboard />;
        if (user.role === 'Teacher') return <TeacherDashboard />;
        if (user.role === 'Parent') return <ParentDashboard />;
        if (user.role === 'Student') return <StudentDashboard />;
        return <SchoolAdminDashboard />;
      case 'admissions':
        return <AdmissionsModule />;
      case 'academics':
        return <AcademicsModule />;
      case 'students':
        return <StudentsModule />;
      case 'staff':
        return <StaffModule />;
      case 'leaves-approval':
        return (
          <div className="bg-card border border-border/60 p-5 rounded-2xl space-y-4 text-left font-sans animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-foreground">Leave Requests & Approvals</h2>
              <p className="text-xs text-text-muted">Review leave requests filed by teachers and students.</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card-border/20 border-b border-border/40 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="p-3">Applicant</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Date Period</th>
                    <th className="p-3">Leave Type</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {globalLeaves.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-text-muted">No leave requests found.</td>
                    </tr>
                  ) : (
                    globalLeaves.map((l) => (
                      <tr key={l.id}>
                        <td className="p-3 font-bold text-foreground">{l.applicantName}</td>
                        <td className="p-3"><span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-md">{l.role}</span></td>
                        <td className="p-3 text-xs text-text-muted">{l.dateRange}</td>
                        <td className="p-3 text-xs">{l.type}</td>
                        <td className="p-3 text-xs text-text-muted max-w-xs truncate">{l.reason}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                            l.status === 'Approved' ? 'bg-green-500/10 text-green-500' :
                            l.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                          }`}>{l.status}</span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {l.status === 'Pending' ? (
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => handleApproveLeave(l.id)} 
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectLeave(l.id)} 
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'attendance':
        return <AttendanceModule />;
      case 'fees':
        return <FeesModule />;
      case 'homework':
        return <HomeworkModule />;
      case 'exams':
        return <ExamsModule />;
      case 'transport':
        return <TransportModule />;
      case 'library':
        return <LibraryModule />;
      case 'communication':
        return <NoticeModule />;
      case 'ai':
        return <AIModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <NotFound onNavigate={handleTabChange} />;
    }
  };

  const getBreadcrumbs = () => {
    const currentItem = menuItems.find(item => item.id === activeTab);
    return ['Portal', user.role, currentItem ? currentItem.name : 'Dashboard'];
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-stretch font-sans overflow-x-hidden">

      {/* ── Mobile backdrop — tap to close sidebar ── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-[19] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        bg-card border-r border-border/40 flex flex-col justify-between
        transition-all duration-300 ease-in-out z-20
        ${ isMobile
          /* mobile: fixed full-height overlay, slides in/out */
          ? `fixed top-0 bottom-0 left-0 w-72 ${ sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full' }`
          /* desktop: static, collapsible width */
          : `relative shrink-0 ${ sidebarOpen ? 'w-64' : 'w-20' }`
        }
      `}>
        <div>
          {/* Header/Branding */}
          <div className="p-5 flex items-center justify-between border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shrink-0">
                <GraduationCap className="w-5.5 h-5.5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <span className="font-bold text-base block leading-none text-foreground">Shikshora</span>
                  <span className="text-[10px] text-text-muted">School ERP SaaS</span>
                </div>
              )}
            </div>
            
            {/* Close sidebar button on mobile */}
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-text-muted hover:text-foreground cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            
            {/* Render items */}
            {allowedMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    if (isMobile) setSidebarOpen(false); // auto-close drawer on mobile tap
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === item.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-foreground hover:bg-card-border/30'
                  }`}
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
                  {/* On mobile sidebar is always w-72 so always show label; on desktop respect sidebarOpen */}
                  {(isMobile || sidebarOpen) && <span>{item.name}</span>}
                </button>
              );
            })}

          </nav>
        </div>

        {/* User Account / Logout */}
        <div className="p-3 border-t border-border/30">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card-border/30 ${ (isMobile || sidebarOpen) ? 'justify-between' : 'justify-center' }`}>
            {(isMobile || sidebarOpen) ? (
              <button
                onClick={() => { setShowProfileModal(true); if (isMobile) setSidebarOpen(false); }}
                className="text-left shrink overflow-hidden hover:opacity-85 cursor-pointer"
                title="Edit profile settings"
              >
                <span className="font-bold text-xs text-foreground block truncate">{user.name}</span>
                <span className="text-[10px] text-text-muted block uppercase tracking-wider">{user.role}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowProfileModal(true)}
                className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/25 cursor-pointer"
                title="Profile"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2.5 rounded-lg border border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-text-muted transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 min-h-screen">

        {/* Top Navbar */}
        <header className="h-16 px-4 sm:px-6 border-b border-border/30 bg-background/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger — always visible, toggles drawer on mobile / collapse on desktop */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="p-2 rounded-lg border border-border hover:bg-card text-text-muted hover:text-foreground cursor-pointer"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen && !isMobile ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>

            {/* Breadcrumbs — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted font-medium">
              {getBreadcrumbs().map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  <span className={i === getBreadcrumbs().length - 1 ? 'text-foreground font-semibold' : ''}>{b}</span>
                </span>
              ))}
            </div>

            {/* 🔍 Global Search */}
            <GlobalSearch onNavigate={handleTabChange} />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Tenant details banner */}
            {user.school && (
              <div className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
                <img src={user.school.logo} alt="Logo" className="w-4.5 h-4.5 rounded-md object-cover" />
                <span className="text-xs font-bold text-primary">{user.school.name}</span>
              </div>
            )}

            {/* 🔔 Notification Bell */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs(v => !v)}
                className="relative p-2 rounded-lg border border-border hover:bg-card text-text-muted hover:text-foreground cursor-pointer transition-colors"
                aria-label="Notifications"
                title="Notifications"
              >
                <BellRing className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Panel */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden z-50"
                  style={{ animation: 'scaleIn 0.18s cubic-bezier(.34,1.56,.64,1) both', transformOrigin: 'top right' }}>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
                    <button
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                      className="text-[10px] font-semibold text-primary hover:text-primary-hover cursor-pointer transition-colors"
                    >
                      Mark all read
                    </button>
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
                    {notifications.map(n => {
                      const colors = { info: 'bg-blue-500', success: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-rose-500' };
                      return (
                        <div
                          key={n.id}
                          onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-card-border/20 transition-colors cursor-pointer ${ !n.read ? 'bg-primary/5' : '' }`}
                        >
                          <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${colors[n.type] || 'bg-primary'} ${ n.read ? 'opacity-30' : '' }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold leading-tight ${ n.read ? 'text-text-muted' : 'text-foreground' }`}>{n.title}</p>
                            <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-text-muted/60 mt-1">{n.time}</p>
                          </div>
                          {!n.read && (
                            <span className="shrink-0 mt-1">
                              <Check className="w-3 h-3 text-primary" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-border/40 text-center">
                    <button
                      onClick={() => { setNotifications([]); setShowNotifs(false); }}
                      className="text-[11px] text-text-muted hover:text-foreground font-semibold cursor-pointer transition-colors"
                    >
                      Clear all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 🎨 Theme Toggle (Inline, Non-overlapping) */}
            <ThemeToggle isFloating={false} />

            {/* 🚪 Quick Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 rounded-lg border border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-text-muted transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>

            {/* 👤 Profile Avatar & User Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl border border-border/60 hover:bg-card hover:border-border transition-all cursor-pointer"
                title="Account Menu"
              >
                {/* Profile Photo */}
                <div className="relative">
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true&rounded=true`}
                    alt={user?.name}
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-primary/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background" />
                </div>
                <div className="hidden lg:block text-left">
                  <span className="font-bold text-xs text-foreground block leading-tight truncate max-w-[110px]">{user?.name}</span>
                  <span className="text-[10px] text-text-muted block uppercase tracking-wider">{user?.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                  style={{ animation: 'scaleIn 0.18s cubic-bezier(.34,1.56,.64,1) both', transformOrigin: 'top right' }}
                >
                  {/* Profile Card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card-border/30 border border-border/40 mb-1.5">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff&bold=true&rounded=true`}
                      alt={user?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/30 shrink-0"
                    />
                    <div className="overflow-hidden min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                      <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-primary/10 text-primary">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <button
                    onClick={() => { setShowUserMenu(false); setShowProfileModal(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-foreground hover:bg-card-border/40 transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>Profile Settings</span>
                  </button>

                  <div className="h-[1px] bg-border/40 my-1" />

                  <button
                    onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content canvas container */}
        <main className="p-6 sm:p-8 flex-grow overflow-y-auto max-h-[calc(100vh-64px)]">
          {renderActiveContent()}
        </main>

      </div>

      {/* Profile Settings Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fadeIn font-sans text-left">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-foreground hover:bg-card-border/30 rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">Personal Profile Settings</h3>
                  <span className="text-[10px] text-text-muted">Update your account credentials and info</span>
                </div>
              </div>

              {profileNotice && <Alert type={profileNotice.type} message={profileNotice.message} />}

              <Input 
                label="Full Name" 
                value={profileForm.name} 
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                required 
              />
              <Input 
                label="Email Address" 
                type="email" 
                value={profileForm.email} 
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} 
                required 
              />
              <Input 
                label="Phone Number" 
                value={profileForm.phone} 
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
              />
              <Input 
                label="Change Password (Optional)" 
                type="password" 
                placeholder="Enter new password to change"
                value={profileForm.password} 
                onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} 
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
                <button 
                  type="button" 
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 border border-border/60 hover:bg-card-border/20 text-xs font-bold rounded-xl text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <Button type="submit" isLoading={profileSaving}>
                  Update Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Logout Confirmation Popup (compact) ──────────────────────────── */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-card border border-border/60 rounded-2xl shadow-2xl p-6 w-72 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'scaleIn 0.2s cubic-bezier(.34,1.56,.64,1) both' }}
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="font-bold text-foreground text-sm">Sign out of Shikshora?</p>
              <p className="text-xs text-text-muted mt-1">You will be redirected to the login page.</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl border border-border/60 text-xs font-semibold text-text-muted hover:bg-card-border/40 hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); logout(); }}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Idle Warning Modal ────────────────────────────────────────────── */}
      {showIdleWarning && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="bg-card border border-amber-500/30 rounded-3xl shadow-2xl p-7 w-80 flex flex-col items-center gap-5 text-center"
            style={{ animation: 'scaleIn 0.22s cubic-bezier(.34,1.56,.64,1) both' }}
          >
            {/* Animated icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Timer className="w-7 h-7 text-amber-400" />
              </div>
            </div>

            {/* Countdown ring */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl font-black text-amber-400 tabular-nums">
                {Math.floor(idleCountdown / 60)}:{String(idleCountdown % 60).padStart(2, '0')}
              </span>
              <p className="text-xs text-text-muted">remaining before auto sign-out</p>
            </div>

            <div>
              <p className="font-bold text-foreground text-sm mb-1">Still there?</p>
              <p className="text-xs text-text-muted leading-relaxed">
                You've been inactive for 25 minutes.<br />
                Move the mouse or click below to stay signed in.
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { clearInterval(countdownRef.current); setShowIdleWarning(false); logout(); }}
                className="flex-1 py-2.5 rounded-xl border border-border/60 text-xs font-semibold text-text-muted hover:bg-card-border/40 transition-all cursor-pointer"
              >
                Sign Out
              </button>
              <button
                onClick={() => { clearInterval(countdownRef.current); setShowIdleWarning(false); }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25"
              >
                I'm Still Here
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

    </div>
  );
}
