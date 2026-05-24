import type { ElementType } from 'react'

export type MenuItemConfig = {
  title: string
  description?: string
  href?: string
  external?: boolean
  icon?: ElementType
  items?: MenuItemConfig[]
}
