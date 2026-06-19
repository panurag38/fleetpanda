import type { ReactNode } from 'react';
import { useDialogFocus } from '../../../hooks/useDialogFocus';
import { Button } from './Button';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmDialogProps) => {
  const dialogRef = useDialogFocus(open);

  return (
    <dialog ref={dialogRef} className="confirm-dialog" onCancel={onCancel}>
      <div className="confirm-dialog__content">
        <h3>{title}</h3>
        <div className="confirm-dialog__message">{message}</div>
        <div className="confirm-dialog__actions">
          <Button variant="ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="primary" type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
