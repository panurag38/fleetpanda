import { useEffect, useId, useRef } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { FormField } from './FormField';
import './SearchInput.css';

interface SearchInputProps {
  label?: string;
  value: string;
  onChange: (next: string) => void;
  onDebouncedChange?: (next: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({
  label = 'Search',
  value,
  onChange,
  onDebouncedChange,
  delay = 300,
  placeholder = 'Type to search...',
  className = ''
}: SearchInputProps) => {
  const id = useId();
  const debouncedValue = useDebouncedValue(value, delay);
  const onDebouncedChangeRef = useRef(onDebouncedChange);
  const skipInitialDebouncedRun = useRef(true);

  useEffect(() => {
    onDebouncedChangeRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    if (skipInitialDebouncedRun.current) {
      skipInitialDebouncedRun.current = false;
      return;
    }

    onDebouncedChangeRef.current?.(debouncedValue);
  }, [debouncedValue]);

  return (
    <FormField label={label} htmlFor={id} className={`search-input-field ${className}`.trim()}>
      <input
        id={id}
        className="input-control search-input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </FormField>
  );
};
