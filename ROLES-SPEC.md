# Team Leader, HR and Telecaller — the specification

Companion to `ADMIN-SPEC.md`. Same six-item discipline: if a screen does not help
that person do their job, it does not belong to them.

---

## First: the attendance confidentiality rule

You decided that attendance is shared, but the photo and location are not.

**Everyone in authority sees attendance. Only Admin sees the photo and the location.**

| Attendance field | Telecaller (own) | Team Leader | HR | Admin |
|---|---|---|---|---|
| Name | ✅ | ✅ | ✅ | ✅ |
| Check-in time | ✅ | ✅ | ✅ | ✅ |
| Check-out time | ✅ | ✅ | ✅ | ✅ |
| Hours worked | ✅ | ✅ | ✅ | ✅ |
| Present / absent / leave | ✅ | ✅ | ✅ | ✅ |
| **Check-in photo** | own only | ❌ | ❌ | ✅ |
| **Location** | own only | ❌ | ❌ | ✅ |

Two things to note.

**Team Leaders see only their own team.** HR and Admin see everyone. That is the
difference between their versions of the same screen.

**This must be enforced on the server, not just hidden on screen.** Hiding a photo
by not drawing it still sends it to the browser, where it can be retrieved.
Confidential means the photo and location are never sent to anyone but Admin. Say
this explicitly to whoever builds it — it is the single easiest thing to get
wrong, and it looks correct when it isn't.

### One clarification needed

You mentioned HR, Team Leader **and Manager** as separate authorities. Your scope
document treats Manager and Admin as one level — "Level 4 – Manager / Admin". So
in the app today, Manager *is* Admin.

**Question:** do you want a fifth, separate Manager role that sits between HR and
Admin? If yes, it needs its own permissions. If Manager is just your word for
Admin, nothing changes.

---

## Team Leader — 6 screens

**Their job:** keep their own team working and clear their team's requests.
**They see:** only their own team. Never other teams, never salaries.

**1. Overview**
Team present today (4 of 6) · calls made by the team today · team sales vs target ·
requests waiting for me · leads unassigned in my team.
Below: who has not checked in, who has made no calls today.

**2. My Team**
The roster, their team only. Each row: name, today's calls, connected,
interested, sales vs target, attendance status.
Click a person → their details, attendance (**times only**), work, assigned leads.
No salary, no documents.

**3. Attendance**
Their team's daily register: name, check-in, check-out, hours, status.
**No photo column, no location column.**

**4. Approvals**
Leave requests from their team. Approve or reject with a reason.
Anything they cannot decide goes up to HR.

**5. Tasks & Meetings**
Create and assign tasks to team members. Schedule team meetings. See what is
overdue.

**6. Reports**
Download their team's attendance, calls and sales to Excel.

**Removed from the current Team Leader panel:** the "more" tab of loose buttons,
duplicate stat cards, and the invented averages.

---

## HR — 7 screens

HR genuinely has more ground to cover than a Team Leader, so it gets one extra.

**Their job:** the people side of the whole company — records, pay, hiring, exits.
**They see:** every employee. Not the check-in photo or location.

**1. Overview**
Headcount · present today · on leave · pending approvals · open positions ·
joiners and leavers this month.

**2. Employees**
Every employee, all teams. Click a person → details, attendance (**times only**),
documents, payslips, ID card. Add, edit, deactivate.

**3. Attendance**
Company-wide daily register: name, team, check-in, check-out, hours, status.
**No photo, no location.**

**4. Payroll**
Generate monthly payslips, individually or in bulk. Issue ID cards. See payslip
history.

**5. Hiring & Exits**
Candidates and interview scheduling · onboarding checklists for joiners · exit
clearance for leavers. The full lifecycle in one place.

**6. Approvals**
Leave escalated from Team Leaders · payment verification.
**HR verifies a payment; Admin gives final sign-off.** Two stages, deliberately.

**7. Reports**
Attendance, payroll, headcount, hiring and exit reports to Excel.

**Removed from the current HR panel:** the "more" tab, the invented org figures
(96 employees, 92% attendance), and the fake ID-card preview.

---

## Telecaller — 5 screens

This is the phone app most of your staff use all day, so it gets the fewest
items. Five is the practical limit for a bottom bar.

**Their job:** call the leads they were given and record what happened.
**They see:** only their own work. Nothing about anyone else.

**1. Home**
Today's goal ring (68 of 100 calls) · connected · interested · sales vs monthly
target · the next lead due for a callback, with a Call button.

**2. My Calls**
Log a call — the single most-used action in the whole app. Their call history,
searchable, filterable by outcome.

**3. My Leads**
The leads Admin assigned them. Due today · hot · pending · converted.
Tap a lead to call, log the outcome, or set a follow-up date.

**4. Attendance & Leave**
Check in and out with their face. Their own attendance calendar. Apply for leave
and see its status. **They see their own photo and location** — it is their data.

**5. Me**
Profile · payslips · ID card · own documents · tasks and meetings assigned to
them.

**Removed from the current Telecaller panel:** the "All Modules" grid — it is a
menu of menus that duplicates the bottom bar and adds nothing.

---

## The whole system on one page

| | Telecaller | Team Leader | HR | Admin |
|---|---|---|---|---|
| Screens | 5 | 6 | 7 | 6 |
| Sees | own work | own team | all employees | everything |
| Attendance times | own | team | all | all |
| **Photo & location** | **own only** | ❌ | ❌ | **✅** |
| Salaries / payslips | own | ❌ | all | all |
| Approve leave | ❌ | own team | escalations | ❌ |
| Verify payment | ❌ | ❌ | verify | final sign-off |
| Assign leads | ❌ | within team | ❌ | ✅ |
| Add / remove staff | ❌ | ❌ | ✅ | ✅ |

Read down a column to see one person's world. Read across a row to see who can do
what.

---

## What is now decided

- Admin: 6 screens, specified in `ADMIN-SPEC.md`
- Team Leader: 6 screens
- HR: 7 screens
- Telecaller: 5 screens
- Attendance is shared; photo and location are Admin-only, enforced on the server
- Payments are two-stage: HR verifies, Admin approves

## Still open

1. Is "Manager" a fifth role, or another word for Admin?
2. Location refused — block check-in, or allow and flag? *(suggested: allow and flag)*
3. Office address and radius? *(suggested: 200 metres)*
4. Map pin or tag only? *(suggested: tag only to start)*
5. Anything in the four role lists you want moved, added or dropped?
