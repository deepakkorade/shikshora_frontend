import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Plus, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Skeleton from '../../components/ui/Skeleton';

export default function FeesModule() {
  const [activeSubTab, setActiveSubTab] = useState('invoices'); // invoices, structures
  const [invoices, setInvoices] = useState([]);
  const [structures, setStructures] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const triggerSuccess = (msg) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 4000);
  };

  // Forms Modals
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form Fields
  const [newStructure, setNewStructure] = useState({ name: '', amount: '', feeType: 'Tuition', classId: '' });
  const [generateForm, setGenerateForm] = useState({ classId: '', feeStructureId: '', dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'Card', transactionId: '' });

  const loadFeesData = async () => {
    setLoading(true);
    try {
      const invs = await api.get('/fees/invoices');
      setInvoices(invs);
      
      const structs = await api.get('/fees/structures');
      setStructures(structs);

      const clsList = await api.get('/academics/classes');
      setClasses(clsList);
    } catch (err) {
      setError(err.message || 'Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeesData();
  }, []);

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/structures', newStructure);
      setShowStructureModal(false);
      setNewStructure({ name: '', amount: '', feeType: 'Tuition', classId: '' });
      triggerSuccess('Fee structure created successfully.');
      loadFeesData();
    } catch (err) {
      setError(err.message || 'Failed to create fee structure');
    }
  };

  const handleGenerateInvoices = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/fees/invoices/generate', generateForm);
      triggerSuccess(res.message || 'Invoices generated successfully.');
      setShowGenerateModal(false);
      setGenerateForm({ classId: '', feeStructureId: '', dueDate: '' });
      loadFeesData();
    } catch (err) {
      setError(err.message || 'Failed to generate class invoices');
    }
  };

  const handleOpenPay = (invoice) => {
    setSelectedInvoice(invoice);
    const outstanding = parseFloat(invoice.totalAmount) - parseFloat(invoice.paidAmount);
    setPayForm({
      amount: outstanding.toString(),
      paymentMethod: 'UPI',
      transactionId: ''
    });
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees/payments', {
        invoiceId: selectedInvoice.id,
        ...payForm
      });
      triggerSuccess('Fee transaction completed successfully! Receipt generated.');
      setShowPayModal(false);
      loadFeesData();
    } catch (err) {
      setError(err.message || 'Payment failure');
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(invoices.length / itemsPerPage);

  if (loading) return <div className="p-6"><Skeleton.Page /></div>;

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fees Ledger & Accounting</h2>
          <p className="text-sm text-text-muted">Create billing structures, mass-invoice student classes, and checkout payments.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowStructureModal(true)} variant="secondary" size="sm" className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Fee Category
          </Button>
          <Button onClick={() => setShowGenerateModal(true)} size="sm" className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" /> Bill Student Class
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Tabs selectors */}
      <div className="flex gap-2 border-b border-border/40 pb-px">
        {['invoices', 'structures'].map(tab => (
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

      {/* SUB-VIEW 1: INVOICES REGISTRY */}
      {activeSubTab === 'invoices' && (
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Billed Student</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {currentInvoices.map((inv) => {
                  const outstanding = parseFloat(inv.totalAmount) - parseFloat(inv.paidAmount);
                  return (
                    <tr key={inv.id} className="hover:bg-card-border/5">
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <span className="block">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-text-muted">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {inv.Student?.User?.name || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">${inv.totalAmount}</td>
                      <td className="py-3.5 px-4 text-text-muted">
                        <span className="text-green-500 font-semibold">${inv.paidAmount} Paid</span>
                        <span className="block text-[10px] text-orange-500 font-bold">${outstanding.toFixed(2)} Outstanding</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                          inv.status === 'Partially Paid' ? 'bg-orange-500/10 text-orange-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="p-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 cursor-pointer"
                          >
                            Checkout Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-text-muted">No bill records generated yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
              <span className="text-xs text-text-muted">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, invoices.length)} of {invoices.length} entries
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
      )}

      {/* SUB-VIEW 2: FEE CATEGORIES */}
      {activeSubTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {structures.map((s) => (
            <div key={s.id} className="p-5 rounded-2xl bg-card border border-border/60 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-extrabold text-foreground text-sm block">{s.name}</span>
                  <span className="text-xs text-text-muted">Category: {s.feeType}</span>
                </div>
                <span className="text-xl font-black text-primary">${s.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD STRUCTURE CATEGORY */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Configure Fee Category</h3>
              <button onClick={() => setShowStructureModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleCreateStructure} className="space-y-4">
              <Input label="Structure Name *" value={newStructure.name} onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })} placeholder="e.g. Tuition Fee Q3" required />
              <Input label="Pricing Amount ($) *" type="number" value={newStructure.amount} onChange={(e) => setNewStructure({ ...newStructure, amount: e.target.value })} placeholder="200" required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted font-medium">Fee Type Category *</label>
                <select value={newStructure.feeType} onChange={(e) => setNewStructure({ ...newStructure, feeType: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="Admission">Admission Fee</option>
                  <option value="Tuition">Tuition Fee</option>
                  <option value="Exam">Exam Fee</option>
                  <option value="Transport">Transport Fee</option>
                  <option value="Library">Library Fee</option>
                  <option value="Annual">Annual Charges</option>
                  <option value="Other">Other Charges</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted font-medium">Target Class (Optional)</label>
                <select value={newStructure.classId} onChange={(e) => setNewStructure({ ...newStructure, classId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="">-- All Classes --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Button type="submit">Save Category</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MASS BILL STUDENT CLASS */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Mass Bill Class Students</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>
            
            <form onSubmit={handleGenerateInvoices} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Target Student Class *</label>
                <select value={generateForm.classId} onChange={(e) => setGenerateForm({ ...generateForm, classId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                  <option value="">-- Choose Class --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Fee Structure Bill Category *</label>
                <select value={generateForm.feeStructureId} onChange={(e) => setGenerateForm({ ...generateForm, feeStructureId: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none" required>
                  <option value="">-- Choose Structure --</option>
                  {structures.map(s => <option key={s.id} value={s.id}>{s.name} (${s.amount})</option>)}
                </select>
              </div>

              <Input label="Due Date *" type="date" value={generateForm.dueDate} onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })} required />

              <Button type="submit">Generate Class Invoices</Button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE CHECKOUT PAYMENT */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Record Payment Receipt</h3>
              <button onClick={() => setShowPayModal(false)} className="text-text-muted hover:text-foreground cursor-pointer">×</button>
            </div>

            <div className="p-3 bg-card-border/40 border border-border/40 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Invoice Ref:</span>
                <span className="font-bold text-foreground">#{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Student Name:</span>
                <span className="font-semibold text-foreground">{selectedInvoice.Student?.User?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total Due Balance:</span>
                <span className="font-extrabold text-primary">${(parseFloat(selectedInvoice.totalAmount) - parseFloat(selectedInvoice.paidAmount)).toFixed(2)}</span>
              </div>
            </div>
            
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <Input label="Payment Amount ($) *" type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} required />
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted font-medium">Payment Mode *</label>
                <select value={payForm.paymentMethod} onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })} className="w-full h-11 px-4 rounded-xl bg-input border border-border/50 text-sm text-foreground focus:outline-none">
                  <option value="Card">Credit/Debit Card</option>
                  <option value="UPI">UPI (GooglePay / PhonePe)</option>
                  <option value="Cash">Cash (Manual Collector)</option>
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                </select>
              </div>

              <Input label="Transaction ID / Check Number" value={payForm.transactionId} onChange={(e) => setPayForm({ ...payForm, transactionId: e.target.value })} placeholder="e.g. TXN-902341" />

              <Button type="submit">Record Receipt & Confirm</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
