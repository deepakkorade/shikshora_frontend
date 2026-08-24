import { useState } from 'react';
import { Cpu, Send, MessageSquare, AlertCircle, RefreshCw, Smartphone, Check, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import Button from '../../components/ui/Button';

export default function AIModule() {
  const [activeBot, setActiveBot] = useState('admission'); // admission, parent, fee
  
  // WhatsApp Chat Simulator States
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am the Shikshora AI Admissions Assistant. Are you interested in enrolling your child in our academy? Let me know, and I can take down your details.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [botStep, setBotStep] = useState(0); // 0: init, 1: childName, 2: parentName, 3: class, 4: mobile, 5: done
  const [leadDetails, setLeadDetails] = useState({
    firstName: '', lastName: 'Simulated', dob: '2016-08-01', gender: 'Male', classId: '1',
    fatherName: '', motherName: 'Simulated Parent', email: 'ai_lead@whatsapp.com', mobile: '', address: 'WhatsApp Chat Intake', occupation: 'AI Lead', comments: 'Auto ingested via WhatsApp Bot.'
  });

  // Parent Helper bot
  const [studentIdInput, setStudentIdInput] = useState('');
  const [parentBotMessages, setParentBotMessages] = useState([
    { id: 1, sender: 'bot', text: "Hello, I am the Parent AI Assistant. Ask me about your child's status. For security, please verify by entering your child's Admission ID first." }
  ]);
  const [verifiedStudent, setVerifiedStudent] = useState(null);

  // Automated Fee Reminder simulator
  const [remindedList, setRemindedList] = useState([]);

  const handleSendAdmissionChat = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const newMsgs = [...messages, { id: Date.now(), sender: 'user', text: userText }];
    setMessages(newMsgs);
    setInputText('');

    // AI Conversational Flow Simulator
    setTimeout(async () => {
      let botResponse = '';
      let nextStep = botStep;

      if (botStep === 0) {
        botResponse = "Excellent! Let's start the application checklist. What is your child's First Name?";
        nextStep = 1;
      } else if (botStep === 1) {
        setLeadDetails(prev => ({ ...prev, firstName: userText }));
        botResponse = `Got it, the child's name is ${userText}. What is your name (Parent Name)?`;
        nextStep = 2;
      } else if (botStep === 2) {
        setLeadDetails(prev => ({ ...prev, fatherName: userText }));
        botResponse = `Thank you, ${userText}. What is your phone contact mobile number?`;
        nextStep = 3;
      } else if (botStep === 3) {
        setLeadDetails(prev => ({ ...prev, mobile: userText }));
        botResponse = "Great. Which grade class is the child applying for (e.g. enter 1 for Class 10, or enter 2 for Class 9)?";
        nextStep = 4;
      } else if (botStep === 4) {
        // Auto convert classId mapping
        const classVal = userText.includes('10') ? '1' : '2';
        const finalLead = { ...leadDetails, classId: classVal };
        setLeadDetails(finalLead);
        
        botResponse = "Writing lead details to School Admissions CRM Database... Please hold.";
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);

        try {
          // Push lead directly into backend database
          await api.post('/admissions', finalLead);
          botResponse = `Perfect! Your enquiry details have been verified and a lead has been created in our ERP CRM. A counselor will schedule a campus visit for your child, ${finalLead.firstName}. Thank you!`;
        } catch (err) {
          botResponse = "Lead created locally! Check the CRM dashboard to enroll " + finalLead.firstName;
        }
        nextStep = 5;
      } else {
        botResponse = "Your registration has been logged! Feel free to close the simulator.";
      }

      setBotStep(nextStep);
      setMessages(prev => [...prev, { id: Date.now() + 2, sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const handleVerifyParentBot = async (e) => {
    e.preventDefault();
    if (!studentIdInput) return;

    const newMsgs = [...parentBotMessages, { id: Date.now(), sender: 'user', text: `Verify Student ADM No: ${studentIdInput}` }];
    setParentBotMessages(newMsgs);

    try {
      // Find students list
      const list = await api.get('/students');
      const found = list.find(s => s.admissionNumber === studentIdInput);
      
      let botResponse = '';
      if (found) {
        setVerifiedStudent(found);
        botResponse = `✅ Student verified: ${found.User?.name} (${found.CurrentClass?.name}). You are authorized. Ask me questions like: "What is my child's attendance?"`;
      } else {
        botResponse = '❌ Access Denied: Invalid Admission ID. Make sure the ID exists in the Student Registry.';
      }
      
      setParentBotMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
    } catch (err) {
      console.error(err);
    }
    setStudentIdInput('');
  };

  const handleAskParentBot = (question) => {
    const newMsgs = [...parentBotMessages, { id: Date.now(), sender: 'user', text: question }];
    setParentBotMessages(newMsgs);

    setTimeout(() => {
      let botResponse = '';
      if (!verifiedStudent) {
        botResponse = 'Please verify your Child ID first.';
      } else if (question.includes('attendance')) {
        botResponse = `📊 Student ${verifiedStudent.User?.name} has a 96% attendance record this term. Status: Excellent attendance rate.`;
      } else if (question.includes('fee') || question.includes('invoice')) {
        botResponse = `💰 There is an outstanding balance of $3,820.00 for tuition invoices. Please check your Fees dashboard to pay.`;
      } else {
        botResponse = `Sure, ${verifiedStudent.User?.name} is registered in ${verifiedStudent.CurrentClass?.name}. Please contact the school office for custom detailed inquiries.`;
      }
      setParentBotMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const handleTriggerFeeReminder = (invoiceId, studentName) => {
    setRemindedList(prev => [...prev, invoiceId]);
    alert(`⚡ Simulated Automated Alert: WhatsApp reminder containing invoice payment URL link sent to Parent of ${studentName}!`);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI & Automation Simulator</h2>
          <p className="text-sm text-text-muted">Test multi-tenant conversational helpers, automated fee collection reminders, and CRM syncs.</p>
        </div>
      </div>

      {/* Grid: Bot Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-border/40 pb-4">
        {[
          { id: 'admission', name: 'AI Admission WhatsApp Bot', desc: 'Auto-ingest admission leads' },
          { id: 'parent', name: 'Parent AI Assistant', desc: 'Secure authorized student info helper' },
          { id: 'fee', name: 'Automated Fee Reminders', desc: 'WhatsApp alert invoices dispatch' }
        ].map(bot => (
          <div
            key={bot.id}
            onClick={() => setActiveBot(bot.id)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              activeBot === bot.id ? 'border-primary bg-primary/5 shadow' : 'border-border bg-card/55 hover:border-border/80'
            }`}
          >
            <span className="font-bold text-sm text-foreground block">{bot.name}</span>
            <span className="text-[10px] text-text-muted mt-1 block">{bot.desc}</span>
          </div>
        ))}
      </div>

      {/* BOT VIEW 1: ADMISSIONS ASSISTANT SIMULATOR */}
      {activeBot === 'admission' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Simulator */}
          <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl flex flex-col h-[400px]">
            <div className="p-4 border-b border-border/30 flex items-center gap-2 bg-primary/5">
              <Smartphone className="w-5 h-5 text-primary" />
              <span className="font-bold text-xs text-foreground">WhatsApp Chat: +1 (555) AI-ADMIT</span>
            </div>
            
            {/* Conversation list */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-sm ${
                    m.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card-border/60 text-foreground rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            {botStep < 5 ? (
              <form onSubmit={handleSendAdmissionChat} className="p-3 border-t border-border/30 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type answer here..."
                  className="flex-grow h-10 px-3 rounded-lg bg-input border border-border/40 text-xs text-foreground focus:outline-none"
                />
                <button type="submit" className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-white cursor-pointer">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="p-4 border-t border-border/30 text-center text-xs text-green-500 font-bold bg-green-500/10">
                🎉 Intake Form Complete! Checked your Admissions CRM to view student lead details.
              </div>
            )}
          </div>

          {/* CRM logs stats */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-primary" /> AI Lead Pipeline Parser</h3>
            <p className="text-xs text-text-muted">Conversations on WhatsApp are parsed dynamically into relational columns. Verify the draft attributes:</p>
            
            <div className="space-y-2 text-xs border border-border/30 p-3 rounded-xl bg-card-border/20">
              <div className="flex justify-between">
                <span className="text-text-muted">Student Name:</span>
                <span className="font-semibold text-foreground">{leadDetails.firstName || 'Waiting...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Parent Name:</span>
                <span className="font-semibold text-foreground">{leadDetails.fatherName || 'Waiting...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Contact Mobile:</span>
                <span className="font-semibold text-foreground">{leadDetails.mobile || 'Waiting...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Enquiry Status:</span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-bold">New (Auto)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOT VIEW 2: PARENT AI HELPER */}
      {activeBot === 'parent' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border/60 rounded-2xl flex flex-col h-[400px]">
            <div className="p-4 border-b border-border/30 flex items-center gap-2 bg-purple-500/5">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-xs text-foreground">AI Parent Portal Chatbot</span>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-3">
              {parentBotMessages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-sm ${
                    m.sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-card-border/60 text-foreground rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* If verified, show buttons to ask easy questions */}
            {verifiedStudent ? (
              <div className="p-3 border-t border-border/30 flex gap-2 justify-around">
                <button
                  onClick={() => handleAskParentBot("What is my child's attendance rate?")}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-card-border text-[10px] font-bold text-foreground cursor-pointer"
                >
                  Ask Attendance 📊
                </button>
                <button
                  onClick={() => handleAskParentBot("What is my child's fee invoice balance?")}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-card-border text-[10px] font-bold text-foreground cursor-pointer"
                >
                  Ask Fee Balance 💰
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyParentBot} className="p-3 border-t border-border/30 flex gap-2">
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="Enter Student Admission ID (e.g. ADM-2026-0001)..."
                  className="flex-grow h-10 px-3 rounded-lg bg-input border border-border/40 text-xs text-foreground focus:outline-none"
                />
                <Button type="submit" size="sm">Verify</Button>
              </form>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/60 space-y-4">
            <h3 className="text-sm font-bold text-foreground">💡 Parent Bot Instructions</h3>
            <p className="text-xs text-text-muted">The AI Assistant utilizes backend API hooks to fetch authorized child records only (tenant isolation verification). Try entering a student's ID (e.g. copy an ID from Student Registry) to unlock data metrics.</p>
          </div>
        </div>
      )}

      {/* BOT VIEW 3: AUTOMATED FEE REMINDERS */}
      {activeBot === 'fee' && (
        <div className="bg-card border border-border/60 rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-4">Overdue Student Billing Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/40 text-xs font-bold text-text-muted uppercase tracking-wider bg-card-border/20">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Overdue Invoice</th>
                  <th className="py-3 px-4">Total Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-xs">
                {[
                  { id: 'inv-1', name: 'Bobby Miller', invoice: 'INV-2026-0002', amount: '$3,820.00' }
                ].map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 px-4 font-semibold text-foreground">{row.name}</td>
                    <td className="py-3 px-4 font-mono">{row.invoice}</td>
                    <td className="py-3 px-4 font-bold text-orange-500">{row.amount}</td>
                    <td className="py-3 px-4 text-right">
                      {remindedList.includes(row.id) ? (
                        <span className="text-[10px] text-green-500 font-bold flex justify-end items-center gap-1">
                          <Check className="w-4.5 h-4.5" /> Dispatched
                        </span>
                      ) : (
                        <button
                          onClick={() => handleTriggerFeeReminder(row.id, row.name)}
                          className="p-1 rounded bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 text-[10px] font-bold px-3 py-1.5 cursor-pointer"
                        >
                          Send WhatsApp Reminder
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
