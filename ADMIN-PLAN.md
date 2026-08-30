# The Admin panel, in plain English

A working note for deciding what Admin should be. No technical knowledge needed.

---

## Why you're confused (it isn't you)

The AI was told "build the UI" from a 26-section document. So it built a screen
for almost every line in that document — roughly 30 screens. Nobody marked which
ones are important, which are finished, and which are just pictures.

There is a second reason, and it matters more:

> **Some things on screen look like working features but are only words.**

The clearest example: your app shows "Geo-tagged" next to some employees. That
looks like location tracking. It is not. It is the *word* "Geo-tagged" typed into
a box. The app has never once asked for anyone's location. Nothing is being tracked.

That is why staring at the screens doesn't help. You can't tell a real feature
from a printed word by looking.

---

## What Admin is actually for

One sentence:

> **Admin is where you set up who works here, give them work, and check whether
> they did it.**

Everything else is decoration. If a screen doesn't help you do one of those three
things, it doesn't belong in Admin.

That gives you three jobs:

1. **Set up people** — add an employee, change them, remove them
2. **Give out work** — hand leads/calls to a specific employee
3. **Check up** — did they turn up, and what did they do today

---

## Your six points, checked against the app

| # | What you said Admin needs | Does it exist today? |
|---|---------------------------|----------------------|
| 1 | Create / onboard an employee | **Yes.** Works and saves. But you cannot *edit* or *deactivate* someone afterwards — only create. |
| 2 | Assign calls/leads to employees | **Yes — this already exists.** "Import Leads" in Admin. You upload a list, choose a telecaller, and it becomes their calling list. |
| 3 | That allocation shows on the employee's dashboard | **Yes.** The employee sees the leads assigned to them. |
| 4 | Admin sees each employee's working status | **Half.** You see today's numbers per person in a list. You cannot click a person to open their full record. |
| 5 | Daily check-in **photo** and **location**, Admin only | **No. Not built at all.** See below. |
| 6 | An "Attendance Report" in the sidebar, one row per employee, updating live | **No.** Attendance exists for an employee to see their own. There is no company-wide daily register for Admin. |

### Point 5 needs to be very clear

Three separate things, and only one exists:

- **A photo taken once, when an employee is enrolled** — this exists and is real.
  HR opens a camera and saves their face.
- **A photo taken every day at check-in** — does not exist. Nothing is captured daily.
- **Location at check-in** — does not exist. Not partly. Not at all. The app has
  never asked a browser for a location.

So point 5 and point 6 are new work, not fixes. Worth knowing before you ask for
"the report to be fixed" — there is nothing yet to fix.

---

## What your scope document says about this

Your document backs you up on both:

- §3 asks for face-recognition check-in/out, with geo-tagged attendance as a
  fallback. So location *is* in scope.
- §22 asks for "attendance reports, including face recognition logs". That is
  exactly the sidebar report you described.

So you are not inventing new requirements. You are describing things that were
promised and not delivered.

---

## A clean Admin: five menu items

Instead of the current mix, Admin needs five things. Nothing else.

**1. Overview**
The numbers, at a glance: how many staff, how many are in today, how many calls
made today, sales against target. This is the page you open in the morning.

**2. People**
The list of everyone. Add someone. Click a person to open their record — their
details, their attendance, their calls, their targets. This is where point 4 gets
finished: today the list exists, the click-through does not.

**3. Lead Allocation**
Upload a list of leads, choose who gets them, and see who is holding what. Mostly
built already — it just needs to be a proper menu item instead of a button.

**4. Attendance Report** *(new)*
The daily register you described. One row per employee: photo taken at check-in,
name, check-in time, location, check-out time. Updating through the day.

**5. Reports**
Export things to a spreadsheet. Already works.

### What to remove from Admin

These exist now, look official, and do nothing:

- **Roles & Permissions screen** — opens, changes nothing
- **System Settings** — opens, saves nothing
- **"1,420 Sessions" and "99.98% Uptime"** — invented numbers, not measured
- **A separate Teams tab** — belongs inside People

Removing these will make the panel legible faster than adding anything.

---

## The one thing that must be fixed first

Right now anyone can open the app, pick "Admin" from a dropdown, type any
password, and get in. There is no real login.

That matters for your plan specifically: you said check-in photos and location
should be **visible to Admin only**. That sentence has no meaning until the app
knows who is Admin. Access control has to come before "Admin only" anything.

---

## Where to start testing — do only this

Forget the other three roles for now. Test **only Admin**, in this order:

1. Open the app, choose Admin, log in with anything.
2. **Add an employee.** Fill the form, save.
3. **Refresh the page. Are they still in the list?** If yes, that feature is real.
4. Now try to **edit or remove** that person. You cannot. That is gap #1.
5. **Import Leads.** Upload a small list, assign it to a telecaller.
6. Switch to that telecaller and check the leads appeared. That proves point 2 and
   3 work.
7. Look for an **attendance register** for the whole company. There isn't one.
   That is gap #2 — your biggest missing piece.

That is a 20-minute pass, and at the end you will know more about the app than any
amount of reading.

**The rule that replaces technical knowledge:** do a thing, refresh the page, and
see if it is still there. If it survives a refresh it is real. If it vanishes, it
was a picture.

---

## What to decide next

1. Confirm the five Admin menu items above are right — add or cut.
2. Confirm the removals are OK to delete.
3. Decide whether the check-in photo and location are must-have or nice-to-have.
   They are the largest piece of genuinely new work in your list.
4. Agree that login and access control come first, since "Admin only" depends on it.
