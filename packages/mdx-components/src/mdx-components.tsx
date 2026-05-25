import type { ComponentPropsWithoutRef } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '@mdxforge/ui/components/table'
import * as Twoslash from 'fumadocs-twoslash/ui'
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion'
import { Banner } from 'fumadocs-ui/components/banner'
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock'
import { File, Files, Folder } from 'fumadocs-ui/components/files'
import { GithubInfo } from 'fumadocs-ui/components/github-info'
import { ImageZoom } from 'fumadocs-ui/components/image-zoom'
import { InlineTOC } from 'fumadocs-ui/components/inline-toc'
import { Step, Steps } from 'fumadocs-ui/components/steps'
import { Tab, Tabs, TabsContent, TabsList, TabsTrigger } from 'fumadocs-ui/components/tabs'
import { TypeTable } from 'fumadocs-ui/components/type-table'
import type { MDXComponents } from 'mdx/types'
import { Mermaid } from './Mermaid.js'
import { MetricCard } from './MetricCard.js'
import { SimpleBarChart } from './SimpleBarChart.js'
import { SimpleLineChart } from './SimpleLineChart.js'
import { StatGrid } from './StatGrid.js'
import { Todo, TodoList } from './Todo.js'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

type PlainHeadingProps<T extends HeadingTag> = Omit<ComponentPropsWithoutRef<T>, 'as'> & {
  as?: T
}

function PlainHeading<T extends HeadingTag = 'h1'>({
  as,
  ...props
}: PlainHeadingProps<T>): React.JSX.Element {
  const Component = as ?? 'h1'
  return <Component {...props} />
}

export const mdxforgeMdxComponents: MDXComponents = {
  Accordion,
  Accordions,
  Banner,
  DynamicCodeBlock,
  File,
  Files,
  Folder,
  GithubInfo,
  h1: (props) => <PlainHeading as="h1" {...props} />,
  h2: (props) => <PlainHeading as="h2" {...props} />,
  h3: (props) => <PlainHeading as="h3" {...props} />,
  h4: (props) => <PlainHeading as="h4" {...props} />,
  h5: (props) => <PlainHeading as="h5" {...props} />,
  h6: (props) => <PlainHeading as="h6" {...props} />,
  Heading: PlainHeading,
  ImageZoom,
  InlineTOC,
  Mermaid,
  MetricCard,
  SimpleBarChart,
  SimpleLineChart,
  StatGrid,
  Step,
  Steps,
  Tab,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToDo: Todo,
  ToDoList: TodoList,
  Todo,
  TodoList,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TypeTable,
  ...Twoslash
}
