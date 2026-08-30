# Prompt to paste into Antigravity

Copy everything below the line.

---

## Context — read this before writing any code

You previously built the UI for this Team Management app from a 26-section scope
document. The result was not usable. Be direct with yourself about why, because I
do not want it repeated:

- You built a screen for almost every line in the document — around 30 screens —
  with no indication of which mattered.
- Many screens **look** finished but do nothing. Buttons show a success message
  and save nothing. "Download PDF" downloads no file.
- Numbers were invented. The dashboard showed "96 employees", "92% attendance",
  "1,420 sessions", "99.98% uptime" — none measured, all typed in.
- Fake records were baked in as defaults, so clicking Save wrote invented people
  and leads into the database.
- Screens displayed labels that implied working features. "Geo-tagged" appeared
  next to employees when the app had never once requested a location.
- The result: **I could not tell a real feature from a picture of one.** I could
  not test, and I could not judge progress.

Since then the Admin panel has been rebuilt properly. It now works end to end
against a real database. **Use it as the reference standard for everything you
build next.** Read these files first:

- `src/views/desktop/DesktopAdminView.tsx` — the desktop panel
- `src/views/AdminDashboardView.tsx` — the mobile panel
- `src/components/modals/EmployeeRecordModal.tsx` — a record with tabs
- `ROLES-SPEC.md` — the specification for the work below
- `ADMIN-SPEC.md` — how Admin was specified before it was built

## What already exists and works — do not rebuild it

- **Backend:** Express + SQLite in `server/`, on port 5001. Start everything with
  `npm run dev:all`. Frontend on 5173, `/api` is proxied.
- **Database:** 20 tables. Migrations live in `server/db/schema.ts` — add columns
  through `addColumnIfMissing` so existing data survives.
- **Data loading:** screens declare what they need in `src/data/resources.ts` and
  call `useScreenData('screenName')`. Nothing loads until a screen asks for it.
  The login page makes zero API calls. Keep it that way.
- **Admin panel:** complete. Six screens, mobile and desktop.
- **Attendance:** check-in and check-out capture a real camera photo and a real
  GPS position, compared against a configurable office location.

## Your task

Build three panels to the same standard, specified in `ROLES-SPEC.md`:

| Panel | Screens |
|---|---|
| Telecaller | 5 — Home, My Calls, My Leads, Attendance & Leave, Me |
| Team Leader | 6 — Overview, My Team, Attendance, Approvals, Tasks & Meetings, Reports |
| HR | 7 — Overview, Employees, Attendance, Payroll, Hiring & Exits, Approvals, Reports |

Build them **one panel at a time**, starting with Telecaller. Stop after each and
let me look at it. Do not build all three and present them together.

## Rules — these are not negotiable

1. **Every number must come from the database.** If you cannot derive it from a
   real record, do not display it. No placeholder figures, ever.

2. **No screen that pretends.** A button either does the thing or is not there. A
   success message that saves nothing is worse than an unfinished feature,
   because it hides what is missing.

3. **Everything must survive a refresh.** My test for whether a feature is real
   is: do the thing, refresh the page, is it still there? Build so that passes.

4. **No seeded fake records.** Forms open empty. Never pre-fill a form with an
   invented person, lead or company that could be saved by accident.

5. **Empty lists get an empty state**, not a blank box. Say "No calls logged yet",
   not nothing.

6. **Never dereference an array without checking it is there.** Lists start empty
   and fill in from the API, so `clients[0].name` crashes the whole screen. There
   is a test for this: `npm run test:screens` renders every screen with no data.
   It must pass.

7. **Confidentiality is enforced on the server, not the screen.** Check-in photos
   and locations are Admin-only. Hiding them in the browser still sends them.
   `server/routes/attendance.ts` shows the pattern — copy it.

8. **Mobile and desktop must both work.** This is becoming a mobile app. Every
   feature works on a phone. Do not degrade the desktop layout to achieve it —
   they are separate layouts sharing the same components and data.

9. **Screen count is a hard limit.** 5, 6 and 7 as listed. If something does not
   fit, tell me and I will decide. Do not add a "More" tab to absorb leftovers —
   that is how the original mess happened.

## The test each screen must pass

Before you add anything, ask:

> **If someone opens this on Monday morning, will they do something differently?**

"Present today: 4 of 6" passes — they will chase the two missing people.
"System uptime: 99.98%" fails — nobody acts on it.

If it fails that test, leave it out.

## How to report back

When a panel is done, tell me plainly:

- What works and how you verified it — query the database, do not trust the screen
- What you did **not** build and why
- Anything you found broken in the existing code

Do not tell me something works because it renders. Show me the record in the
database.

## What I do not want

Do not restructure the Admin panel. Do not add screens I did not ask for. Do not
introduce a new UI library or state management. Do not add a login system — that
is separate work, planned already. Do not touch `server/db/schema.ts` except to
add a column via the existing migration helper.

If a requirement is unclear, ask me one direct question. Do not guess and build.
