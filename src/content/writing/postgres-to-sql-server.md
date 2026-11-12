---
title: Same app, new database: the bugs only real files could find
order: 2
topic: Data and performance
date: 2026-11-11
description: A finance app moved from PostgreSQL to SQL Server, and real client files broke it: a 2,100-parameter ceiling, a race on one connection, a ten-second browser freeze and 33 blank export columns.
problem: After a move from PostgreSQL to SQL Server, real client files failed to upload and Download froze the browser.
found: Reproduced each report on a restored copy and measured: a 2,100-parameter limit, a race on one connection, a 10-second freeze.
fix: Batches sized from the driver’s limit, writes one after another, the export built on the server, column names fixed.
result: Files are saved whole or not at all; Download sends a 3.9 MB file instead of 43 MB of JSON.
video: short-sql-server
---
A finance reporting app (Angular front end, NestJS and TypeORM back end) had been moved from PostgreSQL to SQL Server. The code compiled and the screens opened, but no transaction file had ever loaded successfully. When the client started uploading their real Excel files, the app failed in ways no test had shown.

From late August into September 2026 I worked through those failures one at a time. Most of them were the same lesson in different clothes: **two databases that both speak SQL do not agree on the details**, and the details only show up with real data.

## 1. The 2,100-parameter ceiling

The first error on every transaction file was `Invalid string`. Fix that, and every file failed with a different error instead:

```
The incoming request has too many parameters.
The server supports a maximum of 2100 parameters.
```

The upload inserted rows in chunks of a hard-coded 500. Each row binds 56 values. That is 28,000 parameters in one statement. SQL Server allows at most 2,100 parameters per request (in practice a little fewer, since the driver uses some itself), and refuses the statement before reading a single value. PostgreSQL's limit is 65,535, so on the old database 500 rows was fine.

A smaller fixed number would only move the trap. The chunk size is now **computed**: the number of binds per row is read from the entity's metadata for the row actually being sent, and the ceiling comes from the driver in use. On SQL Server this table goes in 33 rows at a time; on PostgreSQL it is not slowed down to SQL Server's budget.

## 2. Types decided by a column's name

The `Invalid string` error had its own cause. The controller guessed each column's type from its **name**, and called `Number()` on fields like the reference and document number, which are text columns in the database. Values now pass through one coercion layer that reads the declared type and length from the ORM's metadata. A value that can't be stored is reported against its row and column, never quietly changed: an over-long reference is refused, not cut short.

The same pass found a quieter one: an Excel error cell such as `#N/A` was being imported as the number **42** (its internal error code). Error cells are now detected and refused.

These two fixes were sequential gates. Fixing the types alone turned every failure into the parameter error; fixing the chunking alone left the type errors. Only both together let a real file through.

## 3. The upload that failed differently every time

The loan and investment uploads had a stranger symptom. The same 16-row file, uploaded three times, failed **9, then 8, then 9** rows, and a different set each time.

The first theory was a missing table. It couldn't be: a missing table fails the same way every time. A result that changes from run to run is a race.

The rows were written with `Promise.all(rows.map(async …))`, all on **one shared database connection**. The ORM opens and commits a transaction for each save. Its queries are queued safely, but starting and committing transactions is not, so one row's commit landed in the middle of another row's insert. Writing the rows one after another fixed it. The same defect existed one level up, where two files in one request were processed in parallel: one was written, the other was lost, and the screen called the whole upload a failure. A browser test found it, and that loop became sequential too.

Concurrency is not free speed. On a single connection, it was data loss.

## 4. "Download" that had never worked

After uploading, the client pressed **Download** and got "Request failed". The grid then said "No data found", which made a failed export look like lost data.

The Download button asks for the whole table by sending `limit: 0`. The back end used `take(Number(body.limit ?? 50))`. Zero isn't null, so the default never applied, and the ORM generated:

```sql
OFFSET 0 ROWS FETCH NEXT 0 ROWS ONLY
```

On PostgreSQL, `LIMIT 0` is legal and returns nothing: a silently empty export. On SQL Server it is a hard error. A limit of zero or less now means "no paging".

Then the next query bound every row id into one `IN (…)` list. The 2,100 ceiling again; I measured it: 2,000 ids pass, 2,099 fail. The client's data had 9,914 rows. Ids are now fetched in batches of 1,000.

## 5. The ten-second freeze

With the server fixed, Download made Chrome show "This page isn't responding".

The obvious suspect was the data grid, which tried to render every row. I measured before changing anything. In a real browser, building the Excel file for 24,910 rows froze the page for **10.02 seconds**, and one call, the spreadsheet library's `writeBuffer`, took **8.51** of them. Removing the grid rendering alone would not have fixed it. (The grid was a real problem too: it wasn't virtualised, so it would have drawn about 1.25 million cells.)

The fix moved the work: the server builds the finished workbook and the browser just saves a file. On a restored copy of the data, 9,914 rows took 3.0 seconds on the server and came down as a 1.6 MB file. On production, 24,910 rows arrived as a **3.9 MB file instead of 43.3 MB of JSON**, with no work on the main thread.

## 6. 33 blank columns

Moving the column layout to the server exposed one more fault. The export read every field by a lowercase name, like `companycode` or `entityname`. PostgreSQL folds unquoted column aliases to lower case. SQL Server keeps them as written. Since the migration, **33 of the 52 columns** had been exporting empty: names, document numbers, dates, amounts.

On the restored copy, 34 columns now carry data, and the other 18 match exactly the columns with no stored values. On production, 44 of 52 do.

## 7. "Uploaded successfully", minus some rows

The last group was about trust. Some uploads said "successfully" while skipping rows: an unknown country or currency, a blank required cell, a reader that stopped at the first empty line. Now:

- an unknown value is refused by row and column, and the reply says which (on one upload, where the client's own wording sits outside the master data, unknown values are counted and reported instead);
- readers go to the end of the sheet, not the first blank row;
- one shared parser handles amounts (commas accepted, never the text `NaN`);
- where a file can't be saved whole, **nothing is saved**, so a refused file leaves nothing behind.

## What I took from it

**A database migration isn't done when the code compiles.** Parameter limits, paging syntax, alias case and zero-versus-null behaviour all changed silently.

**Real files are the test suite.** Every one of these faults was invisible with clean test data.

**Measure before you fix.** Twice the first reading was wrong and a measurement caught it: the grid wasn't what froze the page, and the export was far bigger than the first estimate. The missing-table theory fell to one observation: the failures changed from run to run.

**A fix that lets real data in exposes the next fault.** Expect a chain, and tell the client so.

**"Successfully" is a promise.** If the app can't keep it, it should say what it refused.

> **How this was solved.** I worked on this with Claude Code, an AI coding agent. My part: reproducing the client's reports on a restored copy of the data, ruling out the wrong theories, deciding what the app should refuse, and working with the client and the team that deploys. The agent wrote most of the code and the test harnesses with me, and I reviewed every change.
