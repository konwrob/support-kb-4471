<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problemsIn, type Problem } from '#lib/kb/problems';

  // One number for a sentence: how many reports in `ticket` belong to `problem` (or its tenants).
  let { ticket, problem, of = 'reports' }: { ticket: number; problem: Problem; of?: 'reports' | 'tenants' } = $props();

  const g = $derived(problemsIn(reports as Report[], ticket, tenantOf, notes.oneDayMove).find((x) => x.problem === problem));
  const n = $derived(g ? (of === 'tenants' ? g.tenants.length : g.reports.length) : 0);
</script>

<strong>{n}</strong>
