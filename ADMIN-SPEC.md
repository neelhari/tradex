# Admin panel — the complete specification

Six screens. This describes exactly what is on each one, what you can do there,
and what still needs deciding.

Hand this to whoever builds it. Nothing here needs technical knowledge to read.

---

## The sidebar

```
┌──────────────────────┐
│  TRADE NEXUS         │
│  Admin               │
├──────────────────────┤
│  Overview            │
│  People              │
│  Attendance Report   │
│  Lead Allocation     │
│  Approvals        ③  │   ← number = items waiting for you
│  Reports             │
├──────────────────────┤
│  Vikram Malhotra     │
│  Log out             │
└──────────────────────┘
```

Six items. If something does not fit in one of these six, it does not belong in
Admin.

---

## 1. Overview

**Purpose:** the screen you open in the morning to see if anything needs you.

**What you see — six cards across the top:**

| Card | Shows | Why it earns its place |
|---|---|---|
| Employees | e.g. 6 | Your headcount |
| Present today | e.g. 4 of 6 | You will chase the missing two |
| Calls made today | e.g. 132 | Is the team working |
| Sales this month | e.g. ₹4.2L of ₹6L | Are you on target |
| Waiting for approval | e.g. 3 | Work only you can clear |
| Leads unassigned | e.g. 40 | Work sitting idle |

**Below the cards — two lists:**

- **Needs your attention** — payments awaiting final sign-off, employees absent
  with no leave request, telecallers with zero calls today. Each row clicks
  through to the right place.
- **Today's activity** — a simple line: who checked in, who logged calls, what was
  assigned. Newest first.

**What you can do:** click anything to go to it. Nothing is edited here.

**Removed from the old version:** Total System Logins, System Uptime, "Roles: 4".

---

## 2. People

**Purpose:** everyone who works here, and everything about each of them.

### 2a. The list

```
┌───────────────────────────────────────────────────────────────┐
│  People                          [ Search ]  [ + Add Employee ]│
│  All (6) · Telecallers (4) · Team Leaders (1) · HR (1)         │
├───────────────────────────────────────────────────────────────┤
│  Name          Code       Role         Team      Today   Status│
│  Arjun Kumar   TNX-8492   Telecaller   HNI       68 calls  ●In │
│  Priya Nair    TNX-8493   Inside Sales HNI       51 calls  ●In │
│  Rahul Varma   TNX-8494   Team Leader  Inbound   —        ●Leave│
└───────────────────────────────────────────────────────────────┘
                                          [ Download to Excel ]
```

**What you can do here**
- Search by name or employee code
- Filter by role
- **Add Employee** — the onboarding form
- Click any row to open that person

### 2b. One person's record

Opens when you click a name. Four tabs:

**Details** — name, code, phone, email, role, team, Team Leader, joining date,
salary, bank details, documents.
Buttons: **Edit** · **Deactivate**

**Attendance** — their month: days present, absent, on leave. Each day shows
check-in time, check-out time, photo and location.

**Work** — calls made today / this week / this month, connected, interested,
deals closed, sales against target, and their assigned leads.

**Documents** — ID card, payslips, offer letter, uploaded certificates.

> This screen is what you meant by "admin needs to see everything about
> employees". Today the list exists but clicking a person does nothing.

### 2c. Teams

A section at the bottom of People, not its own tab.

Lists each team, its Team Leader, how many members and its monthly target.
You can create a team and assign a Team Leader.

---

## 3. Attendance Report — *new*

**Purpose:** proof of who turned up, when, and from where.

```
┌──────────────────────────────────────────────────────────────────┐
│  Attendance Report          [ ◀ 30 Aug 2026 ▶ ]  [ Download ]    │
│  Present 4 · Absent 1 · On leave 1 · Away from office 1          │
├──────────────────────────────────────────────────────────────────┤
│ Photo  Name          In       Location              Out    Hours │
│ [img]  Arjun Kumar   09:12   ✅ At office          18:04   8h52m │
│ [img]  Priya Nair    09:28   ⚠️ 2.4 km away        17:50   8h22m │
│ [img]  Rahul Varma   09:05   ✅ At office          —       (in)  │
│   —    Sneha Patil   —       —                     —       Absent│
└──────────────────────────────────────────────────────────────────┘
```

**Each row:** the photo taken at check-in, name, check-in time, where they were,
check-out time, hours worked.

**Location shows as a simple tag** — green "At office", amber "X km away", grey
"Location refused". Clicking the tag can show a map pin.

**What you can do:** move between dates, filter to only problems, download the day
or month to Excel.

**Who sees it:** Admin only. HR may need it too — your decision.

### What the employee experiences

1. Opens the app, taps check in
2. Phone asks to use the camera → photo taken
3. Phone asks to use location → position captured
4. Both saved with the time

The same again at check-out.

### Three decisions needed before this can be built

1. **If they refuse permission?** The phone always asks and they can say no.
   Options: block check-in until allowed · allow it and mark "Location refused"
   for you to review. **Recommended: allow and flag**, so nobody is stopped from
   working by a phone setting.

2. **Where is the office, and how far is too far?** Someone enters the office
   address once and a distance. **Recommended: 200 metres**, which covers a
   building and its car park without flagging people at the door.

3. **Tag only, or map pin too?** **Recommended: start with the tag.** Add the map
   later if you find yourself wanting it.

> Honest caution: location can be faked with phone software by someone determined.
> This stops honest mistakes and casual cheating, not deliberate fraud.

---

## 4. Lead Allocation

**Purpose:** get lists of prospects into the hands of the right telecaller.

```
┌──────────────────────────────────────────────────────────────┐
│  Lead Allocation                        [ + Upload Leads ]    │
├──────────────────────────────────────────────────────────────┤
│  Who is holding what                                          │
│  Arjun Kumar    120 leads   64 called   18 interested   4 won │
│  Priya Nair      80 leads   51 called   12 interested   3 won │
│  Unassigned      40 leads                                     │
├──────────────────────────────────────────────────────────────┤
│  Recent uploads                                               │
│  Jun_Leads.csv   200 leads   → Arjun Kumar    12 Jun          │
└──────────────────────────────────────────────────────────────┘
```

**What you can do**
- **Upload Leads** — choose a file, pick who gets them, confirm
- See who is holding how many, and how far through they are
- Move leads from one telecaller to another
- See unassigned leads waiting

**Note:** the file must be a CSV (in Excel: *Save As → CSV*). A normal `.xlsx`
cannot be read.

---

## 5. Approvals

**Purpose:** the things only you can sign off. Your scope document gives Admin the
final word on money.

```
┌──────────────────────────────────────────────────────────────┐
│  Approvals                            3 waiting               │
│  Payments (2) · Leave escalations (1)                         │
├──────────────────────────────────────────────────────────────┤
│  ₹65,000   Singhania Logistics                                │
│  Closed by Arjun Kumar · HR verified 12 Jun · UTR TXN4429...  │
│                                    [ Approve ]  [ Reject ]    │
└──────────────────────────────────────────────────────────────┘
```

**What you can do:** approve or reject, with a reason. Every decision is recorded
against your name and the date — that record is the audit log, working quietly in
the background instead of as a page you visit.

---

## 6. Reports

**Purpose:** get your numbers out of the app and into a spreadsheet.

Pick what, pick a date range, download.

| Report | Contains |
|---|---|
| Attendance | Who was in, when, and where |
| Calls | Every call logged, by person |
| Sales & targets | Achieved against target |
| Payments | Every payment and its status |
| Employees | Full staff list with details |

Everything downloads as a file that opens in Excel.

---

## What is gone, and why

| Removed | Reason |
|---|---|
| Total System Logins | Invented figure. You would never act on it |
| System Uptime | A hosting statistic, not a business one |
| Roles: 4 | Just the count of job titles |
| Role Permissions Matrix | Rules should be permanent, not editable |
| Global System Settings | Nothing in it is a real setting |
| System Audit Reports | Becomes automatic recording inside Approvals |
| Teams as its own tab | Moved inside People |

---

## Your open questions

1. Location: block check-in if refused, or allow and flag? *(suggested: allow and flag)*
2. Office address and radius? *(suggested: 200 metres)*
3. Map pin, or tag only? *(suggested: tag only to start)*
4. Should HR see the Attendance Report, or Admin only?
5. Anything on this list you disagree with?

Once these are answered, Admin is fully specified and we move to Team Leader, HR
and Telecaller.
