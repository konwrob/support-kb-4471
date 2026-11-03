<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { copies, mergedCount, problemsIn, type Problem } from '#lib/kb/problems';

  // `tickets`: where each problem is filed now, problem → link.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Partial<Record<Problem, string>> } = $props();

  const all = reports as Report[];
  const groups = $derived(problemsIn(all, ticket, tenantOf, notes.oneDayMove));
  const LABEL: Record<Problem, string> = {
    parser: 'parser reads day-first dates month first',
    hint: 'booking-v3 form hint says MM/DD/YYYY',
    'one-day': 'date moves by one day',
    unplaced: 'no tenant cause',
  };
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const issueNo = (url: string) => url.replace(/^.*\/issues\//, '#');
</script>

<p class="sum">
  <strong>{mergedCount(all, ticket)}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'} ·
  each report counted once, under the cause it is filed under ·
  {copies(all)} duplicate rows in the export, counted once
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>intake tagged</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="muted">{LABEL[g.problem]}</span></td>
        <td><strong>{g.reports.length}</strong>{#if g.filedUnder.length}<br /><span class="muted">also counted under {g.filedUnder.join(', ')}</span>{/if}</td>
        <td>{g.tenants.length}</td>
        <td class="muted">{list(g.channels)}</td>
        <td class="muted">{list(g.taggedAs)}</td>
        <td class="muted">{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{issueNo(tickets[g.problem]!)}</a>{:else}<span class="warn">none</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each groups as g (g.problem)}
  {#if g.readAsOneDay}
    <p class="muted">{g.readAsOneDay} of the <code>{g.problem}</code> reports read as a one-day move: filed and counted under <code>{g.problem}</code> by tenant, and tracked as <code>one-day</code>.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.05rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .warn { color: var(--warn); font-weight: 600; }
</style>
