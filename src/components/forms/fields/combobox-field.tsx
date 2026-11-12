'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useFieldContext, useFieldInvalid } from '@/lib/form-context';
import { useT } from '@/i18n/use-t';
import type { ComboboxFieldProps } from '@/types';

export function ComboboxField({
  label,
  description,
  required,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage
}: ComboboxFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = useFieldInvalid();
  const t = useT();
  const effPlaceholder = placeholder ?? t('select.option');
  const effSearchPlaceholder = searchPlaceholder ?? t('search.option');
  const effEmptyMessage = emptyMessage ?? t('search.noResults');

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
        onChange={(val) => {
          field.handleChange(val);
          field.handleBlur();
        }}
        placeholder={effPlaceholder}
        searchPlaceholder={effSearchPlaceholder}
        emptyText={effEmptyMessage}
        options={options.map((opt) => ({
          value: opt.value,
          label: opt.label,
          disabled: opt.disabled
        }))}
        required={required}
        pageSize={20}
        allowClear
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </Field>
  );
}
