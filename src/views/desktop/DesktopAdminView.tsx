import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useScreenData } from '../../hooks/useScreenData';
import {
  Users,
  UserCheck,
  Layers,
  Download,
  Plus,
  FileSpreadsheet,
  Search,
  TrendingUp,
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  CalendarCheck,
  Wallet,
  MapPin,
  Crosshair,
  Save,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Filter,
  Video,
} from 'lucide-react';
import { OfficeSettings, TeamMember, UserRole } from '../../types';
import { api } from '../../services/api';
import { ExcelLeadUploadModal } from '../../components/modals/ExcelLeadUploadModal';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';
import { EmployeeRecordModal, PORTAL_LABEL } from '../../components/modals/EmployeeRecordModal';
import { CreateTeamModal } from '../../components/modals/CreateTeamModal';
import { ManageTeamMembersModal } from '../../components/modals/ManageTeamMembersModal';
import { TeamGroup } from '../../types';
import { Employee360ProfileView } from '../Employee360ProfileView';

interface DesktopAdminViewProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const downloadCsv = (filename: string, header: string, rows: string[]) => {
  const csv = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const DesktopAdminView: React.FC<DesktopAdminViewProps> = ({
  currentTab = 'home',
  onTabChange,
}) => {
  const {
    teamMembers,
    teamGroups,
    leadBatches,
    assignedLeads,
    clients,
    paymentVerifications,
    attendanceLogs,
    leaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
    setIsExcelUploadModalOpen,
    assignTeamLeaderToGroup,
    verifyPayment,
    reassignLeadsBetween,
    teamMeetings,
    joinMeeting,
    triggerToast,
  } = useApp();

  useScreenData('adminDashboard');

  const [internalTab, setInternalTab] = useState<string>(currentTab);
  const activeTab = onTabChange ? currentTab : internalTab;
  const setTab = onTabChange || setInternalTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TELECALLER' | 'LEADER'>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [openEmployee, setOpenEmployee] = useState<TeamMember | null>(null);

  // Where the office is — the reference point every check-in is measured against
  const [office, setOffice] = useState<OfficeSettings | null>(null);
  const [officeDraft, setOfficeDraft] = useState<Partial<OfficeSettings>>({});
  const [locating, setLocating] = useState(false);
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState('');
  const [moveCount, setMoveCount] = useState('');
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [managingSquad, setManagingSquad] = useState<TeamGroup | null>(null);

  // Attendance Report date picker & filter state
  const [attendanceDate, setAttendanceDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PROBLEMS'>('ALL');

  // Approvals subtab & rejection prompt
  const [approvalTab, setApprovalTab] = useState<'PAYMENTS' | 'LEAVES'>('PAYMENTS');
  const [rejectionTarget, setRejectionTarget] = useState<{
    id: string;
    type: 'PAYMENT' | 'LEAVE';
    name: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    api.getOffice().then(setOffice).catch(() => setOffice(null));
  }, []);

  const officeField = <K extends keyof OfficeSettings>(k: K) =>
    (officeDraft[k] !== undefined ? officeDraft[k] : office?.[k]) as OfficeSettings[K];

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      triggerToast('This device cannot report a location.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOfficeDraft((d) => ({
          ...d,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        triggerToast('\u2713 Location read. Press Save to use it as the office.');
      },
      () => {
        setLocating(false);
        triggerToast('\u2717 Could not read your location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveOffice = async () => {
    try {
      const saved = await api.updateOffice({ ...office, ...officeDraft } as Partial<OfficeSettings>);
      setOffice(saved);
      setOfficeDraft({});
      triggerToast('\u2713 Office location saved');
    } catch {
      triggerToast('\u2717 Could not save the office location');
    }
  };

  // ---- Real figures, all derived from what is actually in the database ----
  const headcount = teamMembers.length;
  const presentToday = teamMembers.filter((m) => m.attendanceStatus === 'PRESENT').length;
  const callsToday = teamMembers.reduce((sum, m) => sum + (m.dialsToday || 0), 0);
  const salesAchieved = teamMembers.reduce((sum, m) => sum + (m.salesAchieved || 0), 0);
  const salesTarget = teamMembers.reduce((sum, m) => sum + (m.salesTarget || 0), 0);
  const salesPercent = Math.round((salesAchieved / Math.max(1, salesTarget)) * 100);

  const pendingPayments = paymentVerifications.filter((p) => p.status === 'PENDING_HR_AUDIT');
  const leadsDueToday = clients.filter((c) => c.status === 'Due Today');

  // Things that need a decision from the Admin today
  const awayWithoutLeave = teamMembers.filter((m) => m.attendanceStatus === 'ABSENT');
  const idleToday = teamMembers.filter(
    (m) => m.attendanceStatus === 'PRESENT' && (m.dialsToday || 0) === 0
  );

  const filteredPeople = teamMembers.filter((m) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.empCode.toLowerCase().includes(q) ||
      (m.role ?? '').toLowerCase().includes(q) ||
      (m.group ?? '').toLowerCase().includes(q);

    const isLeader = (m.role ?? '').toLowerCase().includes('leader');
    const matchesRole =
      roleFilter === 'ALL' || (roleFilter === 'LEADER' ? isLeader : !isLeader);

    return matchesSearch && matchesRole;
  });

  const leadsPerEmployee = teamMembers.map((m) => {
    const mine = assignedLeads.filter(
      (l) =>
        l.assignedToEmployeeId === m.id ||
        (l.assignedToEmployeeName &&
          l.assignedToEmployeeName.toLowerCase() === m.name.toLowerCase())
    );
    return {
      member: m,
      total: mine.length,
      called: mine.filter((l) => (l.callCount || 0) > 0).length,
      interested: mine.filter((l) => l.status === 'INTERESTED').length,
      converted: mine.filter((l) => l.status === 'CONVERTED').length,
    };
  });

  // ---------------------------------------------------------------- shells

  const Card: React.FC<{ label: string; value: string; sub?: string; tone?: 'plain' | 'good' | 'warn' }> = ({
    label,
    value,
    sub,
    tone = 'plain',
  }) => (
    <div className="nexus-card p-5 bg-white border border-slate-200 shadow-sm">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
        {label}
      </span>
      <span
        className={`font-mono-nums font-black text-2xl block ${
          tone === 'good' ? 'text-emerald-600' : tone === 'warn' ? 'text-amber-600' : 'text-[#0A2540]'
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-slate-500 font-semibold mt-0.5 block">{sub}</span>}
    </div>
  );

  const PageHead: React.FC<{ title: string; blurb: string; children?: React.ReactNode }> = ({
    title,
    blurb,
    children,
  }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{blurb}</p>
      </div>
      {children && <div className="flex items-center gap-3 flex-shrink-0">{children}</div>}
    </div>
  );

  const Empty: React.FC<{ text: string }> = ({ text }) => (
    <div className="p-8 text-center text-xs text-slate-400 font-semibold">{text}</div>
  );

  // ---------------------------------------------------------------- screens

  const renderOverview = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHead title="Overview" blurb="Where the company stands today, and what is waiting for you." />

      {/* 🔴 Live Team Meeting Banner for Admin */}
      {(() => {
        const liveMeeting = teamMeetings.find(m => m.status === 'LIVE');
        if (!liveMeeting) return null;
        return (
          <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-500 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3.5">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600"></span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    🔴 Live Team Meeting in Progress
                  </span>
                  <span className="text-xs font-mono text-emerald-800 font-bold">Conducted by Team Leader</span>
                </div>
                <h4 className="font-display font-black text-base text-[#0A2540] mt-0.5">
                  {liveMeeting.title}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {liveMeeting.invitedMemberName ? `Participants: ${liveMeeting.invitedMemberName}` : 'All team telecallers'} • Admin can join video session anytime
                </p>
              </div>
            </div>

            <button
              onClick={() => joinMeeting(liveMeeting)}
              className="px-5 py-2.5 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-black text-xs rounded-xl flex items-center gap-2 shadow-md shadow-[#00C9A7]/30 transition-all active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Join as Admin</span>
            </button>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card label="Employees" value={String(headcount)} sub="on the books" />
        <Card
          label="Present today"
          value={`${presentToday} of ${headcount}`}
          sub={`${Math.round((presentToday / Math.max(1, headcount)) * 100)}% checked in`}
          tone={presentToday === headcount ? 'good' : 'warn'}
        />
        <Card label="Calls made today" value={String(callsToday)} sub="across all telecallers" />
        <Card
          label="Sales this month"
          value={inr(salesAchieved)}
          sub={`${salesPercent}% of ${inr(salesTarget)} target`}
        />
        <Card
          label="Waiting for approval"
          value={String(pendingPayments.length)}
          sub="payments needing your sign-off"
          tone={pendingPayments.length ? 'warn' : 'good'}
        />
        <Card label="Leads due today" value={String(leadsDueToday.length)} sub="follow-ups scheduled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-display font-black text-base text-[#0A2540]">Needs your attention</h3>
          </div>

          {!pendingPayments.length && !awayWithoutLeave.length && !idleToday.length ? (
            <Empty text="Nothing outstanding. Everyone is checked in and no approvals are pending." />
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPayments.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTab('approvals')}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-[#0A2540] block">
                      {inr(p.dealAmount)} from {p.companyName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Closed by {p.telecallerName} · awaiting your approval
                    </span>
                  </div>
                  <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                </button>
              ))}

              {awayWithoutLeave.map((m) => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0A2540] block">{m.name} is absent</span>
                    <span className="text-[11px] text-slate-500">No approved leave on record</span>
                  </div>
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                </div>
              ))}

              {idleToday.map((m) => (
                <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0A2540] block">{m.name} has made no calls</span>
                    <span className="text-[11px] text-slate-500">Checked in at {m.checkInTime || '—'}</span>
                  </div>
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00A88B]" />
            <h3 className="font-display font-black text-base text-[#0A2540]">Today's activity</h3>
          </div>

          {!teamMembers.length ? (
            <Empty text="No employees yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {[...teamMembers]
                .sort((a, b) => (b.dialsToday || 0) - (a.dialsToday || 0))
                .slice(0, 6)
                .map((m) => (
                  <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block truncate">{m.name}</span>
                      <span className="text-[11px] text-slate-500">{m.group}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono-nums font-black text-sm text-[#0A2540] block">
                        {m.dialsToday || 0} calls
                      </span>
                      <span className="text-[11px] text-slate-500">{inr(m.salesAchieved || 0)}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPeople = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHead title="People" blurb="Everyone who works here, and the teams they belong to.">
        <button
          onClick={() =>
            downloadCsv(
              'Employees',
              'Name,Code,Role,Team,Status,Check-in,Calls today,Sales',
              teamMembers.map(
                (e) =>
                  `"${e.name}","${e.empCode}","${e.role}","${e.group}","${e.attendanceStatus}","${e.checkInTime || ''}",${e.dialsToday},${e.salesAchieved}`
              )
            )
          }
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Download to Excel</span>
        </button>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Employee</span>
        </button>
      </PageHead>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2 flex-1 min-w-[16rem]">
          <Search className="w-4 h-4 text-slate-400 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code, role or team"
            className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-medium"
          />
        </div>
        {(['ALL', 'TELECALLER', 'LEADER'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setRoleFilter(f)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              roleFilter === f
                ? 'bg-[#0A2540] text-white border-[#0A2540]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'Everyone' : f === 'TELECALLER' ? 'Telecallers' : 'Team Leaders'}
          </button>
        ))}
      </div>

      <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[46rem]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50/70">
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Code</th>
                <th className="py-3 px-5">Job title</th>
                <th className="py-3 px-5">Portal</th>
                <th className="py-3 px-5">Team</th>
                <th className="py-3 px-5">Calls today</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPeople.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setOpenEmployee(m)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-[10px] flex-shrink-0">
                        {m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-[#0A2540]">{m.name}</span>
                      {m.active === 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                          Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">{m.empCode}</td>
                  <td className="py-3.5 px-5 text-slate-600">{m.role}</td>
                  <td className="py-3.5 px-5">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {PORTAL_LABEL[(m.portal as UserRole) ?? 'telecaller']}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">{m.group}</td>
                  <td className="py-3.5 px-5 font-mono-nums font-bold text-[#0A2540]">{m.dialsToday || 0}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        m.attendanceStatus === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.attendanceStatus === 'LATE'
                          ? 'bg-amber-50 text-amber-700'
                          : m.attendanceStatus === 'ON_LEAVE'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {m.attendanceStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredPeople.length && (
          <Empty text={teamMembers.length ? 'Nobody matches that search.' : 'No employees yet. Use Add Employee to begin.'} />
        )}
      </div>

      {/* Teams live inside People, not as their own tab */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="font-display font-black text-base text-[#0A2540]">Teams</h3>
          </div>
          <button
            onClick={() => setIsCreateTeamOpen(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#00C9A7] text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create team</span>
          </button>
        </div>

        {!teamGroups.length ? (
          <div className="nexus-card bg-white border border-slate-200 shadow-sm">
            <Empty text="No teams yet." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {teamGroups.map((g) => {
              const members = teamMembers.filter((m) => m.group === g.name);
              return (
                <div key={g.id} className="nexus-card p-5 bg-white border border-slate-200 shadow-sm space-y-3">
                  <div>
                    <h4 className="font-display font-black text-sm text-[#0A2540]">{g.name}</h4>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Led by {g.leaderName || '—'} · {members.length} member{members.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-bold">Monthly target</span>
                    <span className="font-mono-nums font-black text-[#0A2540]">{inr(g.monthlyTarget)}</span>
                  </div>

                  <select
                    value={g.leaderName || ''}
                    onChange={(e) => assignTeamLeaderToGroup(g.id, e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                  >
                    <option value="">— Assign a Team Leader —</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} — {m.role}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setManagingSquad(g)}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-xl transition-all border border-slate-200 hover:border-slate-300"
                  >
                    <Users className="w-3.5 h-3.5 text-[#00A88B]" />
                    <span>{members.length === 0 ? '+ Add Members' : `Manage Squad (${members.length})`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderAttendance = () => {
    // Record lookup based on selected date
    const recordFor = (employeeId: string) =>
      attendanceLogs.find((a) => a.employeeId === employeeId && a.date === attendanceDate);

    const isProblem = (m: TeamMember, rec?: ReturnType<typeof recordFor>) => {
      if (m.attendanceStatus === 'ABSENT' || m.attendanceStatus === 'LATE') return true;
      if (rec && rec.locationStatus === 'AWAY') return true;
      return false;
    };

    const locationCell = (rec: ReturnType<typeof recordFor>) => {
      if (!rec) return <span className="text-slate-400">—</span>;
      if (rec.locationStatus === 'AT_OFFICE')
        return <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">At office</span>;
      if (rec.locationStatus === 'AWAY')
        return (
          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-700">
            {rec.checkInDistanceM != null ? `${(rec.checkInDistanceM / 1000).toFixed(1)} km away` : 'Away'}
          </span>
        );
      if (rec.locationStatus === 'OFFICE_NOT_SET')
        return <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500">Office not set</span>;
      return <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500">Not shared</span>;
    };

    const selectedDateFormatted = new Date(attendanceDate + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const late = teamMembers.filter((m) => m.attendanceStatus === 'LATE').length;
    const onLeave = teamMembers.filter((m) => m.attendanceStatus === 'ON_LEAVE').length;
    const absent = teamMembers.filter((m) => m.attendanceStatus === 'ABSENT').length;
    const problemsCount = teamMembers.filter((m) => isProblem(m, recordFor(m.id))).length;

    const displayedMembers = attendanceFilter === 'PROBLEMS'
      ? teamMembers.filter((m) => isProblem(m, recordFor(m.id)))
      : teamMembers;

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHead title="Attendance Report" blurb={selectedDateFormatted}>
          <button
            onClick={() =>
              downloadCsv(
                `Attendance_${attendanceDate}`,
                'Name,Team,Status,Check-in,Method,Location',
                teamMembers.map(
                  (m) =>
                    `"${m.name}","${m.group}","${m.attendanceStatus}","${m.checkInTime || ''}","${m.checkInMethod || ''}","${recordFor(m.id)?.locationStatus || ''}"`
                )
              )
            }
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download to Excel</span>
          </button>
        </PageHead>

        {/* Date Navigation & Problem Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const d = new Date(attendanceDate + 'T00:00:00');
                d.setDate(d.getDate() - 1);
                setAttendanceDate(d.toISOString().split('T')[0]);
              }}
              title="Previous Day"
              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
            />

            <button
              onClick={() => {
                const d = new Date(attendanceDate + 'T00:00:00');
                d.setDate(d.getDate() + 1);
                setAttendanceDate(d.toISOString().split('T')[0]);
              }}
              title="Next Day"
              className="w-8 h-8 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAttendanceDate(new Date().toISOString().split('T')[0])}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttendanceFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                attendanceFilter === 'ALL'
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Employees ({teamMembers.length})
            </button>
            <button
              onClick={() => setAttendanceFilter('PROBLEMS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                attendanceFilter === 'PROBLEMS'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Flagged Problems ({problemsCount})</span>
            </button>
          </div>
        </div>

        {/* Office location — the reference point every check-in is measured against */}
        <div className="nexus-card bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#00A88B]" />
            <h3 className="font-display font-black text-base text-[#0A2540]">Office location</h3>
            {office?.latitude == null && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                Not set yet
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            Check-ins are compared against this point. Anyone within the distance below counts as
            at the office. The most accurate way to set it is to stand at the office and press
            Use my current location.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Office name
              </label>
              <input
                type="text"
                value={String(officeField('label') ?? '')}
                onChange={(e) => setOfficeDraft((d) => ({ ...d, label: e.target.value }))}
                placeholder="e.g. Meerpet TRR College, Hyderabad"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={String(officeField('latitude') ?? '')}
                onChange={(e) => setOfficeDraft((d) => ({ ...d, latitude: Number(e.target.value) }))}
                placeholder="17.3140"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                value={String(officeField('longitude') ?? '')}
                onChange={(e) => setOfficeDraft((d) => ({ ...d, longitude: Number(e.target.value) }))}
                placeholder="78.5290"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Counts as at office within
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={String(officeField('radiusMeters') ?? 200)}
                  onChange={(e) => setOfficeDraft((d) => ({ ...d, radiusMeters: Number(e.target.value) }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                />
                <span className="text-xs font-bold text-slate-500">metres</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              <Crosshair className="w-4 h-4" />
              <span>{locating ? 'Reading location…' : 'Use my current location'}</span>
            </button>

            <button
              onClick={saveOffice}
              disabled={!Object.keys(officeDraft).length}
              className="flex items-center gap-1.5 bg-[#00C9A7] hover:bg-[#00B4D8] disabled:bg-slate-200 disabled:text-slate-400 text-[#0A2540] font-black text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>

            {office?.latitude != null && !Object.keys(officeDraft).length && (
              <span className="text-[11px] text-slate-500 font-semibold">
                Currently {office.label} · within {office.radiusMeters}m
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="Present" value={String(presentToday)} tone="good" />
          <Card label="Late" value={String(late)} tone={late ? 'warn' : 'plain'} />
          <Card label="On leave" value={String(onLeave)} />
          <Card label="Absent" value={String(absent)} tone={absent ? 'warn' : 'plain'} />
        </div>

        <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[42rem]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50/70">
                  <th className="py-3 px-5">Photo</th>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Team</th>
                  <th className="py-3 px-5">Check-in</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Check-out</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedMembers.map((m) => {
                  const rec = recordFor(m.id);
                  return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-5">
                      {rec?.checkInPhoto ? (
                        <img
                          src={rec.checkInPhoto}
                          alt={`${m.name} at check-in`}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                          No Pic
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#0A2540]">{m.name}</td>
                    <td className="py-3.5 px-5 text-slate-600">{m.group}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-700">{rec?.checkIn || m.checkInTime || '—'}</td>
                    <td className="py-3.5 px-5">{locationCell(rec)}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-700">{rec?.checkOut || '—'}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          m.attendanceStatus === 'PRESENT'
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.attendanceStatus === 'LATE'
                            ? 'bg-amber-50 text-amber-700'
                            : m.attendanceStatus === 'ON_LEAVE'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.attendanceStatus.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!displayedMembers.length && (
            <Empty text={attendanceFilter === 'PROBLEMS' ? 'No flagged attendance problems on this day!' : 'No employees yet.'} />
          )}
        </div>

        <p className="text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
          <strong className="text-slate-700">Admin only:</strong> the photo and location columns are
          sent to nobody else. HR and Team Leaders see this same register without them.
        </p>
      </div>
    );
  };

  const renderLeads = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHead title="Lead Allocation" blurb="Give lists of prospects to the telecallers who will call them.">
        <button
          onClick={() => setIsExcelUploadModalOpen(true)}
          className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00B4D8] text-[#0A2540] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#00C9A7]/20 transition-all active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4 stroke-[2.5]" />
          <span>Upload Leads</span>
        </button>
      </PageHead>

      <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#00A88B]" />
          <h3 className="font-display font-black text-base text-[#0A2540]">Who is holding what</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[40rem]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold text-[10px] bg-slate-50/70">
                <th className="py-3 px-5">Telecaller</th>
                <th className="py-3 px-5">Leads held</th>
                <th className="py-3 px-5">Called</th>
                <th className="py-3 px-5">Interested</th>
                <th className="py-3 px-5">Converted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leadsPerEmployee.map(({ member, total, called, interested, converted }) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-[#0A2540]">{member.name}</td>
                  <td className="py-3.5 px-5 font-mono-nums font-bold">{total}</td>
                  <td className="py-3.5 px-5 font-mono-nums text-slate-600">{called}</td>
                  <td className="py-3.5 px-5 font-mono-nums text-amber-700">{interested}</td>
                  <td className="py-3.5 px-5 font-mono-nums text-emerald-700">{converted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!teamMembers.length && <Empty text="No employees yet." />}
      </div>

      <div className="nexus-card bg-white border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-display font-black text-base text-[#0A2540]">Move leads</h3>
        <p className="text-[11px] text-slate-500">
          Hand a telecaller's whole list to someone else — when they leave, go on holiday, or the
          workload needs balancing.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[12rem]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From</label>
            <select
              value={moveFrom}
              onChange={(e) => setMoveFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
            >
              <option value="">— Choose telecaller —</option>
              {leadsPerEmployee
                .filter((r) => r.total > 0)
                .map((r) => (
                  <option key={r.member.id} value={r.member.id}>
                    {r.member.name} ({r.total} leads)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1 min-w-[12rem]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
            <select
              value={moveTo}
              onChange={(e) => setMoveTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
            >
              <option value="">— Choose telecaller —</option>
              {teamMembers
                .filter((m) => m.id !== moveFrom && m.active !== 0)
                .map((m) => {
                  const heldCount = assignedLeads.filter(
                    (l) =>
                      l.assignedToEmployeeId === m.id ||
                      (l.assignedToEmployeeName &&
                        l.assignedToEmployeeName.toLowerCase() === m.name.toLowerCase())
                  ).length;
                  return (
                    <option key={m.id} value={m.id}>
                      {m.name} ({heldCount} leads held)
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="w-24">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={moveCount}
              onChange={(e) => setMoveCount(e.target.value)}
              placeholder="All"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
            />
          </div>

          <button
            onClick={async () => {
              const limit = moveCount.trim() ? Math.max(1, Number(moveCount)) : undefined;
              await reassignLeadsBetween(moveFrom, moveTo, limit);
              setMoveFrom('');
              setMoveTo('');
              setMoveCount('');
            }}
            disabled={!moveFrom || !moveTo}
            className="bg-[#0A2540] hover:bg-[#0F3258] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Move leads
          </button>
        </div>
      </div>

      <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-slate-500" />
          <h3 className="font-display font-black text-base text-[#0A2540]">Recent uploads</h3>
        </div>
        {!leadBatches.length ? (
          <Empty text="No lead files uploaded yet." />
        ) : (
          <div className="divide-y divide-slate-100">
            {leadBatches.map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[#0A2540] block truncate">{b.fileName}</span>
                  <span className="text-[11px] text-slate-500">
                    {b.totalLeads} leads → {b.assignedToEmployeeName}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">{b.uploadedAt}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
        <strong className="text-slate-700">File format:</strong> save your sheet as CSV from Excel
        (File → Save As → CSV). Columns in order: name, phone, company, city, email.
      </p>
    </div>
  );

  const renderApprovals = () => {
    const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING');
    const totalPending = pendingPayments.length + pendingLeaves.length;

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHead
          title="Approvals"
          blurb={`${totalPending} item${totalPending === 1 ? '' : 's'} waiting for your sign-off.`}
        />

        {/* Sub-tabs: Payments vs Leaves */}
        <div className="flex gap-2">
          <button
            onClick={() => setApprovalTab('PAYMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              approvalTab === 'PAYMENTS'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Payments ({pendingPayments.length})
          </button>
          <button
            onClick={() => setApprovalTab('LEAVES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              approvalTab === 'LEAVES'
                ? 'bg-[#0A2540] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Leave Escalations ({pendingLeaves.length})
          </button>
        </div>

        {approvalTab === 'PAYMENTS' && (
          <>
            {!pendingPayments.length ? (
              <div className="nexus-card bg-white border border-slate-200 shadow-sm">
                <Empty text="Nothing waiting. Every payment has been dealt with." />
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((p) => (
                  <div key={p.id} className="nexus-card p-5 bg-white border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-mono-nums font-black text-xl text-[#0A2540] block">
                          {inr(p.dealAmount)}
                        </span>
                        <span className="text-sm font-bold text-slate-700 block">{p.companyName}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Closed by {p.telecallerName} · {p.paymentMode} · {p.timestamp}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block">UTR {p.utrNumber}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => verifyPayment(p.id, 'VERIFIED')}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            setRejectionTarget({
                              id: p.id,
                              type: 'PAYMENT',
                              name: `${inr(p.dealAmount)} from ${p.companyName}`,
                            })
                          }
                          className="flex items-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {approvalTab === 'LEAVES' && (
          <>
            {!pendingLeaves.length ? (
              <div className="nexus-card bg-white border border-slate-200 shadow-sm">
                <Empty text="No leave escalations waiting. All team requests are cleared." />
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map((l) => (
                  <div key={l.id} className="nexus-card p-5 bg-white border border-slate-200 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0A2540]">{l.employeeName}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
                            {l.leaveType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600 block">
                          <strong>{l.totalDays} day{l.totalDays === 1 ? '' : 's'}</strong> ({l.fromDate} → {l.toDate})
                        </span>
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{l.reason}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            approveLeaveRequest(l.id);
                            triggerToast(`✓ Approved leave for ${l.employeeName}`);
                          }}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            setRejectionTarget({
                              id: l.id,
                              type: 'LEAVE',
                              name: `Leave for ${l.employeeName} (${l.totalDays} days)`,
                            })
                          }
                          className="flex items-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="nexus-card bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h3 className="font-display font-black text-base text-[#0A2540]">Already decided</h3>
          </div>
          {paymentVerifications.filter((p) => p.status !== 'PENDING_HR_AUDIT').length === 0 &&
          leaveRequests.filter((l) => l.status !== 'PENDING').length === 0 ? (
            <Empty text="No decisions recorded yet." />
          ) : (
            <div className="divide-y divide-slate-100">
              {paymentVerifications
                .filter((p) => p.status !== 'PENDING_HR_AUDIT')
                .map((p) => (
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block truncate">
                        {inr(p.dealAmount)} · {p.companyName}
                      </span>
                      <span className="text-[11px] text-slate-500">Closed by {p.telecallerName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                        p.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              {leaveRequests
                .filter((l) => l.status !== 'PENDING')
                .map((l) => (
                  <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block truncate">
                        Leave: {l.employeeName} ({l.leaveType})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {l.fromDate} → {l.toDate} · {l.totalDays} day{l.totalDays === 1 ? '' : 's'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                        l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const reports = [
      {
        label: 'Employees',
        blurb: 'Everyone, with role, team and today’s figures.',
        icon: Users,
        run: () =>
          downloadCsv(
            'Employees',
            'Name,Code,Role,Team,Status,Check-in,Calls today,Sales,Target',
            teamMembers.map(
              (e) =>
                `"${e.name}","${e.empCode}","${e.role}","${e.group}","${e.attendanceStatus}","${e.checkInTime || ''}",${e.dialsToday},${e.salesAchieved},${e.salesTarget}`
            )
          ),
      },
      {
        label: 'Attendance',
        blurb: 'Who was in today, when and how they checked in.',
        icon: CalendarCheck,
        run: () =>
          downloadCsv(
            'Attendance',
            'Name,Team,Status,Check-in,Method',
            teamMembers.map(
              (m) =>
                `"${m.name}","${m.group}","${m.attendanceStatus}","${m.checkInTime || ''}","${m.checkInMethod || ''}"`
            )
          ),
      },
      {
        label: 'Calls & conversion',
        blurb: 'Dials, connections and interest per telecaller.',
        icon: PhoneCall,
        run: () =>
          downloadCsv(
            'Calls',
            'Name,Team,Dials,Connected,Interested,Conversion %',
            teamMembers.map(
              (m) => `"${m.name}","${m.group}",${m.dialsToday},${m.connected},${m.interested},${m.conversionRate}`
            )
          ),
      },
      {
        label: 'Sales & targets',
        blurb: 'Achieved against target, per person.',
        icon: TrendingUp,
        run: () =>
          downloadCsv(
            'Sales',
            'Name,Team,Achieved,Target,Percent',
            teamMembers.map(
              (m) =>
                `"${m.name}","${m.group}",${m.salesAchieved},${m.salesTarget},${Math.round(
                  (m.salesAchieved / Math.max(1, m.salesTarget)) * 100
                )}`
            )
          ),
      },
      {
        label: 'Payments',
        blurb: 'Every payment and where it stands.',
        icon: Wallet,
        run: () =>
          downloadCsv(
            'Payments',
            'Company,Lead,Telecaller,Amount,Mode,UTR,Status',
            paymentVerifications.map(
              (p) =>
                `"${p.companyName}","${p.leadName}","${p.telecallerName}",${p.dealAmount},"${p.paymentMode}","${p.utrNumber}","${p.status}"`
            )
          ),
      },
      {
        label: 'Lead allocation',
        blurb: 'Which telecaller holds which leads.',
        icon: FileSpreadsheet,
        run: () =>
          downloadCsv(
            'Lead_Allocation',
            'Lead,Company,Phone,Assigned to,Status,Calls made',
            assignedLeads.map(
              (l) =>
                `"${l.name}","${l.company}","${l.phone}","${l.assignedToEmployeeName}","${l.status}",${l.callCount}`
            )
          ),
      },
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHead
          title="Reports"
          blurb="Download your figures as a file that opens in Excel or Google Sheets."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.label}
                onClick={() => {
                  r.run();
                  triggerToast(`✓ ${r.label} downloaded`);
                }}
                className="nexus-card p-5 bg-white border border-slate-200 shadow-sm text-left hover:border-[#00C9A7] transition-all active:scale-[.99] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6FAF6] text-[#00A88B] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <Download className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-[#0A2540]">{r.label}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{r.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------- render

  if (openEmployee) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Employee360ProfileView
          member={openEmployee}
          onBack={() => setOpenEmployee(null)}
          viewerRole="admin"
        />
      </div>
    );
  }

  return (
    <>
      {activeTab === 'home' && renderOverview()}
      {activeTab === 'people' && renderPeople()}
      {activeTab === 'attendance' && renderAttendance()}
      {activeTab === 'leads' && renderLeads()}
      {activeTab === 'approvals' && renderApprovals()}
      {activeTab === 'reports' && renderReports()}

      <ExcelLeadUploadModal />
      <AddEmployeeModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />
      <EmployeeRecordModal employee={openEmployee} onClose={() => setOpenEmployee(null)} />
      <CreateTeamModal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
      <ManageTeamMembersModal
        team={managingSquad}
        isOpen={!!managingSquad}
        onClose={() => setManagingSquad(null)}
      />

      {/* Rejection Prompt Dialog */}
      {rejectionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-display font-black text-sm text-[#0A2540]">
                Reject {rejectionTarget.type === 'PAYMENT' ? 'Payment Sign-Off' : 'Leave Escalation'}
              </h4>
              <button
                onClick={() => setRejectionTarget(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-2 font-medium">
                Reason for rejecting <strong>{rejectionTarget.name}</strong>:
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR transaction details could not be verified against bank statement..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRejectionTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (rejectionTarget.type === 'PAYMENT') {
                    verifyPayment(rejectionTarget.id, 'REJECTED');
                    triggerToast(`✓ Payment rejected with audit note`);
                  } else {
                    rejectLeaveRequest(rejectionTarget.id, rejectionReason || 'Rejected by Admin');
                    triggerToast(`✓ Leave request rejected`);
                  }
                  setRejectionTarget(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs active:scale-95 transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
