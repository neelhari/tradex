import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const ExcelLeadUploadModal: React.FC = () => {
  const { 
    isExcelUploadModalOpen, 
    setIsExcelUploadModalOpen, 
    teamMembers, 
    importAndAssignLeads 
  } = useApp();

  const telecallers = teamMembers.filter(m => 
    m.role.toLowerCase().includes('telecaller') || 
    m.role.toLowerCase().includes('sales') ||
    m.role.toLowerCase().includes('executive')
  );

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(telecallers[0]?.id || 'emp-102');
  const [fileName, setFileName] = useState('TradeNexus_Q3_Inbound_Leads.xlsx');
  const [pastedData, setPastedData] = useState('');

  // Pre-loaded sample leads for realistic immediate import
  const [parsedLeads, setParsedLeads] = useState<Array<{ name: string; phone: string; company: string; city: string; email: string }>>([
    { name: 'Nikhil Kashyap', phone: '+91 98450 11990', company: 'Kashyap Exports Ltd', city: 'Mumbai', email: 'nikhil@kashyapexports.in' },
    { name: 'Rajendra Joshi', phone: '+91 97123 44556', company: 'Joshi Auto Ancillaries', city: 'Pune', email: 'r.joshi@joshiauto.com' },
    { name: 'Aakash Verma', phone: '+91 99002 33112', company: 'Apex Infotech Hub', city: 'Bengaluru', email: 'aakash@apexinfo.io' },
    { name: 'Sunita Mehra', phone: '+91 96554 22118', company: 'BlueSky Warehousing', city: 'Delhi NCR', email: 'sunita@blueskyware.com' },
    { name: 'Gaurav Singhal', phone: '+91 98331 77665', company: 'Singhal Commodities', city: 'Ahmedabad', email: 'gaurav@singhalgroup.com' },
    { name: 'Pooja Deshmukh', phone: '+91 97220 88991', company: 'Horizon Renewable Energy', city: 'Hyderabad', email: 'pooja.d@horizonenergy.com' },
  ]);

  if (!isExcelUploadModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Generate synthetic parsed records from filename if custom file
      const newItems = Array.from({ length: 8 }).map((_, idx) => ({
        name: `Lead Contact #${idx + 1}`,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
        company: `${file.name.replace(/\.[^/.]+$/, '')} Enterprise ${idx + 1}`,
        city: ['Mumbai', 'Bengaluru', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'][idx % 6],
        email: `lead${idx + 1}@${file.name.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      }));
      setParsedLeads(newItems);
    }
  };

  const handleParseCustomText = () => {
    if (!pastedData.trim()) return;
    const lines = pastedData.trim().split('\n');
    const records = lines.map((line, idx) => {
      const parts = line.split(/[,\t|]/).map(p => p.trim());
      return {
        name: parts[0] || `Lead Contact ${idx + 1}`,
        phone: parts[1] || `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
        company: parts[2] || 'Direct Enterprise Import',
        city: parts[3] || 'Pan-India',
        email: parts[4] || `contact${idx + 1}@enterprise.in`,
      };
    });
    if (records.length > 0) {
      setParsedLeads(records);
      setFileName(`Custom_Import_${records.length}_Leads.csv`);
      setPastedData('');
    }
  };

  const handleImportAndAllocate = () => {
    const targetEmp = teamMembers.find(m => m.id === selectedEmployeeId) || telecallers[0] || { id: 'emp-102', name: 'Nikhil Sharma' };
    importAndAssignLeads(fileName, targetEmp.id, targetEmp.name, parsedLeads);
    setIsExcelUploadModalOpen(false);
  };

  const selectedTargetEmp = teamMembers.find(m => m.id === selectedEmployeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#00C9A7] border border-teal-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Import & Allocate Leads
                <span className="text-[10px] bg-teal-500/30 text-teal-300 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">Excel / CSV</span>
              </h3>
              <p className="text-xs text-slate-400">Assign confidential caller batches directly to telecallers</p>
            </div>
          </div>
          <button 
            onClick={() => setIsExcelUploadModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800 text-xs sm:text-sm">
          
          {/* Step 1: Target Telecaller Selection */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#00C9A7]" />
                1. Select Assigned Telecaller
              </span>
              <span className="text-[10px] font-normal text-slate-500">Confidential Allocation</span>
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role} ({m.group})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Only <strong className="text-slate-800">{selectedTargetEmp?.name || 'Selected Telecaller'}</strong> will see this allocated batch in their calling queue.
            </p>
          </div>

          {/* Step 2: Upload File or Quick Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
              2. Upload Spreadsheet or Paste Leads
            </label>

            {/* Drop Zone */}
            <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group">
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-[#00C9A7] transition-colors mb-1.5" />
              <p className="text-xs font-bold text-slate-700 group-hover:text-teal-700">
                Click to browse or drop .xlsx, .csv file
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supports standard lead columns (Name, Phone, Company, City)</p>
            </label>

            {/* Quick Paste Accordion */}
            <div className="pt-1">
              <textarea
                placeholder="Or paste CSV rows: Name, Phone, Company, City..."
                rows={2}
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              {pastedData.trim() && (
                <button
                  type="button"
                  onClick={handleParseCustomText}
                  className="mt-1 px-3 py-1 bg-teal-600 text-white rounded-lg text-[11px] font-bold hover:bg-teal-700 transition-colors"
                >
                  Parse & Add Pasted Leads
                </button>
              )}
            </div>
          </div>

          {/* Step 3: Parsed Lead Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                3. Preview Batch ({parsedLeads.length} Leads)
              </span>
              <span className="text-[11px] font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-mono">
                {fileName}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-white">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Lead Name</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Company</th>
                    <th className="py-2 px-3">City</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedLeads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2 px-3 font-semibold text-slate-800">{lead.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{lead.phone}</td>
                      <td className="py-2 px-3 text-slate-600">{lead.company}</td>
                      <td className="py-2 px-3 text-slate-500">{lead.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-[11px]">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Confidentiality Rule:</strong> Caller numbers remain strictly assigned to {selectedTargetEmp?.name || 'the telecaller'} and live call statuses will stream to TL & Admin.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsExcelUploadModalOpen(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-xs"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleImportAndAllocate}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Allocate {parsedLeads.length} Leads to {selectedTargetEmp?.name.split(' ')[0] || 'Telecaller'}
          </button>
        </div>

      </div>
    </div>
  );
};
