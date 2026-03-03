import type { ReactNode } from 'react'
import type { ConfigSchemaField } from '../../../api/types'

interface Props {
  field: ConfigSchemaField
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

export function ExpressionInput({ children }: Props) {
  return (
    <div className="relative">
      {children}
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-mono text-amber-700">
        {'{{ }}'}
      </span>
    </div>
  )
}
