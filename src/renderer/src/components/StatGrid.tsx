import { cn } from '@/lib/utils'
import { MetricCard } from './MetricCard'

type StatGridItem = {
  label: string
  value: string | number
  description?: string
  trend?: string
  tone?: 'default' | 'positive' | 'negative' | 'neutral'
}

type StatGridProps = {
  items: StatGridItem[]
  columns?: 2 | 3 | 4
}

const columnClassNames: Record<NonNullable<StatGridProps['columns']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-2 xl:grid-cols-4'
}

export function StatGrid({ items, columns = 3 }: StatGridProps) {
  return (
    <div className={cn('not-prose grid gap-4', columnClassNames[columns])}>
      {items.map((item, index) => (
        <MetricCard key={`${item.label}-${index}`} {...item} />
      ))}
    </div>
  )
}
