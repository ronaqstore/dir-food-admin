'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useFieldContext, useFieldInvalid } from '@/lib/form-context';
import { useT } from '@/i18n/use-t';
import type { SelectFieldProps } from '@/types';

export function SelectField({
  label,
  description,
  required,
  placeholder,
  options
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = useFieldInvalid();
  const t = useT();
  const effPlaceholder = placeholder ?? t('common.select');

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {label}
        {required && ' *'}
      </FieldLabel>
      <SearchableSelect
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onChange={(value) => field.handleChange(value)}
        placeholder={effPlaceholder}
        options={options.map((opt) => ({
          value: opt.value,
          label: opt.label,
          disabled: opt.disabled
        }))}
        required={required}
        pageSize={20}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </Field>
  );
}
