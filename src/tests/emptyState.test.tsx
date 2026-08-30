/**
 * Renders every screen with no data loaded — the state on first paint, before
 * useScreenData()'s fetch resolves, and the state for an account with no
 * records yet. useEffect does not run under renderToString, so every context
 * array stays empty.
 *
 * Guards against the "white screen" class of bug: a screen that dereferences
 * clients[0], teamMembers[0], etc. without checking for undefined.
 *
 * Run with: npm run test:screens
 */
// Renders each screen with NO data loaded — the exact first-render condition
// that produced the white screen. useEffect does not run during SSR, so every
// context array stays [].
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => { store.set(k, String(v)); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => store.clear(),
};

import React from 'react';
import { renderToString } from 'react-dom/server';
import { AppProvider } from '../context/AppContext';

import { TelecallerHomeView } from '../views/TelecallerHomeView';
import { DailyCallingView } from '../views/DailyCallingView';
import { ClientsPipelineView } from '../views/ClientsPipelineView';
import { AttendanceLeavesView } from '../views/AttendanceLeavesView';
import { ProfileSelfServiceView } from '../views/ProfileSelfServiceView';
import { AllModulesMenuView } from '../views/AllModulesMenuView';
import { TeamLeaderDashboardView } from '../views/TeamLeaderDashboardView';
import { HrDashboardView } from '../views/HrDashboardView';
import { AdminDashboardView } from '../views/AdminDashboardView';
import { DesktopTelecallerHome } from '../views/desktop/DesktopTelecallerHome';
import { DesktopDailyCalling } from '../views/desktop/DesktopDailyCalling';
import { DesktopClientsPipeline } from '../views/desktop/DesktopClientsPipeline';
import { DesktopAttendanceLeaves } from '../views/desktop/DesktopAttendanceLeaves';
import { DesktopProfile } from '../views/desktop/DesktopProfile';
import { DesktopTeamLeaderView } from '../views/desktop/DesktopTeamLeaderView';
import { DesktopHrView } from '../views/desktop/DesktopHrView';
import { DesktopAdminView } from '../views/desktop/DesktopAdminView';

const screens: Array<[string, React.FC<any>]> = [
  ['TelecallerHomeView', TelecallerHomeView],
  ['DailyCallingView', DailyCallingView],
  ['ClientsPipelineView', ClientsPipelineView],
  ['AttendanceLeavesView', AttendanceLeavesView],
  ['ProfileSelfServiceView', ProfileSelfServiceView],
  ['AllModulesMenuView', AllModulesMenuView],
  ['TeamLeaderDashboardView', TeamLeaderDashboardView],
  ['HrDashboardView', HrDashboardView],
  ['AdminDashboardView', AdminDashboardView],
  ['DesktopTelecallerHome', DesktopTelecallerHome],
  ['DesktopDailyCalling', DesktopDailyCalling],
  ['DesktopClientsPipeline', DesktopClientsPipeline],
  ['DesktopAttendanceLeaves', DesktopAttendanceLeaves],
  ['DesktopProfile', DesktopProfile],
  ['DesktopTeamLeaderView', DesktopTeamLeaderView],
  ['DesktopHrView', DesktopHrView],
  ['DesktopAdminView', DesktopAdminView],
];

let failures = 0;
for (const [name, Screen] of screens) {
  try {
    renderToString(<AppProvider><Screen /></AppProvider>);
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failures++;
    console.log(`  CRASH ${name}: ${(err as Error).message}`);
  }
}
console.log(failures ? `\n${failures} screen(s) crash with empty data.` : '\nAll screens render with empty data.');
