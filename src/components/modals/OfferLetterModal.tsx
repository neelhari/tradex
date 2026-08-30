import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Download, 
  Award, 
  Building2, 
  Calendar, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const OfferLetterModal: React.FC = () => {
  const { 
    isOfferLetterModalOpen, 
    setIsOfferLetterModalOpen, 
    selectedOfferLetter,
    triggerToast
  } = useApp();

  if (!isOfferLetterModalOpen || !selectedOfferLetter) return null;

  const letter = selectedOfferLetter;
  const basicMonthly = Math.round(letter.monthlyGross * 0.5);
  const hraMonthly = Math.round(letter.monthlyGross * 0.3);
  const specialAllowance = letter.monthlyGross - (basicMonthly + hraMonthly);

  const handlePrint = () => {
    window.print();
    triggerToast('✓ Opening print dialog for Offer Letter...');
  };

  const handleDownload = () => {
    triggerToast(`✓ Offer letter for ${letter.candidateName} downloaded (PDF)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Employment Offer Letter
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">Verified Official</span>
              </h3>
              <p className="text-xs text-slate-400">{letter.candidateName} • {letter.roleTitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsOfferLetterModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable Letterhead) */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm font-sans bg-slate-50/50">
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Company Letterhead */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00C9A7] flex items-center justify-center text-slate-950 font-black text-xs font-mono">
                    TN
                  </div>
                  <span className="font-black text-lg text-[#0A2540] tracking-tight">TRADE NEXUS</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Enterprise Management & Operations Suite</p>
                <p className="text-[10px] text-slate-400">Bangalore Corporate Towers, Outer Ring Road, Bengaluru 560103</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  REF: TNX/HR/{letter.id.slice(-6).toUpperCase()}
                </span>
                <p className="text-[11px] text-slate-500">Date: <strong>{letter.issuedDate}</strong></p>
              </div>
            </div>

            {/* Candidate Address Line */}
            <div className="space-y-1 text-slate-700">
              <p className="font-bold text-slate-900 text-sm">To,</p>
              <p className="font-bold text-[#0A2540]">{letter.candidateName}</p>
              <p className="text-xs text-slate-500">{letter.candidateEmail} | {letter.candidatePhone}</p>
            </div>

            {/* Subject */}
            <div className="bg-teal-50/70 border-l-4 border-[#00C9A7] p-3 rounded-r-xl">
              <p className="font-bold text-teal-900">
                SUBJECT: LETTER OF EMPLOYMENT OFFER FOR THE POSITION OF {letter.roleTitle.toUpperCase()}
              </p>
            </div>

            {/* Body Text */}
            <div className="space-y-3 text-slate-600 leading-relaxed text-xs sm:text-[13px]">
              <p>
                Dear <strong>{letter.candidateName}</strong>,
              </p>
              <p>
                We are delighted to extend an offer of employment to you for the position of <strong>{letter.roleTitle}</strong> at Trade Nexus in the <strong>{letter.department}</strong> department.
              </p>
              <p>
                Your Date of Joining is confirmed for <strong>{letter.joiningDate}</strong> at our <strong>{letter.location}</strong> office. You will be reporting to <strong>{letter.reportingManager}</strong>.
              </p>
            </div>

            {/* Compensation Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                Compensation & Benefits Structure (CTC)
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Salary Component</th>
                      <th className="py-2.5 px-3 text-right">Monthly (INR)</th>
                      <th className="py-2.5 px-3 text-right">Annual (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700 text-xs">
                    <tr>
                      <td className="py-2 px-3 font-sans">Basic Salary (50%)</td>
                      <td className="py-2 px-3 text-right">₹{basicMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right">₹{(basicMonthly * 12).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">House Rent Allowance (HRA 30%)</td>
                      <td className="py-2 px-3 text-right">₹{hraMonthly.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right">₹{(hraMonthly * 12).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans">Special & Operational Allowance</td>
                      <td className="py-2 px-3 text-right">₹{specialAllowance.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right">₹{(specialAllowance * 12).toLocaleString('en-IN')}</td>
                    </tr>
                    <tr className="bg-teal-50/60 font-bold text-teal-900 border-t border-teal-200">
                      <td className="py-2.5 px-3 font-sans">Total Target Gross CTC</td>
                      <td className="py-2.5 px-3 text-right">₹{letter.monthlyGross.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right">₹{letter.annualCtc.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Terms Summary & Signatures */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500">Authorized Signatory</p>
                  <p className="font-bold text-slate-800 text-xs">Head of Human Resources</p>
                  <p className="text-[10px] text-teal-700 font-mono">Trade Nexus Global Ops</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Digitally Verified
                </div>
              </div>

              <div className="space-y-6 text-right">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-500">Candidate Acceptance</p>
                  <p className="font-bold text-slate-800 text-xs">{letter.candidateName}</p>
                  <p className="text-[10px] text-slate-400">Signature / Date</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Doc ID: {letter.id}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsOfferLetterModalOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-xs"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-md transition-all text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
