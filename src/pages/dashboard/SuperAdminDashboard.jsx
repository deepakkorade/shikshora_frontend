import { useState, useEffect } from 'react';
import { Globe, Shield, Calendar, Users, Award, DollarSign, Plus, Eye, Edit2, Check, X, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  // Fetch Stats and School Registry
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsData = await api.get('/superadmin/dashboard-stats');
      setStats(statsData);
      
      const schoolsList = await api.get('/superadmin/schools');
      setSchools(schoolsList);
    } catch (err) {
      setError(err.message || 'Failed to load Super Admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateStatus = async (schoolId, newStatus) => {
    try {
      await api.put(`/superadmin/schools/${schoolId}/status`, { status: newStatus });
      loadDashboardData(); // reload
    } catch (err) {
      alert(err.message || 'Failed to update school status');
    }
  };

  const handleDeleteSchool = async (schoolId) => {
    if (!confirm('Are you sure you want to delete this school and all associated tenant data? This action is irreversible.')) {
      return;
    }
    try {
      await api.delete(`/superadmin/schools/${schoolId}`);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to delete school');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-text-muted">Loading System SaaS Statistics...</span>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  const summary = stats?.summary || {};
  const charts = stats?.charts || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Super Admin Console</h1>
          <p className="text-sm text-text-muted">Global SaaS multi-tenant status and revenue metrics.</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="p-2.5 rounded-xl border border-border hover:bg-card text-text-muted transition-colors cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Schools */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Schools</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground">{summary.totalSchools || 0}</span>
            <div className="text-[10px] mt-1 text-green-500 font-semibold flex items-center gap-1">
              <span>{summary.activeSchools || 0} Active Schools</span>
            </div>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Monthly Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground">${summary.monthlyRevenue?.toFixed(2) || '0.00'}</span>
            <div className="text-[10px] mt-1 text-text-muted font-semibold">
              Projected MRR based on active plans
            </div>
          </div>
        </div>

        {/* Card 3: Total Students */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground">{summary.totalStudents || 0}</span>
            <div className="text-[10px] mt-1 text-text-muted font-semibold">
              Across all linked school branches
            </div>
          </div>
        </div>

        {/* Card 4: Subscriptions */}
        <div className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Pending Bills</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-foreground">${summary.pendingPayments?.toFixed(2) || '0.00'}</span>
            <div className="text-[10px] mt-1 text-orange-500 font-semibold">
              {summary.expiredSchools || 0} Expired Subscriptions
            </div>
          </div>
        </div>

      </div>

      {/* SVG Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Monthly Revenue History */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <h3 className="text-base font-bold text-foreground mb-4">Monthly Revenue History</h3>
          <div className="h-56 w-full flex items-end justify-between px-4 pb-2 border-b border-border/30 relative">
            
            {/* SVG Bars Chart */}
            {charts.monthlyRevenueHistory?.map((item, idx) => {
              const maxVal = Math.max(...charts.monthlyRevenueHistory.map(d => d.revenue), 100);
              const heightPct = (item.revenue / maxVal) * 100;
              return (
                <div key={idx} className="flex flex-col items-center group w-12 z-10">
                  <div className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    ${item.revenue.toFixed(0)}
                  </div>
                  <div 
                    className="w-8 bg-gradient-to-t from-primary/80 to-primary rounded-t-lg transition-all duration-500 ease-out shadow-lg hover:from-primary hover:to-primary-hover"
                    style={{ height: `${heightPct}%`, minHeight: '15px' }}
                  />
                  <span className="text-xs text-text-muted mt-2">{item.name}</span>
                </div>
              );
            })}

            {/* Grid line indicator */}
            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/10 z-0" />
            <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-border/10 z-0" />
          </div>
        </div>

        {/* Chart 2: Subscription Plans Distribution */}
        <div className="p-5 rounded-2xl bg-card border border-border/60">
          <h3 className="text-base font-bold text-foreground mb-4">Subscription Distribution</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-56">
            
            {/* Custom SVG Donut Chart */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border)" strokeWidth="4.2" className="opacity-10" />
                
                {/* Dynamically drawing wedges */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--primary)" strokeWidth="4.2" 
                  strokeDasharray="40 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="4.2" 
                  strokeDasharray="35 100" strokeDashoffset="-40" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4.2" 
                  strokeDasharray="25 100" strokeDashoffset="-75" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-foreground">{summary.totalSchools}</span>
                <span className="text-[9px] uppercase tracking-wider text-text-muted">Tenants</span>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-2 shrink-0">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>Enterprise (Starter / Demo)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Professional</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span>Starter Pack</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* School Registry Table */}
      <div className="p-5 rounded-2xl bg-card border border-border/60">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">School Tenant Directory</h3>
            <p className="text-xs text-text-muted">Activate, de-activate or manage registered institutions.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/30">
                <th className="py-3 px-4">School Profile</th>
                <th className="py-3 px-4">Type & Reg</th>
                <th className="py-3 px-4">SaaS Subscription</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {schools.map((school) => (
                <tr key={school.id} className="hover:bg-card-border/10 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img src={school.logo} alt="Logo" className="w-9 h-9 rounded-xl object-cover border border-border" />
                      <div>
                        <span className="font-semibold text-foreground block">{school.name}</span>
                        <span className="text-xs text-text-muted">{school.email} | {school.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-foreground block">{school.type}</span>
                    <span className="text-xs text-text-muted">Reg: {school.regNumber}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-primary block">{school.Subscription?.name || 'Custom'}</span>
                    <span className="text-xs text-text-muted">Expires: {school.subscriptionExpiresAt ? new Date(school.subscriptionExpiresAt).toLocaleDateString() : 'N/A'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      school.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                      school.status === 'Trial' ? 'bg-primary/10 text-primary' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {school.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateStatus(school.id, school.status === 'Active' ? 'Suspended' : 'Active')}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          school.status === 'Active' ? 'border-red-500/20 hover:bg-red-500/10 text-red-500' : 'border-green-500/20 hover:bg-green-500/10 text-green-500'
                        }`}
                        title={school.status === 'Active' ? 'Suspend School' : 'Activate School'}
                      >
                        {school.status === 'Active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteSchool(school.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                        title="Delete Tenant"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {schools.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">
                    No schools registered in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
