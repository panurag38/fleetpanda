export const NAME_PATTERN = /^[A-Za-z\s'-]+$/;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const validateName = (value: string, fieldLabel = 'Name') => {
  const trimmed = value.trim();

  if (!trimmed) {
    return `${fieldLabel} is required.`;
  }

  if (!NAME_PATTERN.test(trimmed)) {
    return `${fieldLabel} should contain letters only.`;
  }

  return null;
};

export const SELECT_PLACEHOLDER = 'Select an option';
