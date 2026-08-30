import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  UserPlus, 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles,
  Shield,
  FileText,
  UploadCloud,
  CheckCircle2,
  Landmark,
  MapPin,
  Briefcase,
  Hash
} from 'lucide-react';
import { UserRole } from '../../types';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { teamGroups, createNewEmployee } = useApp();

  // 1. Name
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // 2. Contact
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // 3. Position & Role
  const [position, setPosition] = useState('Senior Telecaller / SDR');
  const [role, setRole] = useState<UserRole>('telecaller');
  const [department, setDepartment] = useState('Sales & Client Acquisition');
  const [teamGroup, setTeamGroup] = useState(teamGroups[0]?.name || 'Alpha Growth Team');
  const [teamLeaderName, setTeamLeaderName] = useState(teamGroups[0]?.leaderName || 'Ramesh Sharma');

  // 4. Address
  const [address, setAddress] = useState('');

  // 5. Salary & Employee Type
  const [salary, setSalary] = useState<number>(35000);
  const [employeeType, setEmployeeType] = useState<'Full Time' | 'Intern' | 'Contract'>('Full Time');

  // 6. Documents (PAN & Aadhaar)
  const [panFile, setPanFile] = useState<string | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);

  // 7. Bank Details
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');

  // 8. Identity & Dates
  const [employeeId, setEmployeeId] = useState(`TNX-${Math.floor(8000 + Math.random() * 999)}`);
  const [dateOfJoining, setDateOfJoining] = useState('2025-06-01');
  const [salaryDate, setSalaryDate] = useState('1st of every month');

  if (!isOpen) return null;

  const handlePanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPanFile(file.name);
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAadhaarFile(file.name);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'telecaller') {
      setPosition('Telecaller Executive / SDR');
      setDepartment('Sales & Client Acquisition');
    } else if (newRole === 'team_leader') {
      setPosition('Team Leader & Sales Coach');
      setDepartment('Sales & Operations');
    } else if (newRole === 'hr') {
      setPosition('HR & People Operations Specialist');
      setDepartment('Human Resources');
    } else {
      setPosition('Operations Administrator');
      setDepartment('Executive Operations');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const basic = Math.round(salary * 0.5);
    const hra = Math.round(salary * 0.3);
    const allowance = salary - (basic + hra);

    createNewEmployee({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: fullName,
      email: emailAddress.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@tradenexus.io`,
      phone: mobileNumber.trim() || '+91 98450 12345',
      role,
      roleTitle: position,
      department,
      teamGroup,
      teamLeaderName,
      address: address.trim() || 'Bangalore Corporate HQ',
      employeeType,
      salary,
      basicSalary: basic,
      hra,
      specialAllowance: allowance,
      panDocumentName: panFile || 'PAN_Card_Scanned.pdf',
      aadhaarDocumentName: aadhaarFile || 'Aadhaar_Card_Verified.pdf',
      bankName: bankName.trim(),
      bankAccountNumber: bankAccountNumber.trim() || '50100482910482',
      bankIfscCode: bankIfscCode.trim() || 'HDFC0001234',
      empCode: employeeId,
      joiningDate: dateOfJoining,
      salaryDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="bg-[#0A192F] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#00C9A7] border border-teal-500/30 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Create Employee
                <span className="text-[10px] bg-teal-500/30 text-teal-300 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                  HR Onboarding
                </span>
              </h3>
              <p className="text-xs text-slate-400">Complete verification, payroll mapping, and document upload</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm font-sans">
          
          {/* SECTION 1: Personal & Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A2540] uppercase tracking-wider border-b border-slate-100 pb-1.5">
              <Users className="w-4 h-4 text-teal-600" />
              <span>1. Personal & Contact Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">FIRST NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srihari"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">LAST NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nair"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">MOBILE NUMBER *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98450 12345"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">EMAIL ADDRESS *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="srihari.n@tradenexus.io"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">EMPLOYEE ADDRESS *</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <textarea
                  rows={2}
                  required
                  placeholder="Flat / House No, Street, Landmark, City, State, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Role, Designation & Employment Type */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A2540] uppercase tracking-wider border-b border-slate-100 pb-1.5">
              <Briefcase className="w-4 h-4 text-teal-600" />
              <span>2. Position & Employment Type</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">EMPLOYEE POSITION *</label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Telecaller Executive"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">EMPLOYEE TYPE *</label>
                <select
                  value={employeeType}
                  onChange={(e) => setEmployeeType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Intern">Intern</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">SYSTEM ROLE</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="telecaller">Telecaller (Calling CRM)</option>
                  <option value="team_leader">Team Leader (TL Supervisor)</option>
                  <option value="hr">HR Specialist</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ASSIGN SQUAD / TEAM</label>
                <select
                  value={teamGroup}
                  onChange={(e) => setTeamGroup(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {teamGroups.map((grp) => (
                    <option key={grp.id} value={grp.name}>
                      {grp.name} (TL: {grp.leaderName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">REPORTING TEAM LEADER</label>
                <input
                  type="text"
                  value={teamLeaderName}
                  onChange={(e) => setTeamLeaderName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Salary, Salary Date & Employee ID */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A2540] uppercase tracking-wider border-b border-slate-100 pb-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>3. Compensation & Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">EMPLOYEE SALARY (₹ Monthly) *</label>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value) || 0)}
                  placeholder="e.g. 35000"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">SALARY DISBURSEMENT DATE *</label>
                <select
                  value={salaryDate}
                  onChange={(e) => setSalaryDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="1st of every month">1st of every month</option>
                  <option value="5th of every month">5th of every month</option>
                  <option value="7th of every month">7th of every month</option>
                  <option value="10th of every month">10th of every month</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">EMPLOYEE ID *</label>
                <div className="relative">
                  <Hash className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">DATE OF JOINING *</label>
              <div className="relative max-w-xs">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={dateOfJoining}
                  onChange={(e) => setDateOfJoining(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: PAN & Aadhaar Upload */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A2540] uppercase tracking-wider border-b border-slate-100 pb-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>4. KYC Document Uploads (PAN & Aadhaar)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PAN Upload */}
              <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/80 hover:bg-teal-50/30 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-colors">
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handlePanUpload} />
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 block">PAN CARD UPLOAD</span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {panFile ? `✓ ${panFile}` : 'Upload PDF / PNG / JPG'}
                  </span>
                </div>
              </label>

              {/* Aadhaar Upload */}
              <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50/80 hover:bg-teal-50/30 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-colors">
                <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleAadhaarUpload} />
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 block">AADHAAR CARD UPLOAD</span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {aadhaarFile ? `✓ ${aadhaarFile}` : 'Upload PDF / PNG / JPG'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* SECTION 5: Bank Details */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A2540] uppercase tracking-wider border-b border-slate-100 pb-1.5">
              <Landmark className="w-4 h-4 text-teal-600" />
              <span>5. Employee Bank Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">BANK NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC / ICICI / SBI"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ACCOUNT NUMBER *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50100482910482"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">IFSC CODE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC0001234"
                  value={bankIfscCode}
                  onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions with CREATE EMPLOYEE button */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100 transition-colors text-xs"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="flex-1 max-w-sm flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black shadow-lg shadow-teal-600/25 transition-all text-xs active:scale-98 uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              <span>CREATE EMPLOYEE</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
