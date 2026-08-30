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
} from 'lucide-react';
import { ExcelLeadUploadModal } from '../components/modals/ExcelLeadUploadModal';
import { AddEmployeeModal } from '../components/modals/AddEmployeeModal';
import { EmployeeRecordModal, PORTAL_LABEL } from '../components/modals/EmployeeRecordModal';
import { CreateTeamModal } from '../components/modals/CreateTeamModal';
import { OfficeSettings, TeamMember, UserRole } from '../types';
import { api } from '../services/api';

type AdminTab = 'home' | 'people' | 'attendance' | 'leads' | 'approvals';

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
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [openEmployee, setOpenEmployee] = useState<TeamMember | null>(null);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
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
    const q = searchQuery.trim().toLowerCase();
    return (
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.empCode.toLowerCase().includes(q) ||
      (m.role ?? '').toLowerCase().includes(q) ||
      (m.group ?? '').toLowerCase().includes(q)
    );
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

  const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
      <span className="text-[10px] font-bold text-slate-500 leading-tight block">{label}</span>
      <span className="font-display font-black text-xl text-[#0A2540] block leading-tight mt-0.5">{value}</span>
      {sub && <span className="text-[10px] text-slate-400 font-semibold block">{sub}</span>}
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
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2, badge: pendingPayments.length },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between max-w-lg mx-auto font-sans pb-24">
      <main className="flex-1 p-3.5 space-y-4 pt-3">

        {/* ---------------------------------------------------- Overview */}
        {tab === 'home' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">Overview</h2>
              <p className="text-xs text-slate-500 font-medium">Where the company stands today.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Stat label="Employees" value={String(headcount)} />
              <Stat label="Present today" value={`${presentToday}/${headcount}`} />
              <Stat label="Calls today" value={String(callsToday)} />
              <Stat
                label="Sales this month"
                value={inr(salesAchieved)}
                sub={`of ${inr(salesTarget)}`}
              />
              <Stat label="Awaiting approval" value={String(pendingPayments.length)} />
              <Stat label="Leads due today" value={String(leadsDueToday.length)} />
            </div>

            <SectionTitle>Needs your attention</SectionTitle>
            {!pendingPayments.length && !awayWithoutLeave.length && !idleToday.length ? (
              <Empty text="Nothing outstanding right now." />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {pendingPayments.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTab('approvals')}
                    className="w-full text-left p-3 flex items-center justify-between gap-2 active:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block truncate">
                        {inr(p.dealAmount)} from {p.companyName}
                      </span>
                      <span className="text-[10px] text-slate-500">Awaiting your approval</span>
                    </div>
                    <Wallet className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  </button>
                ))}
                {awayWithoutLeave.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block">{m.name} is absent</span>
                      <span className="text-[10px] text-slate-500">No approved leave</span>
                    </div>
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  </div>
                ))}
                {idleToday.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block">{m.name}: no calls yet</span>
                      <span className="text-[10px] text-slate-500">In at {m.checkInTime || '—'}</span>
                    </div>
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            <SectionTitle>Download reports</SectionTitle>
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
                  triggerToast('✓ Employees downloaded');
                }}
                className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-[#00A88B]" />
                <span className="text-xs font-bold text-[#0A2540]">Employees</span>
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
                  triggerToast('✓ Attendance downloaded');
                }}
                className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-[#00A88B]" />
                <span className="text-xs font-bold text-[#0A2540]">Attendance</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------ People */}
        {tab === 'people' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display font-black text-2xl text-[#0A2540] tracking-tight">People</h2>
                <p className="text-xs text-slate-500 font-medium">{headcount} employees</p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#00C9A7] text-[#0A2540] font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#00C9A7]/25 active:scale-95 transition-all flex-shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-2.5">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code or team"
                className="bg-transparent text-xs text-slate-800 focus:outline-none w-full font-medium"
              />
            </div>

            {!filteredPeople.length ? (
              <Empty text={headcount ? 'Nobody matches that search.' : 'No employees yet. Tap Add to begin.'} />
            ) : (
              <div className="space-y-2">
                {filteredPeople.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setOpenEmployee(m)}
                    className="w-full text-left bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3 active:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#0A2540] text-[#00C9A7] flex items-center justify-center font-black text-[10px] flex-shrink-0">
                      {m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block truncate flex items-center gap-1.5">
                        {m.name}
                        {m.active === 0 && (
                          <span className="text-[8px] font-black px-1 py-0.5 rounded bg-slate-200 text-slate-600 uppercase">
                            Inactive
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {PORTAL_LABEL[(m.portal as UserRole) ?? 'telecaller']} · {m.group}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono-nums font-black text-sm text-[#0A2540] block">
                        {m.dialsToday || 0}
                      </span>
                      {statusChip(m.attendanceStatus)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <SectionTitle>Teams</SectionTitle>
              <button
                onClick={() => setIsCreateTeamOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#00A88B] active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create team</span>
              </button>
            </div>
            {!teamGroups.length ? (
              <Empty text="No teams yet." />
            ) : (
              <div className="space-y-2">
                {teamGroups.map((g) => (
                  <div key={g.id} className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#0A2540] block truncate">{g.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {teamMembers.filter((m) => m.group === g.name).length} members · target {inr(g.monthlyTarget)}
                        </span>
                      </div>
                    </div>
                    <select
                      value={g.leaderName || ''}
                      onChange={(e) => assignTeamLeaderToGroup(g.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
                    >
                      <option value="">— Assign a Team Leader —</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
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
                  <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center gap-3">
                    {rec?.checkInPhoto ? (
                      <img
                        src={rec.checkInPhoto}
                        alt={`${m.name} at check-in`}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-[#0A2540] block truncate">{m.name}</span>
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
                <option value="">From — choose telecaller</option>
                {teamMembers
                  .filter((m) => assignedLeads.some((l) => l.assignedToEmployeeId === m.id))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({assignedLeads.filter((l) => l.assignedToEmployeeId === m.id).length})
                    </option>
                  ))}
              </select>
              <select
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00C9A7]"
              >
                <option value="">To — choose telecaller</option>
                {teamMembers
                  .filter((m) => m.id !== moveFrom && m.active !== 0)
                  .map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
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

        {/* --------------------------------------------------- Approvals */}
        {tab === 'approvals' && (
          <div className="space-y-3 animate-in fade-in duration-150">
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
                        Closed by {p.telecallerName} · {p.paymentMode}
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
                        <span className="text-[10px] text-slate-500">{p.telecallerName}</span>
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
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-slate-200 flex justify-around py-1.5 z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-[#00A88B]' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold">{item.label}</span>
              {item.badge ? (
                <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
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
    </div>
  );
};
