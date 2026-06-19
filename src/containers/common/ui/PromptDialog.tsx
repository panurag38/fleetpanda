import { useEffect, useState } from 'react';
import { useDialogFocus } from '../../../hooks/useDialogFocus';
import { Button } from './Button';
import './ConfirmDialog.css';

interface PromptDialogProps {
  open: boolean;
  title: string;
  message: string;
  label: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  required?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const PromptDialog = ({
  open,
  title,
  message,
  label,
  placeholder = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  required = true,
  onConfirm,
  onCancel
}: PromptDialogProps) => {
  const dialogRef = useDialogFocus(open);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) {
      setValue('');
    }
  }, [open]);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (required && !trimmed) {
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <dialog ref={dialogRef} className="confirm-dialog" onCancel={onCancel}>
      <div className="confirm-dialog__content">
        <h3>{title}</h3>
        <p className="confirm-dialog__message">{message}</p>
        <label className="form-field">
          <span className="form-field__label">{label}</span>
          <textarea
            className="input-control prompt-dialog__input"
            value={value}
            placeholder={placeholder}
            rows={3}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <div className="confirm-dialog__actions">
          <Button variant="ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" type="button" onClick={handleConfirm} disabled={required && !value.trim()}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
