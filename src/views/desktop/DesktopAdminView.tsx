import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  UserCheck, 
  Layers, 
  Shield, 
  Download, 
  Plus, 
  FileSpreadsheet, 
  Search, 
  Settings, 
  Lock, 
  Key, 
  Building, 
  Sliders, 
  Crown, 
  TrendingUp, 
  PhoneCall, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ExcelLeadUploadModal } from '../../components/modals/ExcelLeadUploadModal';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';

interface DesktopAdminViewProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const DesktopAdminView: React.FC<DesktopAdminViewProps> = ({
  currentTab = 'home',
  onTabChange
}) => {
  const { 
    teamMembers, 
    teamGroups, 
    leadBatches, 
    assignedLeads, 
    setIsExcelUploadModalOpen, 
    assignTeamLeaderToGroup, 
    triggerToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<string>(currentTab);
  const activeTab = onTabChange ? currentTab : activeSubTab;
  const setTab = onTabChange || setActiveSubTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Dynamic Stats from SQLite database
  const totalUsers = teamMembers.length;
  const activeUsers = teamMembers.filter(m => m.attendanceStatus === 'PRESENT').length;
  const totalTeams = teamGroups.length;
  const totalRoles = 4; // Telecaller, Team Leader, HR, Admin

  const exportGlobalAuditCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Role,Group,Status,CheckIn,Dials,Sales Achieved\n"
      + teamMembers.map(e => `"${e.name}","${e.role}","${e.group}","${e.attendanceStatus}","${e.checkInTime || 'N/A'}",${e.dialsToday},${e.salesAchieved}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Global_Master_Audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Exported Master System Audit Report (CSV)');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Top Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
              Hello, System Admin
            </h2>
            <span className="text-xl">👑</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Enterprise Control & Governance • <span className="text-[#00A88B] font-bold">Global Master Portal</span> • <strong className="text-emerald-600">● SQLite Database Online</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportGlobalAuditCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Master Audit CSV</span>
          </button>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 bg-[#E6FAF6] border border-[#00C9A7]/30 text-[#00A88B] font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-[#00C9A7]/20 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard User</span>
          </button>

          <button
            onClick={() => setIsExcelUploadModalOpen(true)}
            className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
            <span>Import Leads (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Widescreen 4-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1: Total Users */}
        <div 
          onClick={() => setTab('users')}
          className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#00C9A7] transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Registered Accounts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{totalUsers}</span>
              <span className="text-xs font-bold text-slate-400">Total Users</span>
            </div>
            <span className="text-xs text-[#00A88B] font-extrabold mt-1 block group-hover:underline">
              Manage Directory →
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#E6FAF6] text-[#00C9A7] flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div 
          onClick={() => setTab('users')}
          className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Sessions
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-emerald-600">{activeUsers}</span>
              <span className="text-xs font-bold text-slate-400">/ {totalUsers} Online</span>
            </div>
            <span className="text-xs text-emerald-600 font-extrabold mt-1 block">
              {Math.round((activeUsers / Math.max(1, totalUsers)) * 100)}% Activity Rate
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Squads / Teams */}
        <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Sales Squads
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{totalTeams}</span>
              <span className="text-xs font-bold text-slate-400">Teams</span>
            </div>
            <span className="text-xs text-sky-600 font-extrabold mt-1 block">
              3 Squad Leaders
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Lead Batches */}
        <div 
          onClick={() => setTab('leads')}
          className="nexus-card p-5 bg-white border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all group"
        >
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Imported Batches
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-black text-2xl text-[#0A2540]">{leadBatches.length}</span>
              <span className="text-xs font-bold text-slate-400">Files</span>
            </div>
            <span className="text-xs text-amber-600 font-extrabold mt-1 block">
              {assignedLeads.length} Distributed Leads →
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* --- TAB: HOME / OVERVIEW --- */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Quick Lead Import Hero Banner */}
          <div className="bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/5 border-2 border-[#00C9A7]/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A88B] animate-ping" />
                <h3 className="font-display font-black text-lg text-[#0A2540]">Excel Lead Import & Batch Allocation</h3>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                Upload B2B sales databases (.xlsx / .csv). Our smart system parses column headers, maps telephone numbers, validates records, and allocates quotas directly to SDR telecallers in real-time.
              </p>
            </div>

            <button
              onClick={() => setIsExcelUploadModalOpen(true)}
              className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs px-6 py-3 rounded-2xl shadow-md shadow-[#00C9A7]/25 flex-shrink-0 active:scale-95 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Launch Lead Uploader</span>
            </button>
          </div>

          {/* 2-Column Section: Lead Batches Table + Teams Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Lead Batches Table */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-black text-base text-[#0A2540]">Recent Lead Allocations</h3>
                  <p className="text-xs text-slate-400">Imported files and assigned telecaller quotas</p>
                </div>
                <button 
                  onClick={() => setTab('leads')}
                  className="text-xs font-bold text-[#00A88B] hover:underline"
                >
                  View All Batches →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Batch File</th>
                      <th className="pb-3">Uploaded</th>
                      <th className="pb-3">Assigned Representative</th>
                      <th className="pb-3">Total Leads</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leadBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-[#0A2540]">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>{batch.fileName}</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-500 font-mono text-[11px]">{batch.uploadedAt}</td>
                        <td className="py-3 font-semibold text-slate-700">{batch.assignedToEmployeeName}</td>
                        <td className="py-3 font-mono font-black text-[#00A88B]">{batch.totalLeads} Leads</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-extrabold">
                            ALLOCATED
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 1 Col: Sales Squads Overview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-display font-black text-sm text-[#0A2540]">Sales Squads</h4>
                <span className="text-[10px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2 py-0.5 rounded-full">
                  {teamGroups.length} Squads
                </span>
              </div>

              <div className="space-y-3">
                {teamGroups.map((grp) => (
                  <div key={grp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-xs text-[#0A2540]">{grp.name}</h5>
                        <span className="text-[11px] text-slate-500 block">{grp.description}</span>
                      </div>
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: grp.color }} />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-600 font-medium pt-1 border-t border-slate-200/60">
                      <span>Leader: <strong>{grp.leaderName}</strong></span>
                      <span className="font-mono font-bold text-[#00A88B]">₹{(grp.achieved / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- TAB: USERS --- */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-xl text-[#0A2540]">System User Accounts</h3>
                <p className="text-xs text-slate-500">Master view of all telecallers, team leaders, HR, and admins</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#00C9A7] text-[#0A2540] font-black text-xs px-4 py-2 rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Onboard User
                </button>
              </div>
            </div>

            {/* Widescreen Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Account</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Squad / Team</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Attendance</th>
                    <th className="pb-3">Check-in Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamMembers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-xs">
                            {u.avatar || u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#0A2540] block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.empCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">{u.role}</td>
                      <td className="py-3.5 font-semibold text-slate-600">{u.group}</td>
                      <td className="py-3.5 font-mono text-slate-600">{u.phone}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          u.attendanceStatus === 'PRESENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          u.attendanceStatus === 'LATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {u.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">{u.checkInMethod || 'Face ID Biometric'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* --- TAB: LEADS / ALLOCATION --- */}
      {activeTab === 'leads' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-xl text-[#0A2540]">Lead Distribution Center</h3>
                <p className="text-xs text-slate-500">Track all allocated client leads across sales telecallers</p>
              </div>
              <button
                onClick={() => setIsExcelUploadModalOpen(true)}
                className="flex items-center gap-2 bg-[#00C9A7] text-[#0A2540] font-black text-xs px-5 py-2.5 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" /> Import New File
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Lead Contact</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Assigned Telecaller</th>
                    <th className="pb-3">Batch Reference</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Deal Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div>
                          <span className="font-bold text-[#0A2540] block">{lead.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{lead.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">{lead.company}</td>
                      <td className="py-3.5 font-semibold text-[#00A88B]">{lead.assignedToEmployeeName}</td>
                      <td className="py-3.5 font-mono text-slate-500 text-[11px]">{lead.batchId}</td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          lead.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                          lead.status === 'INTERESTED' ? 'bg-teal-100 text-teal-800' :
                          lead.status === 'CALLBACK' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono font-bold text-[#0A2540]">
                        {lead.dealValue ? `₹${lead.dealValue.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: REPORTS / AUDIT --- */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-xl text-[#0A2540]">Master System Audit & Compliance</h3>
                <p className="text-xs text-slate-500">Full logs of employee check-ins, dials, payments, and system operations</p>
              </div>
              <button
                onClick={exportGlobalAuditCSV}
                className="flex items-center gap-2 bg-[#00C9A7] text-[#0A2540] font-black text-xs px-5 py-2.5 rounded-xl shadow-xs"
              >
                <Download className="w-4 h-4" /> Export Complete Audit (CSV)
              </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> SQLite Local Database: Connected & Synchronized
              </div>
              <p className="text-xs text-slate-500">
                19 tables initialized under WAL mode (`tradenexus.sqlite`). Automated real-time persistence active across all client mutations, employee logs, and financial records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: SECURITY / ROLES --- */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-display font-black text-xl text-[#0A2540]">Role Permissions & Access Matrix</h3>
              <p className="text-xs text-slate-500">System authorization boundaries across all 4 Trade Nexus portals</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Telecaller / SDR', desc: 'Calling CRM, lead calls, attendance, personal payslips, quick dialer', color: 'emerald' },
                { title: 'Team Leader', desc: 'Team roster, daily dials, sales leaderboard, leave approvals, standup scheduling', color: 'teal' },
                { title: 'HR Portal', desc: 'Employee master, onboarding checklist, candidate hiring, bulk payroll, clearances', color: 'indigo' },
                { title: 'Master Admin', desc: 'Global control, excel lead import, user allocation, master audit, security matrix', color: 'amber' },
              ].map((role) => (
                <div key={role.title} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-xs font-black text-[#0A2540] block">{role.title}</span>
                  <p className="text-xs text-slate-500 leading-relaxed">{role.desc}</p>
                  <span className="text-[10px] font-extrabold text-[#00A88B] bg-[#E6FAF6] px-2 py-0.5 rounded-full inline-block mt-2">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ExcelLeadUploadModal />

      <AddEmployeeModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

    </div>
  );
};
