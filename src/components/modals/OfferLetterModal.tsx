import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Printer, 
  Download, 
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Globe
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
  const firstName = letter.candidateName.split(' ')[0] || letter.candidateName;
  const formattedSalary = letter.monthlyGross 
    ? `INR ${letter.monthlyGross.toLocaleString('en-IN')}` 
    : 'INR 7,00,000';
  const address = letter.candidateAddress || '123 Anywhere St., Any City, ST 12345';
  const deadline = letter.acceptanceDeadline || 'August 30, 2025';
  const signatory = letter.signatoryName || 'Arun Leob';
  const signatoryRole = letter.signatoryRole || 'HR Manager';

  const handlePrint = () => {
    window.print();
    triggerToast('✓ Opening print dialog for Job Offer Letter...');
  };

  const handleDownload = () => {
    triggerToast(`✓ Offer letter for ${letter.candidateName} ready to print/save as PDF`);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Control Bar */}
        <div className="bg-[#0A192F] px-5 py-3 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C9A7] animate-pulse" />
            <span className="font-bold text-xs sm:text-sm tracking-wide text-slate-200">
              Official Job Offer Letter Document
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button 
              onClick={() => setIsOfferLetterModalOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Sheet (Exact Image 4 Pixel-Perfect Template) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100/70 flex justify-center">
          
          <div 
            id="offer-letter-sheet"
            className="w-full max-w-[650px] bg-white text-slate-800 shadow-xl rounded-2xl overflow-hidden relative border border-slate-200 flex flex-col justify-between"
            style={{ minHeight: '850px' }}
          >
            
            {/* Top Navy Header Banner with Diagonal Teal Wedge (Matching Image 4) */}
            <div className="relative bg-[#06152B] text-white px-6 sm:px-8 pt-7 pb-6 overflow-hidden">
              
              {/* Teal angled bottom line banner */}
              <div className="absolute -bottom-1 left-0 right-0 h-2.5 bg-[#00A88B]" />
              <div className="absolute bottom-1 left-0 w-2/3 h-1 bg-[#38E1B7]" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                {/* Left: Brand Logo & Title */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00C9A7] to-[#0A2540] p-0.5 shadow-md shadow-[#00C9A7]/40 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#06152B] flex items-center justify-center text-[#00C9A7]">
                      <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                    </div>
                  </div>
                  <div>
                    <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wider leading-none">
                      TRADE NEXUS
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-px w-5 bg-[#00C9A7]" />
                      <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#00C9A7]">
                        TRADE SMART
                      </span>
                      <span className="h-px w-5 bg-[#00C9A7]" />
                    </div>
                  </div>
                </div>

                {/* Right: Document Title */}
                <div className="sm:text-right">
                  <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wider uppercase">
                    JOB OFFER LETTER
                  </h2>
                  <div className="h-0.5 w-full bg-[#00C9A7] mt-1" />
                </div>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-9 space-y-6 flex-1 relative">
              
              {/* Background Watermark (Bottom Right) */}
              <div className="absolute right-6 bottom-16 opacity-5 pointer-events-none select-none">
                <div className="w-64 h-64 rounded-full border-8 border-[#0A2540] flex items-center justify-center">
                  <TrendingUp className="w-40 h-40 text-[#0A2540] stroke-[2]" />
                </div>
              </div>

              {/* Company Info & Issue Date */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-4 text-xs">
                <div className="space-y-1.5 text-slate-700">
                  <p className="font-display font-extrabold text-sm text-[#0A2540]">Trade Nexus</p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-[#00A88B] flex-shrink-0" />
                    <span>123 Business Avenue, Financial District, Your City, 500001</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-[#00A88B] flex-shrink-0" />
                    <span>+91 98765 43210</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-[#00A88B] flex-shrink-0" />
                    <span>info@tradenexus.com</span>
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Globe className="w-3.5 h-3.5 text-[#00A88B] flex-shrink-0" />
                    <span>www.tradenexus.com</span>
                  </p>
                </div>

                <div className="sm:text-right font-semibold text-slate-700 text-xs">
                  <span>{letter.issuedDate || '24 August 2025'}</span>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-slate-500">To,</p>
                <p className="font-display font-black text-sm sm:text-base text-[#0A2540]">
                  {letter.candidateName}
                </p>
                <p className="text-slate-600">{address}</p>
                <p className="text-slate-500 text-[11px] font-mono">{letter.candidateEmail} • {letter.candidatePhone}</p>
              </div>

              {/* Salutation & Offer Letter Text (Exact Copy from Image 4) */}
              <div className="space-y-3.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                <p>Dear <strong className="text-[#0A2540]">{firstName}</strong>,</p>

                <p>
                  We are pleased to offer you the position of{' '}
                  <strong className="text-[#00A88B] font-bold">{letter.roleTitle}</strong> at{' '}
                  <strong className="text-[#0A2540] font-bold">Trade Nexus</strong>, starting on{' '}
                  <strong className="text-[#00A88B] font-bold">{letter.joiningDate}</strong>. In this role, you will report to{' '}
                  <strong className="text-[#00A88B] font-bold">{letter.reportingManager}</strong> and will be based at our corporate office.
                </p>

                <p>
                  Your monthly salary will be <strong className="text-[#0A2540] font-bold">{formattedSalary}</strong>, along with benefits including health insurance, paid leave, internet allowance, and performance bonuses. Full details will be shared upon confirmation.
                </p>

                <p>
                  Please confirm your acceptance by signing and returning this letter by{' '}
                  <strong className="text-[#00A88B] font-bold">{deadline}</strong>.
                </p>

                <p>
                  We look forward to having you onboard and seeing your strategic ideas come to life!
                </p>
              </div>

              {/* Sign-off & Signature Seal */}
              <div className="pt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600">Warm Regards,</p>
                
                {/* Handwritten Signature SVG Simulation */}
                <div className="py-1">
                  <svg className="w-36 h-10 text-[#0A2540]" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 28C25 10 35 32 45 15C55 5 60 30 75 18C85 10 95 32 110 20C120 12 135 25 145 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M25 35C45 33 80 34 135 31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>

                <div className="space-y-0.5">
                  <p className="font-display font-black text-sm text-[#00A88B]">{signatory}</p>
                  <p className="text-xs font-semibold text-slate-700">{signatoryRole}</p>
                  <p className="text-xs text-slate-500">Trade Nexus</p>
                </div>
              </div>

            </div>

            {/* Bottom Navy Bar with Contact Links (Matching Image 4) */}
            <div className="bg-[#06152B] text-white px-6 py-3.5 border-t-2 border-[#00A88B] flex flex-wrap items-center justify-between text-[11px] gap-2 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Phone className="w-3.5 h-3.5 text-[#00C9A7]" />
                +91 98765 43210
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-slate-200">
                <Mail className="w-3.5 h-3.5 text-[#00C9A7]" />
                info@tradenexus.com
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-slate-200">
                <Globe className="w-3.5 h-3.5 text-[#00C9A7]" />
                www.tradenexus.com
              </span>
            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsOfferLetterModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 text-xs"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00A88B] to-[#00C9A7] text-[#0A2540] font-black text-xs shadow-sm hover:brightness-105 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download &amp; Dispatch PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
