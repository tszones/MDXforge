import type { MdxFile } from '../../types'
import { AiChatPanel } from './AiChatPanel'

export type RightSidebarTab = 'ai'

export function RightSidebar({ file }: { file: MdxFile | null }): React.JSX.Element {
  return (
    <aside className="h-full min-h-0 bg-fd-card text-sm">
      <div className="h-full min-h-0 overflow-auto p-3">
        <AiChatPanel file={file} />
      </div>
    </aside>
  )
}
