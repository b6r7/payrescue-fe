type Props = {
  id?: string
  defaultValue: string
  className?: string
  multiline?: boolean
}

export const EditableText = ({ defaultValue, className }: Props) => (
  <span className={className}>{defaultValue}</span>
)
