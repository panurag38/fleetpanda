import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import './IconInput.css';

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: ReactNode;
  error?: string | null;
  hint?: string;
}

export const IconInput = ({
  label,
  icon,
  error,
  hint,
  id: providedId,
  className = '',
  ...rest
}: IconInputProps) => {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`icon-field ${error ? 'icon-field--invalid' : ''}`}>
      <label className="icon-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`icon-field__control ${className}`.trim()}>
        <span className="icon-field__icon" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          className="icon-field__input"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
      {hint ? (
        <p className="icon-field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="icon-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};
