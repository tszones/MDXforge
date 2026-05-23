import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@mdxforge/ui/components/chart'
import { cn } from '@mdxforge/ui/lib/utils'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

type ChartPoint = {
  name: string
  value: number
}

type SimpleBarChartProps = {
  data: ChartPoint[]
  title?: string
  description?: string
  unit?: string
  height?: number
  showLabels?: boolean
}

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--color-chart-1)'
  }
} satisfies ChartConfig

export function SimpleBarChart({
  data,
  title,
  description,
  unit,
  height = 280,
  showLabels = true
}: SimpleBarChartProps) {
  return (
    <figure className="not-prose rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      {title || description ? (
        <figcaption className="mb-4 space-y-1">
          {title ? <div className="font-semibold tracking-tight">{title}</div> : null}
          {description ? <div className="text-sm text-muted-foreground">{description}</div> : null}
        </figcaption>
      ) : null}
      <ChartContainer
        config={chartConfig}
        className={cn('w-full', height ? 'aspect-auto' : undefined)}
        style={{ height }}
      >
        <BarChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} minTickGap={12} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent formatter={(value) => `${value}${unit ?? ''}`} />}
          />
          <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]}>
            {showLabels ? (
              <LabelList
                position="top"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value) => `${value ?? ''}${unit ?? ''}`}
              />
            ) : null}
          </Bar>
        </BarChart>
      </ChartContainer>
    </figure>
  )
}
