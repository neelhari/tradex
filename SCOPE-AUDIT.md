# What actually got built

Your Scope of Work lists 26 sections. This maps every module in it against what
the application really does, so you can test against something instead of guessing.

Verified on 30 August 2026 against the running app **and** by querying the SQLite
database directly — "Works" means I confirmed the data in the database, not that
the screen looked right.

**Of the 24 functional modules: 14 really work, 6 look finished but aren't, 4 were never built.**

---

## Read this first: there is no login and no access control

Your document calls role-based access control "a core part of the project" (§18)
and gives security its own section (§23). **Neither exists.**

Today the app lets you pick a role from a dropdown *before* logging in, accepts
any password, and every API endpoint answers anyone who asks.

> Anyone who can open the app can read and change payslips, employee documents,
> and payment approvals — the exact data §18 says must be restricted.

This blocks everything else. Every permission rule in your document is
unenforceable until there is a real login, so no testing you do now can tell you
whether access control works. Build this before adding any new feature.

---

## Coverage map

Section numbers match your scope document, so you can read them side by side.

| §     | Module                     | Status  | What that means |
|-------|----------------------------|---------|-----------------|
| 2, 20 | Roles & dashboards         | Works   | All four dashboards exist, mobile and desktop. |
| 3     | Attendance                 | Works   | Calendar and history read real records. Check-in/out saves. |
| 3     | Face recognition (login)   | MISSING | The scanner is an animation on a timer. No camera, no matching, no liveness check. It always "succeeds". |
| 3     | Face enrolment (HR)        | Works   | This one does open a real camera and store the photo. |
| 4     | Daily calling / activity   | Works   | Call logging saves and updates the counters. |
| 5     | Sales & targets (TGT)      | Works   | Targets and achievement are real. |
| 5     | Collections                | Shell   | Shown as 85% of sales — a made-up formula, not entered data. No collection entry screen exists. |
| 6     | Leave management           | Works   | Submit, approve, reject all save. Balance deducts. |
| 7     | Performance analysis       | Shell   | Counters and averages only. No trend or period comparison. |
| 8     | Payment verification       | Works   | Approve/reject saves. No audit trail of who changed what. |
| 9     | Payslip generation         | Works   | Generates and lists. Amounts are fixed, not per-employee. |
| 9     | Payslip PDF download       | Shell   | The button shows a success message and downloads nothing. |
| 10    | ID card                    | Works   | Card renders from real employee data. |
| 10    | ID card PDF export         | Shell   | Same as payslips — message only, no file. |
| 11    | Documents & reports        | Shell   | Reports export as CSV. No document repository — you cannot upload or store an employee's certificates or contracts. |
| 12    | Onboarding & exit          | Works   | Checklists save and drive status. |
| 13    | Recruitment & interviews   | Works   | Schedule and status changes save. |
| 14    | Client management          | Works   | Leads, follow-ups and CSV lead import all save. |
| 15    | Team groups                | Works   | Create and assign works. |
| 16    | Events & tasks             | Works   | Create and status cycling save. No due-date reminders. |
| 17    | Meetings                   | Works   | Scheduling saves. No RSVP or invitations. |
| 18    | Role-based access control  | MISSING | Nothing enforces permissions, anywhere. |
| 19    | User management            | Shell   | Creating a user works. Editing, deactivating and changing roles do not exist. |
| 21    | Notifications & alerts     | MISSING | Only pop-up messages after your own clicks. Nothing reaches another user, and no email/SMS. |
| 22    | Reports & analytics        | Works   | CSV export per role. No filtering or date ranges. |
| 23    | Security & audit           | MISSING | No password check, no sessions, no audit log. |
| 24    | Admin configuration        | Shell   | Settings screens open but do not save anything. |

**Works** = saves real data · **Shell** = screen exists, action is fake · **MISSING** = not built

---

## How to test without knowing the code

You do not need to understand the screens. You need one rule:

> **Do a thing, refresh the page, see if it is still there.**
> Survives a refresh = real. Vanishes = decoration.

Six steps, in this order:

1. **Start both halves.** Run `npm run dev:all`, open `localhost:5173`.
   You need the API running too, not just the app — that command starts both.

2. **Pick a role, then log in with anything.** Any email and password is accepted.
   That this works at all is the §18 problem in one action. Note it, then carry on.

3. **As Telecaller, log a call.** Use "Quick Log Call", pick a lead, save, refresh.
   The call should still be listed and the dial counter one higher. This is your
   reference for what "real" feels like.

4. **Apply for leave, then switch to Team Leader and approve it.**
   The approval should show on both sides. This is the one workflow that crosses
   roles end to end.

5. **As Admin, add a user.** Then look for a way to edit or deactivate them.
   There isn't one. That's §19, and it is the gap you will hit fastest in real use.

6. **Press every Download and Export button.**
   CSV exports produce a file. PDF buttons produce a message and nothing else —
   that is the difference between Works and Shell.

---

## Decisions only you can make

- **Authentication and RBAC first.** Everything else is unverifiable until a user
  is a real user. This is one focused piece of work, not a rewrite.

- **Decide if face recognition is real or theatre.** Genuine face matching with
  liveness detection is a substantial project of its own, and your document
  already flags the hardware question. If it is a demo feature, say so now and
  stop paying for it.

- **Pick the shells that actually matter.** PDF payslips and ID cards are probably
  real requirements; admin configuration screens may not be. Six shells is a short
  list — go through it and mark keep or drop.

- **Treat this file as your checklist.** Work down the table, try each module, and
  correct my status where you disagree. You will understand the app better from
  ten minutes of that than from reading any code.
