import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const useDialogFocus = (open: boolean) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      const focusable = dialog.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      focusable?.focus();
      return;
    }

    if (!open && dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [open]);

  return dialogRef;
};
