import type { ConfigSchemaField } from '../../../api/types'
import { ExpressionInput } from './ExpressionInput'

interface Props {
  field: ConfigSchemaField
  value: string
  onChange: (value: string) => void
}

export function StringField({ field, value, onChange }: Props) {
  const input = (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      placeholder={field.label}
      readOnly={field.readonly}
      disabled={field.readonly}
    />
  )

  if (field.supports_expression) {
    return <ExpressionInput value={value ?? ''} onChange={onChange} field={field}>{input}</ExpressionInput>
  }

  return input
}
