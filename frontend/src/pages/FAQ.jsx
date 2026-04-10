import { ChevronDown, ChevronUp, HelpCircle, Phone, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const citizenFaqs = [
  { q: 'How do I submit a new complaint?', a: 'Click "New Complaint" in the sidebar, fill in the details including category, location, description, and optionally attach an image. Click Submit to file your report.' },
  { q: 'How long does it take to resolve a complaint?', a: 'Resolution times depend on the complexity and category. Road issues typically take 7–14 days, water issues 3–7 days, and electricity issues 1–3 days. You will be notified at every status change.' },
  { q: 'Can I track the status of my complaint?', a: 'Yes! Go to "My Complaints" in the sidebar. Each complaint shows a live progress timeline: Pending → In Progress → Resolved. You also receive bell notifications for every update.' },
  { q: 'What categories of complaints can I file?', a: 'You can file complaints under: Road, Water, Electricity, Garbage, and Other. Choose the most relevant category for faster routing to the right department.' },
  { q: 'Will I receive notifications about my complaint?', a: 'Yes. You will receive an in-app notification whenever an official updates your complaint status. Check the bell icon in the top bar or visit the Notifications page.' },
  { q: 'Can I delete or edit a complaint after submitting?', a: 'Citizens cannot edit or delete complaints once submitted. If you made an error, please contact the support team at support@city.com with your complaint details.' },
  { q: 'What should I do if the issue is urgent or life-threatening?', a: 'Do NOT use this portal for emergencies. Contact emergency services immediately: Police 100, Fire 101, Ambulance 108. This portal is for non-emergency civic complaints only.' },
];

const staffFaqs = [
  { q: 'How do I view complaints assigned to me?', a: 'Navigate to "My Assignments" in the sidebar. Here you will see all complaints that an Administrator has assigned to you for resolution.' },
  { q: 'How do I mark a complaint as completed?', a: 'In your assignments list, click the "Complete" button on the specific complaint, enter the required completion notes detailing the work done, and submit to update its status.' },
  { q: 'What happens after I complete a complaint?', a: 'The complaint status changes to "Completed". It is then sent back to the Administrators for final review and verification before they officially mark it as "Resolved".' },
  { q: 'How do I receive completely new assignments?', a: 'Administrators manually assign complaints to staff based on category and workload. Whenever you receive a new assignment, you will get an in-app notification.' },
  { q: 'Can I reassign a complaint to another staff member?', a: 'No, staff cannot reassign complaints. If a complaint is incorrectly assigned to you, please contact the Administrator.' },
];

const adminFaqs = [
  { q: 'How do I assign complaints to staff?', a: 'Go to the "Admin Panel", locate the incoming complaint, and click the purple "Assign to Staff" (user plus) icon to select a registered staff member.' },
  { q: 'When should I use the "Resolve" button?', a: 'Use the green "Resolve" button once a staff member has marked a complaint as "Completed" and you have verified their completion notes.' },
  { q: 'How can I view staff performance?', a: 'Navigate to "User Management" and filter by "Staff". You can see the total number of complaints assigned and resolved for each staff member.' },
  { q: 'What is the "Export PDF" feature used for?', a: 'The "Export PDF" button in the Admin Panel generates a comprehensive audit log of all complaints, useful for municipal reporting and archiving.' },
  { q: 'Can I permanently delete a complaint?', a: 'Yes, but this should be done rarely and only for spam or duplicate reports. Use the red trash icon in the Admin Panel to permanently remove a record from the database.' },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  const { user } = useAuth();
  
  const faqs = user?.role === 'admin' ? adminFaqs : user?.role === 'staff' ? staffFaqs : citizenFaqs;

  return (
    <div className="space-y-8 animate-fade-in ">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Support</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Help & FAQ <HelpCircle className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">Answers to the most common questions about the portal</p>
      </header>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-7 py-5 text-left"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-bold text-slate-800 pr-4">{faq.q}</span>
              {open === i
                ? <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              }
            </button>
            {open === i && (
              <div className="px-7 pb-5">
                <div className="w-full h-[1px] bg-slate-100 mb-4" />
                <p className="text-slate-600 font-medium leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Support Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white">
        <h3 className="text-xl font-black mb-2">Still need help?</h3>
        <p className="text-indigo-200 font-medium mb-6">Reach out to our support team directly.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Phone, label: 'Helpline', value: '1800-City-Help' },
            { icon: Mail, label: 'Email', value: 'support@city.com' },
            { icon: MessageSquare, label: 'Live Chat', value: 'Mon–Fri, 9AM–6PM' },
          ].map(c => (
            <div key={c.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 border border-white/10">
              <c.icon className="w-5 h-5 text-indigo-200 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">{c.label}</p>
                <p className="text-sm font-bold text-white">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
