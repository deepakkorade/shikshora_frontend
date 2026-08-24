import { useState } from 'react';
import { BarChart3, Filter, FileText, Download, CheckCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function ReportsModule() {
  const [reportType, setReportType] = useState('students'); // students, fees, attendance
  const [classFilter, setClassFilter] = useState('');

  // Sample static data tables to filter & download
  const studentReportData = [
    { admNo: 'ADM-2026-0001', name: 'Alice Miller', class: 'Class 10', roll: '14', date: '2026-08-23' },
    { admNo: 'ADM-2026-0002', name: 'Bobby Miller', class: 'Class 7', roll: '08', date: '2026-08-23' }
  ];

  const feeReportData = [
    { invNo: 'INV-2026-0001', student: 'Alice Miller', total: '200.00', paid: '200.00', status: 'Paid' },
    { invNo: 'INV-2026-0002', student: 'Bobby Miller', total: '3820.00', paid: '0.00', status: 'Unpaid' }
  ];

  const attendanceReportData = [
    { student: 'Alice Miller', presentDays: '18', absentDays: '0', leaves: '0', rate: '100%' },
    { student: 'Bobby Miller', presentDays: '16', absentDays: '2', leaves: '0', rate: '88%' }
  ];

  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (reportType === 'students') {
      headers = ['Admission Number', 'Student Name', 'Class Room', 'Roll Number', 'Registration Date'];
      rows = studentReportData.map(r => [r.admNo, r.name, r.class, r.roll, r.date]);
      filename = 'Student_Registry_Report.csv';
    } else if (reportType === 'fees') {
      headers = ['Invoice Number', 'Student Name', 'Total Bill', 'Paid Balance', 'Status'];
      rows = feeReportData.map(r => [r.invNo, r.student, r.total, r.paid, r.status]);
      filename = 'Fees_Collection_Report.csv';
    } else {
      headers = ['Student Name', 'Days Present', 'Days Absent', 'Approved Leaves', 'Attendance Rate'];
      rows = attendanceReportData.map(r => [r.student, r.presentDays, r.absentDays, r.leaves, r.rate]);
      filename = 'Attendance_Statistics_Report.csv';
    }

    // Compile CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    // Trigger download in browser
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Reports Center</h2>
          <p className="text-sm text-text-muted">Export clean CSV spreadsheets for student demographics, fee ledgers, or attendance logs.</p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-1.5">
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </Button>
      </div>

      {/* Filter panel */}
      <div className="flex flex-wrap gap-4 items-end bg-card border border-border/60 p-4 rounded-2xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted">Report Category</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none w-52"
          >
            <option value="students">Student Registry Directory</option>
            <option value="fees">Fee Collections Ledger</option>
            <option value="attendance">Class Attendance Statistics</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-text-muted">Filter Class</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-10 px-3 rounded-lg bg-input border border-border/50 text-xs text-foreground focus:outline-none w-44"
          >
            <option value="">-- All Classes --</option>
            <option value="10">Class 10</option>
            <option value="9">Class 9</option>
            <option value="7">Class 7</option>
          </select>
        </div>
      </div>

      {/* Render tables */}
      <div className="bg-card border border-border/60 rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 capitalize">{reportType} Preview Table</h3>
        
        <div className="overflow-x-auto text-xs">
          {reportType === 'students' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/40 text-text-muted font-bold uppercase tracking-wider bg-card-border/20">
                  <th className="py-2.5 px-4">Adm No.</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Roll</th>
                  <th className="py-2.5 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {studentReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-card-border/5">
                    <td className="py-2.5 px-4 font-mono font-bold">{r.admNo}</td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">{r.name}</td>
                    <td className="py-2.5 px-4">{r.class}</td>
                    <td className="py-2.5 px-4">#{r.roll}</td>
                    <td className="py-2.5 px-4 text-text-muted">{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'fees' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/40 text-text-muted font-bold uppercase tracking-wider bg-card-border/20">
                  <th className="py-2.5 px-4">Invoice No.</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Total Billed</th>
                  <th className="py-2.5 px-4">Paid Balance</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {feeReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-card-border/5">
                    <td className="py-2.5 px-4 font-mono font-bold">{r.invNo}</td>
                    <td className="py-2.5 px-4 font-semibold text-foreground">{r.student}</td>
                    <td className="py-2.5 px-4 font-bold">${r.total}</td>
                    <td className="py-2.5 px-4 text-green-500 font-semibold">${r.paid}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'attendance' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/40 text-text-muted font-bold uppercase tracking-wider bg-card-border/20">
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Days Present</th>
                  <th className="py-2.5 px-4">Days Absent</th>
                  <th className="py-2.5 px-4">Approved Leaves</th>
                  <th className="py-2.5 px-4">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {attendanceReportData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-card-border/5">
                    <td className="py-2.5 px-4 font-semibold text-foreground">{r.student}</td>
                    <td className="py-2.5 px-4 text-green-500 font-semibold">{r.presentDays} Days</td>
                    <td className="py-2.5 px-4 text-red-500 font-semibold">{r.absentDays} Days</td>
                    <td className="py-2.5 px-4">{r.leaves} Days</td>
                    <td className="py-2.5 px-4 font-bold text-foreground">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
