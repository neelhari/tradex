# Admin panel: the keep / remove list

Nothing here is about whether something works. This is only about whether your
business needs it.

---

## Part 1 — What those confusing words actually mean

### "Export CSV"

A CSV is a spreadsheet file. It opens in Excel or Google Sheets.

So "Export CSV" just means: **download this list as an Excel file.**

Press it on the employee list, you get a spreadsheet of your employees. Press it
on attendance, you get a spreadsheet of attendance.

**Is it useful? Yes. Keep it.** You will want it for payroll, for your accountant,
and for anyone who wants figures without logging in. It is one of the genuinely
useful things in the panel.

One change: call it **"Download to Excel"**. Nobody outside software knows what
CSV means.

---

### "Role Permissions Matrix" / "Role Management"

This page is meant to control **who is allowed to see what**.

For example: a Telecaller may see their own salary slip but not anyone else's. A
Team Leader may approve leave but not change salaries. Admin may see everything.

**Is the idea important? Yes — it is essential.**
**Do you need a screen for it? No. Remove the screen.**

Here is why. A settings screen for permissions is only worth building if you plan
to **invent new roles later** — a "Senior Telecaller", a "Regional Manager" — and
want to decide their permissions yourself without a developer.

You have four roles: Employee, Team Leader, HR, Admin. They are fixed. Your scope
document lists them and does not suggest more.

So the rules should simply be built in and always enforced. A screen that lets you
edit them adds a way to break your own security by accident, and gives you nothing.

**Remove the page. Keep the rules invisible and permanent.**

---

### "System Audit" / "System Audit Reports"

An audit log is a permanent record of **who did what, and when**. Like:

> "Admin deactivated Ramesh at 3:14pm on 12 June"
> "HR approved a ₹45,000 payment at 11:02am on 3 July"

You cannot edit it. It is there to protect you when someone disputes something —
a payment, a dismissal, a changed salary.

**Is it useful? Eventually yes, for money and HR decisions. Not now.**

The page currently called "System Audit Reports" is not an audit log at all. It is
a button that downloads the employee list to Excel, with an official-sounding name.

**Remove the page.** Add real activity logging later, when you are handling real
money and real staff. It is a background feature, not a screen you visit.

---

## Part 2 — Everything in Admin today: keep or remove

| # | Item now in Admin | Verdict | Why |
|---|---|---|---|
| 1 | Total Users | **Keep** | Rename to "Employees" |
| 2 | Active Users | **Keep** | Rename to "Present today" |
| 3 | Teams (count) | **Keep** | Move inside People |
| 4 | Roles: 4 | **Remove** | Tells you nothing. It is how many job titles exist |
| 5 | Total System Logins | **Remove** | Not a business number. Nobody acts on it |
| 6 | System Uptime | **Remove** | A hosting statistic, not your concern |
| 7 | Employee list | **Keep** | This is the heart of Admin |
| 8 | Onboard New Employee | **Keep** | Core |
| 9 | Squad / Teams list | **Merge** | Fold into People |
| 10 | Assign Team Leader | **Merge** | Fold into People |
| 11 | Export CSV | **Keep** | Rename "Download to Excel" |
| 12 | System Audit Reports | **Remove** | See above |
| 13 | Role Permissions Matrix | **Remove** | See above |
| 14 | Global System Settings | **Remove** | Nothing in it is a real setting |
| 15 | Excel Lead Import | **Keep & promote** | Give it its own menu item |
| 16 | Recent Lead Allocations | **Keep** | Part of Lead Allocation |

**Removing: 5 items. Keeping: 9. Merging: 2.**

You lose one whole tab and half the home screen, and nothing your business
depends on.

---

## Part 3 — What must be added

| Item | Why you need it |
|---|---|
| **Present today / calls made today** | Real activity numbers, replacing the two invented ones |
| **Edit an employee** | Phone numbers, salaries and titles change. Today you can only create |
| **Deactivate an employee** | People leave. You need to switch off their access |
| **Click a person → their record** | Their attendance, calls, targets in one place. This is your "see everything about employees" |
| **Attendance Report** | Daily register: photo, name, check-in, location, check-out |
| **Approvals** | Final payment sign-off. Your document gives Admin the last word on money |

---

## Part 4 — The final Admin menu

Six items.

**1. Overview**
Employees · Present today · Calls today · Sales vs target · Waiting for approval

**2. People**
The employee list. Add, edit, deactivate. Assign to a team or Team Leader.
Click anyone to open their full record.

**3. Attendance Report**
One row per employee per day: check-in photo, name, time in, location, time out.

**4. Lead Allocation**
Upload a lead list, assign it to a telecaller, see who holds what.

**5. Approvals**
Payments needing your final sign-off, and anything escalated to you.

**6. Reports**
Download to Excel: attendance, calls, sales, payments.

---

## Part 5 — Simple test for anything added later

Before any new screen goes into Admin, ask:

> **"If I look at this on Monday morning, will I do something differently?"**

If yes, it belongs. If it is only interesting to look at, it does not.

"Present today: 4 of 6" passes — you will chase the two missing people.
"System Uptime: 99.98%" fails — you would never act on it.
