import type { ReactNode } from 'react';
import { useDialogFocus } from '../../../hooks/useDialogFocus';
import { Button } from './Button';
import './InfoDialog.css';

interface InfoDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  closeLabel?: string;
  onClose: () => void;
}

export const InfoDialog = ({ open, title, message, closeLabel = 'Close', onClose }: InfoDialogProps) => {
  const dialogRef = useDialogFocus(open);

  return (
    <dialog ref={dialogRef} className="info-dialog" onCancel={onClose}>
      <div className="info-dialog__content">
        <h3>{title}</h3>
        <div className="info-dialog__message">{message}</div>
        <div className="info-dialog__actions">
          <Button variant="primary" type="button" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
};
