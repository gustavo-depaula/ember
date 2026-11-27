import type { Onboarding } from '../../worker/types'
import { DayChart } from './charts'
import { Funnel, percent, Table } from './parts'

const reasonLabels: Record<string, string> = {
  begin: 'I want to start praying',
  grow: 'I already pray and want to grow',
  obra: 'I follow the plan of the Work',
  office: 'I want to pray the Office',
  skipped: 'Skipped',
  'left at the start': 'Left at the first screen',
}

export function OnboardingTab({ usage }: { usage: Onboarding }) {
  const { funnel, daily } = usage
  return (
    <>
      <section>
        <h2>The first launch · {usage.filter.days} days</h2>
        <p className="lede">
          Installs that began the onboarding in the period, and how far they went.{' '}
          <strong>{funnel.skipped}</strong> skipped it from the first screen.
        </p>
        <Funnel
          steps={[
            { label: 'Saw the first screen', installs: funnel.started },
            { label: 'Gave a reason', installs: funnel.reasoned },
            { label: 'Reached reminders', installs: funnel.reminders },
            { label: 'Finished', installs: funnel.finished },
          ]}
        />
        <DayChart
          height={110}
          days={daily.map((d) => d.day)}
          bars={{ values: daily.map((d) => d.started), label: 'began' }}
          line={{ values: daily.map((d) => d.finished), label: 'finished' }}
        />
      </section>

      <Table
        heading="By reason, and their first week"
        lede={
          <>
            What each reason's installs did in the seven days after they began. The week's columns
            read only those that began at least a week before today (<em>judged</em>).
          </>
        }
        rows={usage.reasons}
        rowKey={(r) => r.reason}
        name={{ label: 'Reason', value: (r) => reasonLabels[r.reason] ?? r.reason }}
        meter={(r) => r.installs}
        columns={[
          { label: 'Installs', value: (r) => r.installs },
          { label: 'Finished', value: (r) => percent(r.finished, r.installs) },
          { label: 'Reminders on', value: (r) => percent(r.remindersOn, r.installs) },
          { label: 'Judged', value: (r) => r.judged },
          { label: 'Came back', value: (r) => percent(r.returned, r.judged) },
          { label: 'Prayed', value: (r) => percent(r.prayed, r.judged) },
          { label: 'Said Amen', value: (r) => percent(r.amen, r.judged) },
        ]}
        empty="No one has begun the onboarding in this period."
      />

      <Table
        heading="Every screen of it"
        rows={usage.steps}
        rowKey={(s) => s.route}
        name={{ label: 'Screen', value: (s) => <code>{s.route}</code> }}
        meter={(s) => s.installs}
        columns={[
          { label: 'Installs', value: (s) => s.installs },
          {
            label: '',
            value: (s) => <span className="muted">{percent(s.installs, funnel.started)}</span>,
          },
        ]}
      />
    </>
  )
}
