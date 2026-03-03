import type { ConfigSchemaField } from '../../api/types'
import { StringField } from './fields/StringField'
import { TextareaField } from './fields/TextareaField'
import { SelectField } from './fields/SelectField'
import { BooleanField } from './fields/BooleanField'
import { IntegerField } from './fields/IntegerField'
import { JsonField } from './fields/JsonField'
import { KeyValueField } from './fields/KeyValueField'
import { ArrayOfObjectsField } from './fields/ArrayOfObjectsField'

interface Props {
  schema: ConfigSchemaField[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export function DynamicForm({ schema, values, onChange }: Props) {
  return (
    <div className="space-y-3">
      {schema.map((field) => {
        const value = values[field.key]
        return (
          <div key={field.key}>
            {field.type !== 'boolean' && (
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-400">*</span>}
              </label>
            )}
            <FieldRenderer field={field} value={value} onChange={(v) => onChange(field.key, v)} />
          </div>
        )
      })}
    </div>
  )
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: ConfigSchemaField
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (field.type) {
    case 'string':
      return <StringField field={field} value={value as string} onChange={onChange} />
    case 'textarea':
      return <TextareaField field={field} value={value as string} onChange={onChange} />
    case 'select':
      return <SelectField field={field} value={value as string} onChange={onChange} />
    case 'boolean':
      return <BooleanField field={field} value={value as boolean} onChange={onChange} />
    case 'integer':
      return <IntegerField field={field} value={value as number} onChange={onChange} />
    case 'json':
      return <JsonField field={field} value={value} onChange={onChange} />
    case 'keyvalue':
      return (
        <KeyValueField
          field={field}
          value={value as Record<string, string> | null}
          onChange={onChange as (v: Record<string, string>) => void}
        />
      )
    case 'array_of_objects':
      return (
        <ArrayOfObjectsField
          field={field}
          value={value as Record<string, unknown>[] | null}
          onChange={onChange as (v: Record<string, unknown>[]) => void}
        />
      )
    default:
      return <StringField field={field} value={String(value ?? '')} onChange={onChange} />
  }
}
