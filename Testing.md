# StudyQuest - Sprint 1 Testing Report

**Tester:** <Alan Nguyen>
**Date tested:** <10/18/26>
**Build tested:** <testing-report / commit hash /[ website URL](https://study-quest-phi.vercel.app/)>

## 1. Summary

<2-3 sentences: what works, what is broken, overall readiness.>

| Feature | Owner | Status |
| --- | --- | --- |
| Database tables | Mason | Not tested |
| Supabase client connection | Justin | Not tested |
| Dashboard / home page | Zlata | Not tested |
| Sign up / log in pages | Salvador | Not tested |
| Study set page | Jordan | Not tested |

Status values: Pass / Pass with issues / Fail / Not tested

## 2. Test cases

### Sign up / log in
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| A1 | Valid sign up | Enter valid username, email, password; submit | Account created, user lands on dashboard | Supabase is not configured. Copy Frontend/.env.example to Frontend/.env and add keys | Fail |
| A2 | Invalid email | Enter "abc" as email; submit | Clear error, no account created | Shows invalid message telling user that '@' needs to be included | Pass |
| A3 | Weak password | Enter a very short password; submit | Clear error | Shows error message saying password needs 8 characters or more | Pass |
| A4 | Duplicate email | Sign up with an email already used | "Email in use" style error | | |
| A5 | Valid log in | Log in with correct credentials | Dashboard loads | | |
| A6 | Wrong password | Log in with a wrong password | Clear error, stays logged out | | |
| A7 | Log out | Click log out | Returns to login, protected pages inaccessible | | |
| A8 | Protected route | While logged out, open the dashboard URL directly | Redirected to login | | |

### Dashboard
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| B1 | Loads | Log in, open dashboard | Page renders with no console errors | | |
| B2 | Empty state | Log in as a brand-new user | Friendly empty message, no crash | | |
| B3 | Correct user data | Log in as two different users | Each sees only their own data | | |
| B4 | Navigation | Click every link/button | Each goes to the right place | | |

### Study set page
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| C1 | Questions display | Open a set with several questions | Questions and answers show correctly | | |
| C2 | Navigate cards | Move next / previous | Works, including first and last card | | |
| C3 | Set with 0 questions | Open an empty set | Handled gracefully | | |
| C4 | Set with 1 question | Open a one-question set | No broken navigation | | |
| C5 | Long / special text | Question with very long text, emoji, symbols | Displays without breaking layout | | |
| C6 | Refresh | Refresh the page mid-session | Data still loads | | |

### Database / Supabase connection
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| D1 | Data saves | Create data in the UI | Row appears in the Supabase table editor | | |
| D2 | Data loads | Reload after saving | Same data shown | | |
| D3 | Column names | Compare schema to what the frontend reads | No mismatches | | |

### General
| # | Test | Steps | Expected | Actual | Result |
| --- | --- | --- | --- | --- | --- |
| E1 | Responsive | Resize to phone width | Layout usable | | |
| E2 | Second browser | Repeat core flow in another browser | Same behavior | | |
| E3 | Console / network | Open dev tools during core flow | No red errors, no failed requests | | |

## 3. Bugs found

### BUG-001: <short title>
- **Severity:** Blocker / Major / Minor
- **Feature / owner:** <feature> / <teammate>
- **Steps to reproduce:**
  1. ...
  2. ...
- **Expected:** ...
- **Actual:** ...
- **Screenshot / error message:** ...
- **Status:** Open

## 4. Suggested improvements (UX / design)

- <e.g. add a loading spinner on the dashboard>
- <e.g. error messages should say which field is wrong>

## 5. Missing features / carry over to Sprint 2

- <item>

## 6. Retest log

| Bug | Fixed by | Retested on | Result |
| --- | --- | --- | --- |
| BUG-001 | | | |
