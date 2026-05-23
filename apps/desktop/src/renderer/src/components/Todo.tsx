import { cn } from '@mdxforge/ui/lib/utils'
import { IconAlertTriangle, IconCircle, IconCircleCheck, IconClock } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { m } from '../paraglide/messages'

type TodoStatus = 'todo' | 'active' | 'done' | 'blocked'

type TodoListProps = {
  id?: string
  className?: string
  title?: string
  description?: string
  children?: ReactNode
}

type TodoProps = {
  id?: string
  className?: string
  checked?: boolean
  status?: TodoStatus
  children?: ReactNode
}

const statusStyles: Record<
  TodoStatus,
  {
    item: string
    marker: string
    content: string
    icon: typeof IconCircle
    ariaLabel: () => string
  }
> = {
  todo: {
    item: 'border-fd-border bg-fd-card',
    marker: 'border-fd-border text-fd-muted-foreground',
    content: 'text-fd-card-foreground',
    icon: IconCircle,
    ariaLabel: () => m.todo_status_todo()
  },
  active: {
    item: 'border-fd-primary/30 bg-fd-primary/5',
    marker: 'border-fd-primary/30 text-fd-primary',
    content: 'text-fd-card-foreground',
    icon: IconClock,
    ariaLabel: () => m.todo_status_active()
  },
  done: {
    item: 'border-emerald-500/25 bg-emerald-500/10',
    marker: 'border-emerald-500/30 bg-emerald-500 text-white dark:text-emerald-950',
    content: 'text-fd-muted-foreground line-through decoration-emerald-500/55',
    icon: IconCircleCheck,
    ariaLabel: () => m.todo_status_done()
  },
  blocked: {
    item: 'border-red-500/25 bg-red-500/10',
    marker: 'border-red-500/30 text-red-600 dark:text-red-400',
    content: 'text-fd-card-foreground',
    icon: IconAlertTriangle,
    ariaLabel: () => m.todo_status_blocked()
  }
}

export function TodoList({ id, title, description, children, className }: TodoListProps) {
  return (
    <section
      id={id}
      data-mdxforge-todo-list=""
      className={cn('not-prose my-6 rounded-lg border bg-fd-card p-4 shadow-sm', className)}
    >
      {title || description ? (
        <header className="mb-3 space-y-1">
          {title ? (
            <h3 className="text-sm font-semibold tracking-normal text-fd-card-foreground">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-sm leading-6 text-fd-muted-foreground">{description}</p>
          ) : null}
        </header>
      ) : null}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">{children}</ul>
    </section>
  )
}

export function Todo({ id, checked, status, children, className }: TodoProps) {
  const resolvedStatus = resolveTodoStatus(status, checked)
  const styles = statusStyles[resolvedStatus]
  const Icon = styles.icon

  return (
    <li
      id={id}
      data-mdxforge-todo=""
      data-status={resolvedStatus}
      className={cn(
        'flex min-h-11 items-start gap-3 rounded-md border px-3 py-2.5 transition-colors',
        styles.item,
        className
      )}
    >
      <span
        aria-label={styles.ariaLabel()}
        role="img"
        className={cn(
          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
          styles.marker
        )}
      >
        <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.4} />
      </span>
      <div
        className={cn(
          'min-w-0 flex-1 text-sm leading-6 wrap-anywhere [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
          styles.content
        )}
      >
        {children}
      </div>
    </li>
  )
}

function resolveTodoStatus(
  status: TodoStatus | undefined,
  checked: boolean | undefined
): TodoStatus {
  if (status && status in statusStyles) {
    return status
  }

  return checked ? 'done' : 'todo'
}
