import type { ConfigSchemaField } from '../../../api/types'

interface Props {
  field: ConfigSchemaField
  value: string
  onChange: (value: string) => void
}

export function SelectField({ field, value, onChange }: Props) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
    >
      <option value="">Select {field.label}</option>
      {(field.options ?? []).map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}
