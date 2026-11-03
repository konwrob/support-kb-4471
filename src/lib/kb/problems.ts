// What #4471 actually holds: one problem per cause, plus the reports the desk read as a one-day
// move. Pages explain it; this file is what runs. Builds on causes.ts and changes nothing there.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

// The desk's rule (causes.ts, readAs): a report the desk read differently from its cause is counted
// where it is filed, by tenant, and footnoted there. So each report counts under its cause; the
// reports the desk read as a one-day move (desk-notes.json) also make a problem of their own.
export function causeProblem(r: Report, t: Tenant | undefined): Problem {
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
  // one-day only: the cause groups these reports are filed and counted under.
  filedUnder: Problem[];
  // cause groups only: how many of their reports the desk read as a one-day move.
  readAsOneDay: number;
};

const tally = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

// Reports merged into `ticket`, each counted once (the export's pages overlap), grouped by problem.
export function problemsIn(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = causeProblem(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const group = (problem: Problem, rs: Report[], filedUnder: Problem[] = []): ProblemGroup => {
    const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
    return {
      problem,
      reports: rs,
      tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
      channels: tally(rs.map((r) => r.channel)),
      taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      filedUnder,
      readAsOneDay: filedUnder.length ? 0 : rs.filter((r) => oneDay.includes(r.id)).length,
    };
  };
  const groups = [...by.entries()].map(([p, rs]) => group(p, rs)).sort((x, y) => y.reports.length - x.reports.length);
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) groups.push(group('one-day', moved, [...new Set(moved.map((r) => causeProblem(r, tenantOf(r))))]));
  return groups;
}

export function mergedCount(all: Report[], ticket: number): number {
  return uniqueById(all).filter((r) => r.mergedInto === ticket).length;
}

// Rows in the export that are a second copy of a report already counted.
export function copies(all: Report[]): number {
  return all.length - uniqueById(all).length;
}
