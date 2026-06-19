import type { ReactNode } from 'react';
import { SELECT_PLACEHOLDER, todayISO } from '../../../lib/validation';
import './FormField.css';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

export const FormField = ({ label, htmlFor, hint, error, children, className = '' }: FormFieldProps) => (
  <div className={`form-field ${error ? 'form-field--invalid' : ''} ${className}`.trim()}>
    <label className="form-field__label" htmlFor={htmlFor}>
      {label}
    </label>
    {children}
    {hint ? <p className="form-field__hint">{hint}</p> : null}
    {error ? (
      <p className="form-field__error" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  className?: string;
}

export const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder = SELECT_PLACEHOLDER,
  error,
  disabled = false,
  className = ''
}: SelectFieldProps) => (
  <FormField label={label} error={error} className={className}>
    <select
      className="input-control"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </FormField>
);

interface TextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date' | 'search';
  placeholder?: string;
  error?: string | null;
  min?: number;
}

export const TextField = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  min
}: TextFieldProps) => (
  <FormField label={label} error={error}>
    <input
      className="input-control"
      type={type}
      value={value}
      min={min}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </FormField>
);

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disablePast?: boolean;
}

export const DateField = ({
  label,
  value,
  onChange,
  error,
  disablePast = true
}: DateFieldProps) => (
  <FormField label={label} error={error}>
    <input
      className="input-control"
      type="date"
      value={value}
      min={disablePast ? todayISO() : undefined}
      onChange={(event) => onChange(event.target.value)}
    />
  </FormField>
);
