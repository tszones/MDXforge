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
import { Heading } from 'fumadocs-ui/components/heading'
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

export const mdxforgeMdxComponents: MDXComponents = {
  Accordion,
  Accordions,
  Banner,
  DynamicCodeBlock,
  File,
  Files,
  Folder,
  GithubInfo,
  Heading,
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
