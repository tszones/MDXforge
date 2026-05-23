import { cn } from '@/lib/utils'

type MetricCardProps = {
  label: string
  value: string | number
  description?: string
  trend?: string
  tone?: 'default' | 'positive' | 'negative' | 'neutral'
}

const trendToneClassNames: Record<NonNullable<MetricCardProps['tone']>, string> = {
  default: 'text-primary',
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-red-600 dark:text-red-400',
  neutral: 'text-muted-foreground'
}

export function MetricCard({
  label,
  value,
  description,
  trend,
  tone = 'default'
}: MetricCardProps) {
  return (
    <div className="not-prose rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {trend ? (
          <div className={cn('pb-1 text-sm font-medium', trendToneClassNames[tone])}>{trend}</div>
        ) : null}
      </div>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}
