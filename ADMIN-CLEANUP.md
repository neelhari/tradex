# Admin panel: what to cut, what to keep, what's missing

Plain English. No technical knowledge needed.

---

## Part 1 — What is in the Admin panel today

Admin currently has five tabs: **Home, Users, Teams, Reports, More.**

Here is every item in them, and whether it does anything.

### Home
| Item | Real? |
|---|---|
| Total Users | Real — counts your actual employees |
| Active Users | Real — counts who is marked present |
| Teams | Real — counts your actual teams |
| Roles: 4 | Just the number of role types. True, but tells you nothing |
| **Total System Logins: 1,420 Sessions** | **Invented.** Nobody counted anything |
| **System Uptime: 99.98%** | **Invented.** Nothing is measured |

### Users
| Item | Real? |
|---|---|
| Employee list | Real |
| Onboard New Employee | Real — saves properly |

### Teams
| Item | Real? |
|---|---|
| Squad list | Real |
| Assign Team Leader | Real — saves properly |

### Reports
| Item | Real? |
|---|---|
| Export Audit CSV | Real — produces an actual spreadsheet |

### More
| Item | Real? |
|---|---|
| **Role Permissions Matrix** | **Fixed text.** Cannot be edited. Changes nothing |
| **Global System Settings** | **Three coloured labels.** No switches exist |

About that last one. It displays:

- "Enforce Biometric Liveness Check — ENABLED"
- "Auto-Generate Payslips on 1st of Month — ENABLED"
- "2-Factor Authentication for Admin — REQUIRED"

There are no switches. You cannot turn them on or off. And the first one is
**false** — there is no liveness check in the app at all. It is a label that says
a safety feature is on when it isn't.

---

## Part 2 — Cut list

Remove these six. They are the reason the panel is hard to read.

1. **Total System Logins (1,420)** — invented number
2. **System Uptime (99.98%)** — invented number
3. **Role Permissions Matrix** — text that changes nothing
4. **Global System Settings** — fake switches, one of them untrue
5. **Teams as its own tab** — it is three items, it belongs inside People
6. **"Roles: 4" card** — not information, just how many role types exist

That removes an entire tab and half the Home screen, and you lose nothing real.

---

## Part 3 — What is missing that must be there

From your own words, plus what your scope document promises Admin.

| # | Requirement | Where it came from | Status |
|---|---|---|---|
| 1 | Create / onboard an employee | You + §19 | **Exists** |
| 2 | **Edit and deactivate an employee** | You ("everything about employees") + §19 | **Missing** |
| 3 | Assign leads/calls to an employee | You + §14 | **Exists** |
| 4 | Employee sees their allocated leads | You + §14 | **Exists** |
| 5 | **Click an employee → see their day** (calls made, attendance, targets) | You + §2 Level 4 | **Missing** |
| 6 | **Company-wide Attendance Report** with photo, name, in, location, out | You + §22 | **Missing** |
| 7 | **Photo + location captured at daily check-in** | You + §3 | **Missing** |
| 8 | Assign employees to teams / assign Team Leaders | §19 | **Exists** |
| 9 | Organisation-wide reports | §22 | **Exists** (CSV) |
| 10 | **Final payment approval** | §2 Level 4, §8 | **Missing from Admin** |
| 11 | **Onboarding / exit / recruitment overview** | §2 Level 4 | **Missing from Admin** |

### Worth noticing

Items 10 and 11 are a real problem. Your document says Admin has *complete*
access — the top of the hierarchy. But right now **Admin can see less than HR
can.** Payments, onboarding and interviews exist only in the HR panel. Admin
cannot see them at all.

You said "admin needs to see everything and everyone." Your document agrees.
The app does not currently do that.

---

## Part 4 — The photo and location requirement

You want: when an employee checks in with their face, their **location** is
captured too, so you can confirm they are at the office.

Here is what that actually involves, in practice.

**What the employee experiences**

1. They open the app and tap check in
2. The phone asks permission to use the camera → photo taken
3. The phone asks permission to use location → position captured
4. Photo, position and time are saved together

**What Admin sees** — one row per person per day: photo, name, check-in time,
location, check-out time.

**Three decisions only you can make**

1. **What if they refuse permission?** The phone always asks, and the employee can
   say no. Does check-in fail, or is it recorded as "location refused" for you to
   review? You must pick one.

2. **Where is the office?** To say "they are at the office", the app must know
   where the office is. Someone has to enter the office address once, and you
   decide how far away is too far — 100 metres? 500?

3. **Do you show a map or just a result?** Cheaper: a green "At office" or red
   "Away from office" tag. More work: an actual map pin per employee.

**Be aware:** location can be faked by a determined person using phone software.
It stops honest mistakes and casual cheating, not deliberate fraud. Worth knowing
before you rely on it.

---

## Part 5 — The clean Admin panel

Six menu items. Nothing else.

**1. Overview**
Real numbers only: total staff, present today, calls made today, sales against
target, and anything waiting for your approval.
*Cuts the two invented metrics.*

**2. People**
Everyone in one list. Add someone. Edit someone. Deactivate someone. Assign them
to a team or a Team Leader. **Click any person to open their record** — their
details, attendance, calls, targets and documents.
*Absorbs the Teams tab. Fixes missing items 2 and 5.*

**3. Attendance Report** — *new*
The daily register. One row per employee: check-in photo, name, check-in time,
location, check-out time. Updates through the day.
*Fixes missing items 6 and 7. This is your biggest new piece of work.*

**4. Lead Allocation**
Upload a lead list, assign it to a telecaller, and see who is holding what.
*Mostly built. Just needs to be a menu item instead of a button.*

**5. Approvals**
Final payment verification, and anything escalated from HR or Team Leaders.
*Fixes missing item 10.*

**6. Reports**
Export attendance, calls, sales and payments to a spreadsheet.
*Already works.*

---

## Part 6 — Order of work

1. **Real login first.** Everything you described is "Admin only", and that phrase
   has no meaning until the app knows who is an Admin. Today anyone picks a role
   from a dropdown and types any password.
2. **Cut the six dead items.** Fastest way to make the panel readable.
3. **Finish People** — edit, deactivate, and click-through to one person.
4. **Build the Attendance Report**, with photo and location capture.
5. **Give Admin the approvals and overviews** it is missing.
