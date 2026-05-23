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
import { Mermaid } from './Mermaid'
import { MetricCard } from './MetricCard'
import { SimpleBarChart } from './SimpleBarChart'
import { SimpleLineChart } from './SimpleLineChart'
import { StatGrid } from './StatGrid'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from './ui/table'

export const mdxforgeMdxComponents = {
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
