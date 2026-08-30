import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  Layers, 
  Shield, 
  ChevronRight, 
  Home, 
  TrendingUp, 
  MoreHorizontal, 
  UserPlus, 
  Plus, 
  Download, 
  Settings, 
  Search, 
  Check, 
  Lock, 
  Key, 
  ShieldAlert,
  Building,
  UserCheck2,
  Sliders,
  Crown,
  FileSpreadsheet,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';
import { ExcelLeadUploadModal } from '../components/modals/ExcelLeadUploadModal';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';

export const AdminDashboardView: React.FC = () => {
  const { 
    teamMembers, 
    teamGroups, 
    leadBatches, 
    assignedLeads, 
    setIsExcelUploadModalOpen, 
    assignTeamLeaderToGroup, 
    triggerToast 
  } = useApp();

  const [activeAdminNav, setActiveAdminNav] = useState<'home' | 'users' | 'teams' | 'reports' | 'more'>('home');
  
  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAssignTlModalOpen, setIsAssignTlModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedGroupForTl, setSelectedGroupForTl] = useState(teamGroups[0]?.id || '');
  const [selectedLeaderName, setSelectedLeaderName] = useState(teamMembers[0]?.name || '');

  // Dynamic Stats from SQLite database
  const totalUsers = teamMembers.length;
  const activeUsers = teamMembers.filter(m => m.attendanceStatus === 'PRESENT').length;
  const totalTeams = teamGroups.length;
  const totalRoles = 4; // Telecaller, Team Leader, HR, Admin

  const exportGlobalAuditCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Role,Group,Status\n"
      + teamMembers.map(e => `"${e.name}","${e.role}","${e.group}","${e.attendanceStatus}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Global_Admin_Audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('✓ Exported Master Admin Audit Report (CSV)');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between max-w-lg mx-auto font-sans pb-28 selection:bg-amber-400/20">
      
      {/* Main Content Area */}
      <main className="flex-1 p-3.5 sm:p-4 space-y-4 pt-2">
        
        {/* --- TAB 1: HOME (Exact 1-to-1 Match with Reference Image) --- */}
        {activeAdminNav === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            {/* Greeting Header matching Mockup: Hello, Admin 👑 / Manager / Admin */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
                    Hello, Admin
                  </h2>
                  <span className="text-xl">👑</span>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Manager / Admin • <span className="text-[#00A88B] font-bold">Global Master Control</span>
                </p>
              </div>

              {/* Avatar Badge */}
              <div className="w-10 h-10 rounded-2xl bg-[#0A192F] text-amber-400 flex items-center justify-center font-black text-xs shadow-sm border border-amber-400/30">
                AD
              </div>
            </div>

            {/* System Overview Section (2x2 Grid with Chevron Indicators) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540]">
                  System Overview
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                
                {/* Card 1: Total Users */}
                <div 
                  onClick={() => setActiveAdminNav('users')}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00A88B] flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Total Users</span>
                      <strong className="font-display font-black text-xl text-[#0A2540] leading-none">
                        {totalUsers}
                      </strong>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Card 2: Active Users */}
                <div 
                  onClick={() => setActiveAdminNav('users')}
                  className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Active Users</span>
                      <strong className="font-display font-black text-xl text-emerald-600 leading-none">
                        {activeUsers}
                      </strong>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Card 3: Teams */}
                <div 
                  onClick={() => setActiveAdminNav('teams')}
                  className="bg-white border border-slate-200 hover:border-sky-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Teams</span>
                      <strong className="font-display font-black text-xl text-[#0A2540] leading-none">
                        {totalTeams}
                      </strong>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Card 4: Roles */}
                <div 
                  onClick={() => setIsRoleModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block">Roles</span>
                      <strong className="font-display font-black text-xl text-amber-600 leading-none">
                        {totalRoles}
                      </strong>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

              </div>
            </div>

            {/* User Management Section */}
            <div className="space-y-2">
              <h3 className="font-display font-bold text-sm text-[#0A2540]">
                User & Lead Management
              </h3>

              <div className="space-y-2.5">
                
                {/* Row 0: Excel Lead Import & Allocation (Client Priority) */}
                <div 
                  onClick={() => setIsExcelUploadModalOpen(true)}
                  className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/5 border-2 border-[#00C9A7]/60 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer active:scale-98 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00C9A7] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-xs text-[#0A2540]">Excel Lead Import & Allocation</h4>
                        <span className="text-[9px] bg-teal-600 text-white font-mono px-1.5 py-0.5 rounded-full uppercase font-bold">New</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium">Upload .xlsx/.csv & assign lead batches to telecallers</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#00A88B]" />
                </div>

                {/* Row 1: Manage Users / Onboard Employee */}
                <div 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E6FAF6] text-[#00A88B] flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#0A2540]">Onboard New Employee</h4>
                      <span className="text-[10px] text-slate-500">Create profile, set salary & generate Offer Letter</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Row 2: Assign Teams */}
                <div 
                  onClick={() => setActiveAdminNav('teams')}
                  className="bg-white border border-slate-200 hover:border-sky-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#0A2540]">Assign Teams</h4>
                      <span className="text-[10px] text-slate-500">Assign employees to squads & groups</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Row 3: Assign Team Leaders */}
                <div 
                  onClick={() => setIsAssignTlModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <UserCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#0A2540]">Assign Team Leaders</h4>
                      <span className="text-[10px] text-slate-500">Map team leaders to 10-member employee squads</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Row 4: Role Management */}
                <div 
                  onClick={() => setIsRoleModalOpen(true)}
                  className="bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-3.5 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-[#0A2540]">Role Management</h4>
                      <span className="text-[10px] text-slate-500">Manage roles &amp; permissions</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

              </div>
            </div>

            {/* Active Allocated Batches Overview */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-[#0A2540] flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  Allocated Lead Batches ({leadBatches.length})
                </h3>
                <button
                  onClick={() => setIsExcelUploadModalOpen(true)}
                  className="text-[11px] font-bold text-[#00A88B] hover:underline"
                >
                  + Upload Batch
                </button>
              </div>

              <div className="space-y-2">
                {leadBatches.slice(0, 4).map((batch) => {
                  const batchLeads = assignedLeads.filter(l => l.batchId === batch.id);
                  const connected = batchLeads.filter(l => l.status !== 'PENDING').length;
                  return (
                    <div key={batch.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <strong className="font-bold text-[#0A2540] block">{batch.fileName}</strong>
                        <p className="text-[11px] text-slate-500">
                          Assigned to: <span className="font-bold text-teal-700">{batch.assignedToEmployeeName}</span> • {batch.uploadedAt}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-lg block">
                          {batch.totalLeads} Leads
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {connected}/{batch.totalLeads} Called
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: USERS DIRECTORY --- */}
        {activeAdminNav === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540]">User Accounts ({totalUsers})</h2>
                <p className="text-xs text-slate-500">Global account status &amp; role hierarchy</p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="py-2 px-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            </div>

            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-bold text-[10px]">
                      {member.avatar}
                    </div>
                    <div>
                      <strong className="font-bold text-[#0A2540] block">{member.name}</strong>
                      <span className="text-[10px] text-slate-400">{member.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: TEAMS & SQUADS --- */}
        {activeAdminNav === 'teams' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">Squads &amp; Teams ({totalTeams})</h2>
              <p className="text-xs text-slate-500">Department hierarchy and quota allocations</p>
            </div>

            <div className="space-y-2.5">
              {teamGroups.map((grp) => (
                <div key={grp.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <strong className="font-display font-bold text-sm text-[#0A2540]">{grp.name}</strong>
                    <span className="text-[10px] font-bold text-[#00A88B] bg-[#E6FAF6] px-2 py-0.5 rounded">
                      Leader: {grp.leaderName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{grp.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">{grp.memberCount} Members</span>
                    <strong className="text-slate-800">Target: ₹{(grp.monthlyTarget / 1000).toFixed(0)}k</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: REPORTS --- */}
        {activeAdminNav === 'reports' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-[#0A2540]">System Audit Reports</h2>
                <p className="text-xs text-slate-500">Organization-wide compliance &amp; performance logs</p>
              </div>
              <button
                onClick={exportGlobalAuditCSV}
                className="py-2 px-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">Total System Logins</span>
                <span className="font-mono-nums font-black text-lg text-[#0A2540]">1,420 Sessions</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-500 block font-semibold">System Uptime</span>
                <span className="font-mono-nums font-black text-lg text-[#00A88B]">99.98%</span>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: MORE --- */}
        {activeAdminNav === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-lg text-[#0A2540]">Global System Settings</h2>
              <p className="text-xs text-slate-500">Security configurations &amp; master controls</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">Enforce Biometric Liveness Check</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">ENABLED</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-700">Auto-Generate Payslips on 1st of Month</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">ENABLED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">2-Factor Authentication for Admin</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">REQUIRED</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 5 Bottom Navigation Tabs */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 max-w-lg mx-auto px-2 py-1.5 flex justify-around items-center shadow-lg">
        {[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'teams', label: 'Teams', icon: Layers },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'more', label: 'More', icon: MoreHorizontal },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeAdminNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveAdminNav(item.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-[#00C9A7]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold text-[#00A88B]' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Add Employee Onboarding Modal */}
      <AddEmployeeModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

      {/* Excel Lead Upload & Allocation Modal */}
      <ExcelLeadUploadModal />

      {/* Role Management Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <h3 className="font-display font-black text-lg text-[#0A2540]">Role Permissions Matrix</h3>
            <div className="space-y-2 text-xs">
              {[
                { role: 'Level 1: Telecaller / SDR', perms: 'Calling CRM, Own Attendance, Payslips' },
                { role: 'Level 2: Team Leader', perms: 'Team Roster, Leave Approvals, Tasks, Standups' },
                { role: 'Level 3: HR Administrator', perms: 'Payroll Generator, ID Studio, Onboarding, Recruitment' },
                { role: 'Level 4: Super Admin', perms: 'Global Control, User Management, Master Audit' },
              ].map(r => (
                <div key={r.role} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block font-bold">{r.role}</strong>
                  <span className="text-[11px] text-slate-500">{r.perms}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="w-full py-3 rounded-xl bg-[#0A2540] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Interactive Assign Team Leader Modal */}
      {isAssignTlModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck2 className="w-4 h-4" />
              </div>
              <h3 className="font-display font-black text-lg text-[#0A2540]">Assign Team Leader</h3>
            </div>
            <p className="text-xs text-slate-500">Map an employee as Team Leader to oversee calling operations:</p>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Squad / Group</label>
                <select 
                  value={selectedGroupForTl} 
                  onChange={(e) => setSelectedGroupForTl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {teamGroups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} (Current TL: {grp.leaderName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Team Leader</label>
                <select 
                  value={selectedLeaderName}
                  onChange={(e) => setSelectedLeaderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} — {m.role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const targetGrp = teamGroups.find(g => g.id === selectedGroupForTl) || teamGroups[0];
                  if (targetGrp && selectedLeaderName) {
                    assignTeamLeaderToGroup(targetGrp.id, selectedLeaderName);
                  }
                  setIsAssignTlModalOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-[#00C9A7] text-[#0A2540] font-black text-xs shadow-md shadow-teal-500/20"
              >
                Confirm Assignment
              </button>
              <button
                onClick={() => setIsAssignTlModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

