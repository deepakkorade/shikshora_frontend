import { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import ThemeToggle from '../../components/ui/ThemeToggle';
import SuperAdminDashboard from './SuperAdminDashboard';
import SchoolAdminDashboard from './SchoolAdminDashboard';
import { TeacherDashboard, ParentDashboard, StudentDashboard } from './RoleDashboardsStubs';

// Icons
import { 
  LayoutDashboard, UserPlus, GraduationCap, Users, BookOpen, 
  CheckSquare, CreditCard, Award, FileText, Bus, Library, 
  Bell, Cpu, BarChart3, Settings, Menu, X, LogOut, ShieldAlert 
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  // Sidebar Menu Config
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'admissions', name: 'Admissions CRM', icon: UserPlus, module: 'admissions' },
    { id: 'students', name: 'Student Registry', icon: GraduationCap, module: 'students' },
    { id: 'staff', name: 'Faculty & Staff', icon: Users, module: 'staff' },
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
        return <div className="p-8 text-center text-text-muted">Module loading...</div>;
    }
  };

  const getBreadcrumbs = () => {
    const currentItem = menuItems.find(item => item.id === activeTab);
    return ['Portal', user.role, currentItem ? currentItem.name : 'Dashboard'];
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-stretch font-sans overflow-x-hidden">
      
      {/* Sidebar Panel */}
      <aside className={`bg-card border-r border-border/40 shrink-0 transition-all duration-300 flex flex-col justify-between relative z-20 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${
        // mobile absolute overlay toggle
        'fixed lg:static top-0 bottom-0 left-0 transform lg:translate-x-0 ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
      }`}>
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
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false); // auto close on tap in mobile
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeTab === item.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:text-foreground hover:bg-card-border/30'
                  }`}
                >
                  <IconComponent className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </button>
              );
            })}

          </nav>
        </div>

        {/* User Account / Logout */}
        <div className="p-3 border-t border-border/30">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-card-border/30 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <div className="text-left shrink overflow-hidden">
                <span className="font-bold text-xs text-foreground block truncate">{user.name}</span>
                <span className="text-[10px] text-text-muted block uppercase tracking-wider">{user.role}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="p-2.5 rounded-lg border border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-text-muted transition-colors cursor-pointer"
              title="Logout Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 px-6 border-b border-border/30 bg-background/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Sidebar trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg border border-border hover:bg-card text-text-muted hover:text-foreground cursor-pointer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted font-medium">
              {getBreadcrumbs().map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span>/</span>}
                  <span className={i === getBreadcrumbs().length - 1 ? 'text-foreground font-semibold' : ''}>{b}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Tenant details banner */}
            {user.school && (
              <div className="hidden md:flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-xl">
                <img src={user.school.logo} alt="Logo" className="w-4.5 h-4.5 rounded-md object-cover" />
                <span className="text-xs font-bold text-primary">{user.school.name}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Content canvas container */}
        <main className="p-6 sm:p-8 flex-grow overflow-y-auto max-h-[calc(100vh-64px)]">
          {renderActiveContent()}
        </main>

      </div>
    </div>
  );
}
