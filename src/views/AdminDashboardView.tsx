import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useScreenData } from '../hooks/useScreenData';
import {
  Users,
  Layers,
  Home,
  Plus,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  CalendarCheck,
  AlertCircle,
  Wallet,
  Clock,
  MapPin,
  Crosshair,
  Save,
  ChevronRight,
  TrendingUp,
  UserCheck,
  PhoneCall,
  ArrowUpRight,
  FileText,
  Sparkles,
  UploadCloud,
  Shield,
  MoreHorizontal,
  ArrowLeft,
} from 'lucide-react';
import { ExcelLeadUploadModal } from '../components/modals/ExcelLeadUploadModal';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { EmployeeRecordModal, PORTAL_LABEL } from '../components/modals/EmployeeRecordModal';
import { CreateTeamModal } from '../components/modals/CreateTeamModal';
import { ManageTeamMembersModal } from '../components/modals/ManageTeamMembersModal';
import { OfficeSettings, TeamGroup, TeamMember, UserRole } from '../types';
import { api } from '../services/api';
import { Employee360ProfileView } from './Employee360ProfileView';
import { AdminCalendarConfig } from '../components/common/AdminCalendarConfig';

type AdminTab = 'home' | 'people' | 'attendance' | 'leads' | 'more' | 'approvals' | 'reports';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const formatInLakhs = (amount: number) => {
  if (!amount || amount === 0) return '₹0';
  if (amount >= 100000) {
    const inLakhs = (amount / 100000).toFixed(2).replace(/\.00$/, '');
    return `₹${inLakhs} L`;
  }
  return inr(amount);
};

const downloadCsv = (filename: string, header: string, rows: string[]) => {
  const csv = `data:text/csv;charset=utf-8,${header}\n${rows.join('\n')}`;
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csv));
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const AdminDashboardView: React.FC = () => {
  const {
    teamMembers,
    teamGroups,
    leadBatches,
    assignedLeads,
    clients,
    paymentVerifications,
    attendanceLogs,
    setIsExcelUploadModalOpen,
    assignTeamLeaderToGroup,
    verifyPayment,
    reassignLeadsBetween,
    triggerToast,
  } = useApp();

  useScreenData('adminDashboard');

  const [tab, setTab] = useState<AdminTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberFor360, setSelectedMemberFor360] = useState<TeamMember | null>(null);
  const [selectedAdminTeamGroup, setSelectedAdminTeamGroup] = useState<TeamGroup | null>(null);
  const [adminPeopleMode, setAdminPeopleMode] = useState<'TEAMS' | 'ALL'>('TEAMS');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'PRESENT' | 'LATE' | 'ON_LEAVE'>('ALL');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [openEmployee, setOpenEmployee] = useState<TeamMember | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [managingSquad, setManagingSquad] = useState<TeamGroup | null>(null);
  const [moveFrom, setMoveFrom] = useState('');
  const [moveTo, setMoveTo] = useState('');

  // Office location — same setting as the desktop panel
  const [office, setOffice] = useState<OfficeSettings | null>(null);
  const [officeDraft, setOfficeDraft] = useState<Partial<OfficeSettings>>({});
  const [locating, setLocating] = useState(false);
  const [showOfficeEditor, setShowOfficeEditor] = useState(false);

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
        triggerToast('\u2713 Location read. Press Save to use it.');
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
      setShowOfficeEditor(false);
      triggerToast('\u2713 Office location saved');
    } catch {
      triggerToast('\u2717 Could not save the office location');
    }
  };

  const headcount = teamMembers.length;
  const presentToday = teamMembers.filter((m) => m.attendanceStatus === 'PRESENT').length;
  const callsToday = teamMembers.reduce((sum, m) => sum + (m.dialsToday || 0), 0);
  const salesAchieved = teamMembers.reduce((sum, m) => sum + (m.salesAchieved || 0), 0);
  const salesTarget = teamMembers.reduce((sum, m) => sum + (m.salesTarget || 0), 0);
  const pendingPayments = paymentVerifications.filter((p) => p.status === 'PENDING_HR_AUDIT');
  const leadsDueToday = clients.filter((c) => c.status === 'Due Today');

  const awayWithoutLeave = teamMembers.filter((m) => m.attendanceStatus === 'ABSENT');
  const idleToday = teamMembers.filter(
    (m) => m.attendanceStatus === 'PRESENT' && (m.dialsToday || 0) === 0
  );

  const filteredPeople = teamMembers.filter((m) => {
    const matchesFilter =
      attendanceFilter === 'ALL' ||
      m.attendanceStatus === attendanceFilter;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.empCode.toLowerCase().includes(q) ||
      (m.role ?? '').toLowerCase().includes(q) ||
      (m.group ?? '').toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const statusChip = (status: string) => (
    <span
      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
        status === 'PRESENT'
          ? 'bg-emerald-50 text-emerald-700'
          : status === 'LATE'
          ? 'bg-amber-50 text-amber-700'
          : status === 'ON_LEAVE'
          ? 'bg-sky-50 text-sky-700'
          : 'bg-rose-50 text-rose-700'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );

  const AdminKpiCard: React.FC<{
    label: string;
    value: string;
    sub?: string;
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    badge?: string;
    badgeStyle?: string;
    progress?: number;
    onClick?: () => void;
  }> = ({ label, value, sub, icon: Icon, iconBg, iconColor, badge, badgeStyle, progress, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-[#00C9A7] active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`w-7 h-7 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-black text-xl text-[#0A2540] tracking-tight">{value}</span>
        </div>

        {sub && (
          <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">{sub}</span>
        )}

        {progress !== undefined && (
          <div className="mt-2 space-y-1">
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#00C9A7] to-teal-500 transition-all duration-500" 
                style={{ width: `${Math.min(100, progress)}%` }} 
              />
            </div>
          </div>
        )}

        {badge && (
          <div className="mt-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${badgeStyle || 'bg-slate-100 text-slate-600'}`}>
              {badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs text-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{label}</span>
      <span className="font-display font-black text-lg text-[#0A2540] block leading-tight mt-0.5">{value}</span>
      {sub && <span className="text-[9px] text-slate-400 font-medium block truncate">{sub}</span>}
    </div>
  );

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="font-display font-bold text-sm text-[#0A2540] px-1">{children}</h3>
  );

  const Empty: React.FC<{ text: string }> = ({ text }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-[11px] text-slate-400 font-semibold">
      {text}
    </div>
  );

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Overview', icon: Home },
    { id: 'people', label: 'People', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leads', label: 'Leads', icon: FileSpreadsheet },
    { id: 'more', label: 'More', icon: MoreHorizontal, badge: pendingPayments.length },
  ];

  if (selectedMemberFor360) {
    return (
      <Employee360ProfileView
        member={selectedMemberFor360}
        onBack={() => setSelectedMemberFor360(null)}
        viewerRole="admin"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between max-w-lg mx-auto font-sans pb-24">
      <main className="flex-1 p-3.5 space-y-4 pt-3">

        {/* ---------------------------------------------------- Overview */}
        {tab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Executive Header */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#0A2540] text-[#00C9A7]">
                    Admin Command
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
                </div>
                <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight mt-1">
                  Executive Overview
                </h2>
                <p className="text-xs text-slate-500 font-medium">Floor momentum & company-wide operations</p>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-display font-black text-xs shadow-md border border-[#00C9A7]/30">
                AD
              </div>
            </div>

            {/* 4 Core Balanced KPI Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: Total Employees */}
              <AdminKpiCard
                label="Employees"
                value={String(headcount)}
                icon={Users}
                iconBg="bg-sky-50"
                iconColor="text-sky-600"
                badge={`${headcount} Active Roster`}
                badgeStyle="bg-sky-50 text-sky-700 border border-sky-200/60"
                onClick={() => setTab('people')}
              />

              {/* Card 2: Present Today */}
              <AdminKpiCard
                label="Present Today"
                value={`${presentToday}/${headcount}`}
                icon={UserCheck}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                badge={`${Math.round((presentToday / Math.max(1, headcount)) * 100)}% On-Duty`}
                badgeStyle="bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                onClick={() => setTab('attendance')}
              />

              {/* Card 3: Calls Dialed */}
              <AdminKpiCard
                label="Calls Today"
                value={String(callsToday)}
                icon={PhoneCall}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                badge={`${Math.round(callsToday / Math.max(1, headcount))} Dials / Rep`}
                badgeStyle="bg-indigo-50 text-indigo-700 border border-indigo-200/60"
              />

              {/* Card 4: Sales This Month */}
              <AdminKpiCard
                label="Sales This Month"
                value={inr(salesAchieved)}
                sub={`Target: ${inr(salesTarget)}`}
                icon={TrendingUp}
                iconBg="bg-[#E6FAF6]"
                iconColor="text-[#00A88B]"
                progress={salesTarget > 0 ? Math.round((salesAchieved / salesTarget) * 100) : 0}
                badge={`${salesTarget > 0 ? Math.round((salesAchieved / salesTarget) * 100) : 0}% Realized`}
                badgeStyle="bg-[#E6FAF6] text-[#00A88B] border border-[#00C9A7]/40"
              />
            </div>

            {/* Quick Actions Hub */}
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A88B] flex items-center justify-center group-hover:bg-[#00C9A7] group-hover:text-[#0A2540] transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#0A2540] leading-tight">Add Member</span>
              </button>

              <button
                onClick={() => setIsExcelUploadModalOpen(true)}
                className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#0A2540] leading-tight">Import Leads</span>
              </button>

              <button
                onClick={() => {
                  setTab('attendance');
                  setShowOfficeEditor(true);
                }}
                className="bg-white border border-slate-200/90 hover:border-sky-400 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 text-center active:scale-95 transition-all shadow-2xs group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#0A2540] leading-tight">Geofence</span>
              </button>
            </div>

            {/* Needs Your Attention Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="font-display font-black text-sm text-[#0A2540] flex items-center gap-1.5">
                  <span>Needs Your Attention</span>
                  {(pendingPayments.length > 0 || idleToday.length > 0 || awayWithoutLeave.length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Real-time alerts</span>
              </div>

              {!pendingPayments.length && !awayWithoutLeave.length && !idleToday.length ? (
                <Empty text="✨ All clear! No pending audits or floor alerts right now." />
              ) : (
                <div className="space-y-2">
                  {/* Pending Payment Cards */}
                  {pendingPayments.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-amber-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          💰 Payment Audit Required
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.timestamp || 'Today'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-sm font-black text-[#0A2540] block">
                            {inr(p.dealAmount)}
                          </strong>
                          <span className="text-xs text-slate-600 font-medium">
                            {p.companyName} • <span className="text-slate-400">Rep: {p.telecallerName}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => setTab('approvals')}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Telecallers with Zero Calls Today */}
                  {idleToday.length > 0 && (
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                          ⚠️ Zero Dials Logged
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{idleToday.length} Telecallers</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {idleToday.map((m) => (
                          <div key={m.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-[#0A2540] text-[#00C9A7] font-black text-[10px] flex items-center justify-center">
                                {m.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#0A2540] block">{m.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">In at {m.checkInTime || '—'}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              0 Calls
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Absent Without Leave */}
                  {awayWithoutLeave.map((m) => (
                    <div key={m.id} className="bg-rose-50/50 border border-rose-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-rose-950 block">{m.name} is Absent</strong>
                          <span className="text-[10px] text-rose-600">No approved leave logged in system</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Download Reports Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <h3 className="font-display font-black text-sm text-[#0A2540]">
                  Executive CSV Reports
                </h3>
                <button
                  onClick={() => setTab('reports')}
                  className="text-[11px] font-bold text-[#00A88B] hover:text-[#0A2540] transition-colors cursor-pointer"
                >
                  All 8 Reports →
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    downloadCsv(
                      'Employees',
                      'Name,Code,Role,Team,Status,Calls today,Sales',
                      teamMembers.map(
                        (e) =>
                          `"${e.name}","${e.empCode}","${e.role}","${e.group}","${e.attendanceStatus}",${e.dialsToday},${e.salesAchieved}`
                      )
                    );
                    triggerToast('✓ Employee roster CSV exported');
                  }}
                  className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3 text-left shadow-2xs active:scale-95 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A88B] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Download className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                      .CSV
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-[#0A2540] block">Employee Roster</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Sales, targets & calls</span>
                </button>

                <button
                  onClick={() => {
                    downloadCsv(
                      'Attendance',
                      'Name,Team,Status,Check-in,Method',
                      teamMembers.map(
                        (m) =>
                          `"${m.name}","${m.group}","${m.attendanceStatus}","${m.checkInTime || ''}","${m.checkInMethod || ''}"`
                      )
                    );
                    triggerToast('✓ Attendance ledger CSV exported');
                  }}
                  className="bg-white border border-slate-200/90 hover:border-sky-400 rounded-2xl p-3 text-left shadow-2xs active:scale-95 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                      .CSV
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-[#0A2540] block">Attendance Logs</strong>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Punch-ins & geofence</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ People */}
        {tab === 'people' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Header + Mode Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-xl text-[#0A2540]">
                  {selectedAdminTeamGroup
                    ? selectedAdminTeamGroup.name
                    : adminPeopleMode === 'TEAMS'
                    ? 'All Teams'
                    : `Workforce Roster (${headcount})`}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedAdminTeamGroup
                    ? 'Squad telecallers & operational performance'
                    : adminPeopleMode === 'TEAMS'
                    ? 'Click any team to inspect employees & 360 dossiers'
                    : 'Tap any employee to view full 360 profile'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!selectedAdminTeamGroup && (
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setAdminPeopleMode('TEAMS')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        adminPeopleMode === 'TEAMS'
                          ? 'bg-[#0A2540] text-[#00C9A7] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Teams
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminPeopleMode('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        adminPeopleMode === 'ALL'
                          ? 'bg-[#0A2540] text-[#00C9A7] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Roster
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center gap-1 bg-[#00C9A7] text-[#0A2540] font-extrabold text-xs px-2.5 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* LEVEL 1: TEAMS BREAKDOWN (When adminPeopleMode === 'TEAMS' and selectedAdminTeamGroup === null) */}
            {adminPeopleMode === 'TEAMS' && !selectedAdminTeamGroup && (
              <div className="space-y-3.5">
                {/* Floor-wide Pulse Banner */}
                <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black tracking-wider text-[#0A2540] uppercase">
                        Floor Operations Pulse
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div className="bg-[#E6F8F5] border border-[#B2EFE5] text-[#00897B] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                      {presentToday} Present • {headcount - presentToday} Away
                    </div>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
                    <div className="px-1">
                      <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                        {teamGroups.length}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Teams
                      </span>
                    </div>

                    <div className="px-1">
                      <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                        <span className="text-[#00A88B]">{callsToday}</span>
                        <span className="text-slate-300 font-normal text-xs">/{teamMembers.reduce((s, m) => s + (m.goalCalls || 100), 0)}</span>
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Calls
                      </span>
                    </div>

                    <div className="px-1">
                      <strong className="text-base font-display font-black text-purple-700 block leading-tight">
                        {teamMembers.filter(m => m.salesAchieved > 0).length || 7}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Won
                      </span>
                    </div>

                    <div className="px-1">
                      <strong className="text-base font-display font-black text-[#00A88B] block leading-tight">
                        {formatInLakhs(salesAchieved)}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                        Revenue
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Cards Header */}
                <div className="flex items-center justify-between px-1">
                  <SectionTitle>All Teams ({teamGroups.length})</SectionTitle>
                  <button
                    onClick={() => setIsCreateTeamOpen(true)}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#00A88B] active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Team</span>
                  </button>
                </div>

                {/* All Teams Cards */}
                {!teamGroups.length ? (
                  <Empty text="No teams yet. Create a team to get started." />
                ) : (
                  <div className="space-y-3">
                    {teamGroups.map((g) => {
                      const squad = teamMembers.filter((m) => m.group === g.name);
                      const squadDials = squad.reduce((s, m) => s + (m.dialsToday || 0), 0);
                      const squadGoals = squad.reduce((s, m) => s + (m.goalCalls || 100), 0);
                      const squadWon = squad.filter((m) => m.salesAchieved > 0).length;
                      const squadRev = squad.reduce((s, m) => s + (m.salesAchieved || 0), 0);
                      const squadPresent = squad.filter((m) => m.attendanceStatus === 'PRESENT').length;
                      const squadLate = squad.filter((m) => m.attendanceStatus === 'LATE').length;
                      const squadLeave = squad.filter((m) => m.attendanceStatus === 'ON_LEAVE').length;

                      return (
                        <div
                          key={g.id}
                          className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all"
                        >
                          {/* Team Title + TL */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-bold text-xs">
                                <Layers className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-xs font-black text-[#0A2540]">{g.name}</h3>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  Leader: <span className="font-bold text-[#0A2540]">{g.leaderName || 'Unassigned'}</span> • {squad.length} members
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              Target: {inr(g.monthlyTarget)}
                            </span>
                          </div>

                          {/* 4 Metric Columns */}
                          <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                            <div className="px-1">
                              <strong className="text-sm font-display font-black text-[#0A2540] block leading-tight">
                                {squad.length}
                              </strong>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                Team
                              </span>
                            </div>
                            <div className="px-1">
                              <strong className="text-sm font-display font-black text-[#0A2540] block leading-tight">
                                <span className="text-[#00A88B]">{squadDials}</span>
                                <span className="text-slate-300 font-normal text-[10px]">/{squadGoals}</span>
                              </strong>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                Calls
                              </span>
                            </div>
                            <div className="px-1">
                              <strong className="text-sm font-display font-black text-purple-700 block leading-tight">
                                {squadWon}
                              </strong>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                Won
                              </span>
                            </div>
                            <div className="px-1">
                              <strong className="text-sm font-display font-black text-[#00A88B] block leading-tight">
                                {formatInLakhs(squadRev)}
                              </strong>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                Revenue
                              </span>
                            </div>
                          </div>

                          {/* Attendance Status Pill */}
                          <div className="bg-[#E6F8F5] border border-[#B2EFE5] text-[#00897B] font-bold text-[10px] px-2.5 py-1 rounded-xl text-center">
                            {squadPresent} Present • {squadLate} Late • {squadLeave} Leave
                          </div>

                          {/* Actions: Manage Squad + View Employees */}
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setManagingSquad(g)}
                              className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 px-3 rounded-xl transition-all border border-slate-200 active:scale-95 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5 text-[#00A88B]" />
                              <span>{squad.length === 0 ? '+ Add Reps' : 'Manage Squad'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedAdminTeamGroup(g)}
                              className="flex items-center justify-center gap-1.5 bg-[#0A2540] hover:bg-[#133353] text-[#00C9A7] font-bold text-[11px] py-2 px-3 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                            >
                              <span>View Employees</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LEVEL 2: SPECIFIC TEAM SQUAD (When adminPeopleMode === 'TEAMS' and selectedAdminTeamGroup !== null) */}
            {adminPeopleMode === 'TEAMS' && selectedAdminTeamGroup && (
              <div className="space-y-3.5">
                {/* Back to All Teams Navigation */}
                <button
                  type="button"
                  onClick={() => setSelectedAdminTeamGroup(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0A2540] bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#00A88B]" />
                  <span>← All Teams</span>
                </button>

                {/* Team Summary Pulse Card */}
                <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black tracking-wider text-[#00A88B] uppercase">
                        Team Squad Pulse
                      </span>
                      <h3 className="font-display font-black text-lg text-[#0A2540] leading-tight">
                        {selectedAdminTeamGroup.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Leader: <span className="font-bold text-[#0A2540]">{selectedAdminTeamGroup.leaderName || 'Unassigned'}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setManagingSquad(selectedAdminTeamGroup)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1"
                    >
                      <Users className="w-3 h-3 text-[#00A88B]" />
                      <span>Manage Squad</span>
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {(() => {
                    const squad = teamMembers.filter((m) => m.group === selectedAdminTeamGroup.name);
                    const squadDials = squad.reduce((s, m) => s + (m.dialsToday || 0), 0);
                    const squadGoals = squad.reduce((s, m) => s + (m.goalCalls || 100), 0);
                    const squadWon = squad.filter((m) => m.salesAchieved > 0).length;
                    const squadRev = squad.reduce((s, m) => s + (m.salesAchieved || 0), 0);
                    const squadPresent = squad.filter((m) => m.attendanceStatus === 'PRESENT').length;
                    const squadLate = squad.filter((m) => m.attendanceStatus === 'LATE').length;
                    const squadLeave = squad.filter((m) => m.attendanceStatus === 'ON_LEAVE').length;

                    return (
                      <>
                        <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
                          <div className="px-1">
                            <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                              {squad.length}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Team
                            </span>
                          </div>
                          <div className="px-1">
                            <strong className="text-base font-display font-black text-[#0A2540] block leading-tight">
                              <span className="text-[#00A88B]">{squadDials}</span>
                              <span className="text-slate-300 font-normal text-xs">/{squadGoals}</span>
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Calls
                            </span>
                          </div>
                          <div className="px-1">
                            <strong className="text-base font-display font-black text-purple-700 block leading-tight">
                              {squadWon}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Won
                            </span>
                          </div>
                          <div className="px-1">
                            <strong className="text-base font-display font-black text-[#00A88B] block leading-tight">
                              {formatInLakhs(squadRev)}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                              Revenue
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#E6F8F5] border border-[#B2EFE5] text-[#00897B] font-bold text-[10px] px-2.5 py-1 rounded-xl text-center">
                          {squadPresent} Present • {squadLate} Late • {squadLeave} Leave
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Search within this team */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search in ${selectedAdminTeamGroup.name}...`}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>

                {/* Filter Pills for this team */}
                {(() => {
                  const squad = teamMembers.filter((m) => m.group === selectedAdminTeamGroup.name);
                  const pCount = squad.filter((m) => m.attendanceStatus === 'PRESENT').length;
                  const lCount = squad.filter((m) => m.attendanceStatus === 'LATE').length;
                  const oCount = squad.filter((m) => m.attendanceStatus === 'ON_LEAVE').length;

                  return (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('ALL')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'ALL'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        All ({squad.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('PRESENT')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'PRESENT'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Present ({pCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('LATE')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'LATE'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Late ({lCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendanceFilter('ON_LEAVE')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                          attendanceFilter === 'ON_LEAVE'
                            ? 'bg-[#0A2540] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Leave ({oCount})
                      </button>
                    </div>
                  );
                })()}

                {/* Team's Telecallers List */}
                <div className="space-y-3">
                  {teamMembers
                    .filter((m) => m.group === selectedAdminTeamGroup.name)
                    .filter((m) => {
                      const matchSearch =
                        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.empCode.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchFilter =
                        attendanceFilter === 'ALL' || m.attendanceStatus === attendanceFilter;
                      return matchSearch && matchFilter;
                    })
                    .map((member) => {
                      const isPresent = member.attendanceStatus === 'PRESENT';
                      const isLate = member.attendanceStatus === 'LATE';

                      return (
                        <div
                          key={member.id}
                          onClick={() => setSelectedMemberFor360(member)}
                          className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-2xs hover:shadow-md flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] transition-all group relative overflow-hidden"
                        >
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              isPresent
                                ? 'bg-gradient-to-r from-emerald-400 to-[#00C9A7]'
                                : isLate
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                : 'bg-gradient-to-r from-rose-400 to-rose-500'
                            }`}
                          />

                          <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-display font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                                  {member.avatar || member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                    isPresent
                                      ? 'bg-emerald-500'
                                      : isLate
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                />
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <strong className="text-xs font-bold text-[#0A2540] group-hover:text-[#00A88B] transition-colors">
                                    {member.name}
                                  </strong>
                                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md border border-slate-200/80">
                                    {member.group}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {member.empCode} • {member.role ? member.role.replace(/telecaller/gi, 'Telecaller') : 'Telecaller'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isPresent
                                  ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80'
                                  : isLate
                                  ? 'bg-amber-100/90 text-amber-800 border border-amber-200/80'
                                  : 'bg-rose-100/90 text-rose-800 border border-rose-200/80'
                              }`}
                            >
                              {member.attendanceStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-1.5 rounded-xl border border-slate-100 text-center">
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Dials</span>
                              <strong className="text-xs font-mono font-black text-[#0A2540]">{member.dialsToday || 0}</strong>
                            </div>
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-[#00A88B] block font-bold uppercase tracking-wider">Sales</span>
                              <strong className="text-xs font-mono font-black text-[#00A88B]">{formatInLakhs(member.salesAchieved)}</strong>
                            </div>
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-emerald-600 block font-bold uppercase tracking-wider">Interested</span>
                              <strong className="text-xs font-mono font-black text-emerald-700">{member.interested || 0}</strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              In: {member.checkInTime || '—'}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-[#E6FAF6] text-[#00A88B] font-bold group-hover:bg-[#00C9A7] group-hover:text-[#0A2540] transition-colors flex items-center gap-1 shadow-2xs">
                              <span>View 360 Profile</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  {teamMembers.filter((m) => m.group === selectedAdminTeamGroup.name).length === 0 && (
                    <Empty text={`No telecallers assigned to ${selectedAdminTeamGroup.name} yet.`} />
                  )}
                </div>
              </div>
            )}

            {/* FULL WORKFORCE ROSTER (When adminPeopleMode === 'ALL') */}
            {adminPeopleMode === 'ALL' && (
              <div className="space-y-3.5">
                {/* Filter Pills */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {(['ALL', 'PRESENT', 'LATE', 'ON_LEAVE'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setAttendanceFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          attendanceFilter === f ? 'bg-[#00C9A7] text-[#0A2540] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {f === 'ALL' ? 'All' : f === 'ON_LEAVE' ? 'Leave' : f}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono font-bold">
                    {filteredPeople.length} Showing
                  </span>
                </div>

                {/* Mobile Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search employee by name, code or team..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00C9A7]"
                  />
                </div>

                {!filteredPeople.length ? (
                  <Empty text={headcount ? 'Nobody matches that search.' : 'No employees yet. Tap Add to begin.'} />
                ) : (
                  <div className="space-y-3">
                    {filteredPeople.map((member) => {
                      const isPresent = member.attendanceStatus === 'PRESENT';
                      const isLate = member.attendanceStatus === 'LATE';

                      return (
                        <div
                          key={member.id}
                          onClick={() => setSelectedMemberFor360(member)}
                          className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3.5 shadow-2xs hover:shadow-md flex flex-col gap-2.5 cursor-pointer active:scale-[0.98] transition-all group relative overflow-hidden"
                        >
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              isPresent
                                ? 'bg-gradient-to-r from-emerald-400 to-[#00C9A7]'
                                : isLate
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                                : 'bg-gradient-to-r from-rose-400 to-rose-500'
                            }`}
                          />

                          <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="w-11 h-11 rounded-2xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-display font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                                  {member.avatar || member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                    isPresent
                                      ? 'bg-emerald-500'
                                      : isLate
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                />
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <strong className="text-xs font-bold text-[#0A2540] group-hover:text-[#00A88B] transition-colors">
                                    {member.name}
                                  </strong>
                                  <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded-md border border-slate-200/80">
                                    {member.group}
                                  </span>
                                  {member.active === 0 && (
                                    <span className="text-[8px] font-black px-1 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {member.empCode} • {member.role ? member.role.replace(/telecaller/gi, 'Employee') : 'Employee'}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isPresent
                                  ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200/80'
                                  : isLate
                                  ? 'bg-amber-100/90 text-amber-800 border border-amber-200/80'
                                  : 'bg-rose-100/90 text-rose-800 border border-rose-200/80'
                              }`}
                            >
                              {member.attendanceStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-50/90 p-1.5 rounded-xl border border-slate-100 text-center">
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Dials</span>
                              <strong className="text-xs font-mono font-black text-[#0A2540]">{member.dialsToday || 0}</strong>
                            </div>
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-[#00A88B] block font-bold uppercase tracking-wider">Sales</span>
                              <strong className="text-xs font-mono font-black text-[#00A88B]">{formatInLakhs(member.salesAchieved)}</strong>
                            </div>
                            <div className="bg-white rounded-lg py-1.5 px-1 shadow-2xs border border-slate-100/80">
                              <span className="text-[9px] text-emerald-600 block font-bold uppercase tracking-wider">Interested</span>
                              <strong className="text-xs font-mono font-black text-emerald-700">{member.interested || 0}</strong>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                            <span className="text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              In: {member.checkInTime || '—'}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-[#E6FAF6] text-[#00A88B] font-bold group-hover:bg-[#00C9A7] group-hover:text-[#0A2540] transition-colors flex items-center gap-1 shadow-2xs">
                              <span>View 360 Profile</span>
                              <span>→</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------- Attendance */}
        {tab === 'attendance' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">Attendance</h2>
              <p className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short' })}
              </p>
            </div>

            {/* Company Calendar & Holiday Configuration */}
            <AdminCalendarConfig />

            {/* Office location — the point every check-in is measured against */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
              <button
                onClick={() => setShowOfficeEditor((v) => !v)}
                className="w-full flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-[#00A88B] flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="text-xs font-bold text-[#0A2540] block truncate">
                      {office?.label || 'Office location'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {office?.latitude != null
                        ? `Within ${office.radiusMeters}m counts as at office`
                        : 'Not set yet — tap to set'}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${showOfficeEditor ? 'rotate-90' : ''}`}
                />
              </button>

              {showOfficeEditor && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <input
                    type="text"
                    value={String(officeField('label') ?? '')}
                    onChange={(e) => setOfficeDraft((d) => ({ ...d, label: e.target.value }))}
                    placeholder="Office name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.000001"
                      value={String(officeField('latitude') ?? '')}
                      onChange={(e) => setOfficeDraft((d) => ({ ...d, latitude: Number(e.target.value) }))}
                      placeholder="Latitude"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                    />
                    <input
                      type="number"
                      step="0.000001"
                      value={String(officeField('longitude') ?? '')}
                      onChange={(e) => setOfficeDraft((d) => ({ ...d, longitude: Number(e.target.value) }))}
                      placeholder="Longitude"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={String(officeField('radiusMeters') ?? 200)}
                      onChange={(e) => setOfficeDraft((d) => ({ ...d, radiusMeters: Number(e.target.value) }))}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                    />
                    <span className="text-[11px] font-bold text-slate-500">metres</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={useMyLocation}
                      disabled={locating}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 disabled:opacity-60 text-slate-700 font-bold text-[11px] px-3 py-2.5 rounded-xl active:scale-95 transition-all"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>{locating ? 'Reading…' : 'Use my location'}</span>
                    </button>
                    <button
                      onClick={saveOffice}
                      disabled={!Object.keys(officeDraft).length}
                      className="flex items-center justify-center gap-1.5 bg-[#00C9A7] disabled:bg-slate-200 disabled:text-slate-400 text-[#0A2540] font-black text-[11px] px-3 py-2.5 rounded-xl active:scale-95 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Stat label="Present" value={String(presentToday)} />
              <Stat label="Late" value={String(teamMembers.filter((m) => m.attendanceStatus === 'LATE').length)} />
              <Stat label="Leave" value={String(teamMembers.filter((m) => m.attendanceStatus === 'ON_LEAVE').length)} />
              <Stat label="Absent" value={String(teamMembers.filter((m) => m.attendanceStatus === 'ABSENT').length)} />
            </div>

            {!teamMembers.length ? (
              <Empty text="No employees yet." />
            ) : (
              <div className="space-y-2">
                {teamMembers.map((m) => {
                  const todayIso = new Date().toISOString().split('T')[0];
                  const rec = attendanceLogs.find((a) => a.employeeId === m.id && a.date === todayIso);
                  const locLabel =
                    rec?.locationStatus === 'AT_OFFICE' ? 'At office'
                    : rec?.locationStatus === 'AWAY'
                      ? rec.checkInDistanceM != null ? `${(rec.checkInDistanceM / 1000).toFixed(1)} km away` : 'Away'
                    : rec?.locationStatus === 'OFFICE_NOT_SET' ? 'Office not set'
                    : rec ? 'Not shared' : null;

                  return (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMemberFor360(m)}
                    className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.99] transition-all group shadow-2xs"
                  >
                    {rec?.checkInPhoto ? (
                      <img
                        src={rec.checkInPhoto}
                        alt={`${m.name} at check-in`}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-display font-black text-xs flex-shrink-0">
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] group-hover:text-[#00A88B] transition-colors block truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{m.group}</span>
                      {locLabel && (
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                            rec?.locationStatus === 'AT_OFFICE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : rec?.locationStatus === 'AWAY'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {locLabel}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono text-xs font-bold text-slate-700 block">
                        {m.checkInTime || '—'}
                      </span>
                      {rec?.checkOut && (
                        <span className="font-mono text-[10px] text-slate-400 block">out {rec.checkOut}</span>
                      )}
                      {statusChip(m.attendanceStatus)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#00C9A7] flex-shrink-0 transition-colors" />
                  </div>
                  );
                })}
              </div>
            )}

            <p className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5">
              <strong className="text-slate-700">Admin only:</strong> the photo and location are sent
              to nobody else. HR and Team Leaders see this list without them.
            </p>
          </div>
        )}

        {/* ------------------------------------------------------- Leads */}
        {tab === 'leads' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">Leads</h2>
                <p className="text-xs text-slate-500 font-medium">Who is holding what</p>
              </div>
              <button
                onClick={() => setIsExcelUploadModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#00C9A7] text-[#0A2540] font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#00C9A7]/25 active:scale-95 transition-all flex-shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>

            {!teamMembers.length ? (
              <Empty text="No employees yet." />
            ) : (
              <div className="space-y-2">
                {teamMembers.map((m) => {
                  const mine = assignedLeads.filter((l) => l.assignedToEmployeeId === m.id);
                  return (
                    <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#0A2540] block truncate">{m.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {mine.filter((l) => l.callCount > 0).length} called ·{' '}
                          {mine.filter((l) => l.status === 'CONVERTED').length} converted
                        </span>
                      </div>
                      <span className="font-mono-nums font-black text-lg text-[#0A2540] flex-shrink-0">
                        {mine.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <SectionTitle>Move leads</SectionTitle>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
              <select
                value={moveFrom}
                onChange={(e) => setMoveFrom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              >
                <option value="">From — choose employee</option>
                {teamMembers
                  .filter((m) =>
                    assignedLeads.some(
                      (l) =>
                        l.assignedToEmployeeId === m.id ||
                        (l.assignedToEmployeeName &&
                          l.assignedToEmployeeName.toLowerCase() === m.name.toLowerCase())
                    )
                  )
                  .map((m) => {
                    const count = assignedLeads.filter(
                      (l) =>
                        l.assignedToEmployeeId === m.id ||
                        (l.assignedToEmployeeName &&
                          l.assignedToEmployeeName.toLowerCase() === m.name.toLowerCase())
                    ).length;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} ({count} leads)
                      </option>
                    );
                  })}
              </select>
              <select
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              >
                <option value="">To — choose employee</option>
                {teamMembers
                  .filter((m) => m.id !== moveFrom && m.active !== 0)
                  .map((m) => {
                    const count = assignedLeads.filter(
                      (l) =>
                        l.assignedToEmployeeId === m.id ||
                        (l.assignedToEmployeeName &&
                          l.assignedToEmployeeName.toLowerCase() === m.name.toLowerCase())
                    ).length;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} ({count} leads held)
                      </option>
                    );
                  })}
              </select>
              <button
                onClick={async () => {
                  await reassignLeadsBetween(moveFrom, moveTo);
                  setMoveFrom('');
                  setMoveTo('');
                }}
                disabled={!moveFrom || !moveTo}
                className="w-full bg-[#0A2540] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs py-2.5 rounded-xl active:scale-95 transition-all"
              >
                Move leads
              </button>
            </div>

            <SectionTitle>Recent uploads</SectionTitle>
            {!leadBatches.length ? (
              <Empty text="No lead files uploaded yet." />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {leadBatches.map((b) => (
                  <div key={b.id} className="p-3">
                    <span className="text-xs font-bold text-[#0A2540] block truncate">{b.fileName}</span>
                    <span className="text-[10px] text-slate-500">
                      {b.totalLeads} leads → {b.assignedToEmployeeName} · {b.uploadedAt}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* -------------------------------------------------------- More */}
        {tab === 'more' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">
                Control Hub
              </h2>
              <p className="text-xs text-slate-500 font-medium">System operations, approvals & configuration</p>
            </div>

            <div className="space-y-2.5">
              {/* Approvals Option */}
              <div
                onClick={() => setTab('approvals')}
                className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-4 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0A2540] group-hover:text-amber-700 transition-colors">
                        Approvals & Audits
                      </h4>
                      {pendingPayments.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px]">
                          {pendingPayments.length} Pending
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">Review deal payments & payment receipts</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors" />
              </div>

              {/* Reports Option */}
              <div
                onClick={() => setTab('reports')}
                className="bg-white border border-slate-200/90 hover:border-[#00C9A7] rounded-2xl p-4 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00A88B] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A2540] group-hover:text-[#00A88B] transition-colors">
                      Executive CSV Reports
                    </h4>
                    <span className="text-xs text-slate-500">8 company data extracts (Sales, Calls, Staff)</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#00C9A7] transition-colors" />
              </div>

              {/* Geofence Office Editor */}
              <div
                onClick={() => {
                  setTab('attendance');
                  setShowOfficeEditor(true);
                }}
                className="bg-white border border-slate-200/90 hover:border-sky-400 rounded-2xl p-4 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A2540] group-hover:text-sky-600 transition-colors">
                      Geofence & Location
                    </h4>
                    <span className="text-xs text-slate-500">Office coordinates & punch-in perimeter</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
              </div>

              {/* Lead Import Modal */}
              <div
                onClick={() => setIsExcelUploadModalOpen(true)}
                className="bg-white border border-slate-200/90 hover:border-indigo-400 rounded-2xl p-4 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A2540] group-hover:text-indigo-600 transition-colors">
                      Import Lead Batches
                    </h4>
                    <span className="text-xs text-slate-500">Upload Excel/CSV client contacts</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>

              {/* Create Team Squad */}
              <div
                onClick={() => setIsCreateTeamOpen(true)}
                className="bg-white border border-slate-200/90 hover:border-purple-400 rounded-2xl p-4 shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0A2540] group-hover:text-purple-600 transition-colors">
                      Manage Team Squads
                    </h4>
                    <span className="text-xs text-slate-500">Create squad & assign team leaders</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-600 transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------- Approvals */}
        {tab === 'approvals' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <button
              onClick={() => setTab('more')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0A2540] transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to More</span>
            </button>

            <div>
              <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">Approvals</h2>
              <p className="text-xs text-slate-500 font-medium">
                {pendingPayments.length} waiting for your sign-off
              </p>
            </div>

            {!pendingPayments.length ? (
              <Empty text="Nothing waiting. Every payment has been dealt with." />
            ) : (
              <div className="space-y-2.5">
                {pendingPayments.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div>
                      <span className="font-mono-nums font-black text-xl text-[#0A2540] block">
                        {inr(p.dealAmount)}
                      </span>
                      <span className="text-xs font-bold text-slate-700 block">{p.companyName}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Closed by {p.telecallerName || 'Employee'} · {p.paymentMode}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block">UTR {p.utrNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => verifyPayment(p.id, 'VERIFIED')}
                        className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => verifyPayment(p.id, 'REJECTED')}
                        className="py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SectionTitle>Already decided</SectionTitle>
            {paymentVerifications.filter((p) => p.status !== 'PENDING_HR_AUDIT').length === 0 ? (
              <Empty text="No decisions recorded yet." />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {paymentVerifications
                  .filter((p) => p.status !== 'PENDING_HR_AUDIT')
                  .map((p) => (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#0A2540] block truncate">
                          {inr(p.dealAmount)} · {p.companyName}
                        </span>
                        <span className="text-[10px] text-slate-500">{p.telecallerName || 'Employee'}</span>
                      </div>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded flex-shrink-0 ${
                          p.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------- Reports */}
        {tab === 'reports' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <button
              onClick={() => setTab('more')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0A2540] transition-colors mb-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to More</span>
            </button>

            <div>
              <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">Reports</h2>
              <p className="text-xs text-slate-500 font-medium">Download spreadsheet reports directly to your device.</p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  label: 'Employees Roster',
                  blurb: 'Staff list, role, team and sales stats.',
                  icon: Users,
                  run: () =>
                    downloadCsv(
                      'Employees',
                      'Name,Code,Role,Team,Status,Calls today,Sales',
                      teamMembers.map(
                        (e) => `"${e.name}","${e.empCode}","${e.role}","${e.group}","${e.attendanceStatus}",${e.dialsToday},${e.salesAchieved}`
                      )
                    ),
                },
                {
                  label: 'Attendance Register',
                  blurb: 'Daily punch times and check-in methods.',
                  icon: CalendarCheck,
                  run: () =>
                    downloadCsv(
                      'Attendance',
                      'Name,Team,Status,Check-in,Method',
                      teamMembers.map(
                        (m) => `"${m.name}","${m.group}","${m.attendanceStatus}","${m.checkInTime || ''}","${m.checkInMethod || ''}"`
                      )
                    ),
                },
                {
                  label: 'Calls & Conversions',
                  blurb: 'Dials, connected calls and interested leads.',
                  icon: TrendingUp,
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
                  label: 'Sales vs Target',
                  blurb: 'Monthly revenue performance per caller.',
                  icon: Wallet,
                  run: () =>
                    downloadCsv(
                      'Sales',
                      'Name,Team,Achieved,Target,Percent',
                      teamMembers.map(
                        (m) => `"${m.name}","${m.group}",${m.salesAchieved},${m.salesTarget},${Math.round((m.salesAchieved / Math.max(1, m.salesTarget)) * 100)}`
                      )
                    ),
                },
                {
                  label: 'Payment Verifications',
                  blurb: 'Full audit history of payment receipts.',
                  icon: CheckCircle2,
                  run: () =>
                    downloadCsv(
                      'Payments',
                      'Company,Lead,Telecaller,Amount,Mode,UTR,Status',
                      paymentVerifications.map(
                        (p) => `"${p.companyName}","${p.leadName}","${p.telecallerName}",${p.dealAmount},"${p.paymentMode}","${p.utrNumber}","${p.status}"`
                      )
                    ),
                },
                {
                  label: 'Lead Allocation Pipeline',
                  blurb: 'Active leads held by each telecaller.',
                  icon: FileSpreadsheet,
                  run: () =>
                    downloadCsv(
                      'Lead_Allocation',
                      'Lead,Company,Phone,Assigned to,Status,Calls',
                      assignedLeads.map(
                        (l) => `"${l.name}","${l.company}","${l.phone}","${l.assignedToEmployeeName}","${l.status}",${l.callCount}`
                      )
                    ),
                },
              ].map((r, i) => {
                const Icon = r.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      r.run();
                      triggerToast(`✓ ${r.label} downloaded`);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-xs flex items-center justify-between active:scale-[.99] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A88B] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#0A2540] block">{r.label}</span>
                        <span className="text-[11px] text-slate-500">{r.blurb}</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-around items-center px-1 py-1.5 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 rounded-xl transition-all relative cursor-pointer active:scale-95 group flex-1"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                isActive ? 'bg-[#E6FAF6] text-[#00A88B] shadow-2xs' : 'text-slate-400 group-hover:text-slate-600'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-[9px] transition-colors leading-tight ${
                isActive ? 'font-black text-[#0A2540]' : 'font-semibold text-slate-400'
              }`}>
                {item.label}
              </span>
              {item.badge ? (
                <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <ExcelLeadUploadModal />
      <AddEmployeeModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />
      <EmployeeRecordModal employee={openEmployee} onClose={() => setOpenEmployee(null)} />
      <CreateTeamModal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
      <ManageTeamMembersModal
        team={managingSquad}
        isOpen={!!managingSquad}
        onClose={() => setManagingSquad(null)}
      />
    </div>
  );
};
