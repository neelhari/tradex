import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useListDefault } from '../../hooks/useListDefault';
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

  // Leads are allocated to callers; fall back to the full roster if no role
  // happens to match, so the feature is never blocked by role naming.
  const matchingCallers = teamMembers.filter((m) =>
    ['telecaller', 'sales', 'executive'].some((term) => (m.role ?? '').toLowerCase().includes(term))
  );
  const telecallers = matchingCallers.length ? matchingCallers : teamMembers;

  // Selected once the roster loads; the list arrives after first render.
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [fileName, setFileName] = useState('');
  const [pastedData, setPastedData] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Populated only from a file the user picks or rows they paste — never seeded.
  const [parsedLeads, setParsedLeads] = useState<Array<{ name: string; phone: string; company: string; city: string; email: string }>>([]);

  useListDefault(selectedEmployeeId, setSelectedEmployeeId, telecallers, (m) => m.id);

  if (!isExcelUploadModalOpen) return null;

  // Rows are name, phone, company, city, email — separated by comma, tab or pipe.
  const parseRows = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) return [];

    // Drop a header row if the first cell is clearly a column name
    const firstCell = lines[0].split(/[,\t|]/)[0].trim().toLowerCase();
    const rows = ['name', 'lead name', 'contact', 'contact name'].includes(firstCell)
      ? lines.slice(1)
      : lines;

    return rows
      .map((line) => {
        const [name, phone, company, city, email] = line.split(/[,\t|]/).map((p) => p.trim());
        return { name, phone: phone || '', company: company || '', city: city || '', email: email || '' };
      })
      .filter((r) => r.name);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);

    if (/\.xlsx?$/i.test(file.name)) {
      setParsedLeads([]);
      setParseError(
        'Binary .xls/.xlsx files cannot be read in the browser. Save the sheet as CSV, or paste the rows below.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseRows(String(reader.result ?? ''));
      setParsedLeads(rows);
      if (!rows.length) {
        setParseError('No usable rows found. Expected: name, phone, company, city, email');
      }
    };
    reader.onerror = () => setParseError('Could not read that file.');
    reader.readAsText(file);
  };

  const handleParseCustomText = () => {
    if (!pastedData.trim()) return;
    const records = parseRows(pastedData);
    if (!records.length) {
      setParseError('No usable rows found. Expected: name, phone, company, city, email');
      return;
    }
    setParsedLeads(records);
    setFileName(`Pasted_Import_${records.length}_Leads.csv`);
    setPastedData('');
    setParseError(null);
  };

  const targetEmp = teamMembers.find((m) => m.id === selectedEmployeeId);
  const canAllocate = parsedLeads.length > 0 && !!targetEmp;

  const handleImportAndAllocate = () => {
    if (!canAllocate || !targetEmp) return;
    importAndAssignLeads(fileName || 'Manual_Import.csv', targetEmp.id, targetEmp.name, parsedLeads);
    setParsedLeads([]);
    setFileName('');
    setIsExcelUploadModalOpen(false);
  };


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
              {telecallers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role} ({m.group})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Only <strong className="text-slate-800">{targetEmp?.name || 'the selected telecaller'}</strong> will see this allocated batch in their calling queue.
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
                {fileName || 'No file selected'}
              </span>
            </div>

            {parseError && (
              <p className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {parseError}
              </p>
            )}

            {!parsedLeads.length && !parseError && (
              <p className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                Choose a CSV file or paste rows to preview the batch. Expected columns: name, phone, company, city, email.
              </p>
            )}

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
              <strong>Confidentiality Rule:</strong> Caller numbers remain strictly assigned to {targetEmp?.name || 'the telecaller'} and live call statuses will stream to TL & Admin.
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
            disabled={!canAllocate}
            className="flex-1 max-w-xs flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold shadow-lg shadow-teal-600/20 transition-all text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {canAllocate
              ? `Allocate ${parsedLeads.length} Leads to ${targetEmp?.name.split(' ')[0]}`
              : 'Add leads to allocate'}
          </button>
        </div>

      </div>
    </div>
  );
};
