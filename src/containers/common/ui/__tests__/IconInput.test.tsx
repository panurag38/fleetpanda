import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { IconInput } from '../IconInput';
import { UserIcon } from '../icons';

describe('IconInput', () => {
  it('renders label, icon, and hint text', () => {
    render(
      <IconInput
        label="Username"
        icon={<UserIcon />}
        value=""
        onChange={vi.fn()}
        placeholder="Enter username"
        hint="Use your workspace username"
      />
    );

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByText('Use your workspace username')).toBeInTheDocument();
  });

  it('shows validation errors and marks the field invalid', () => {
    render(
      <IconInput
        label="Username"
        icon={<UserIcon />}
        value=""
        onChange={vi.fn()}
        error="Please enter your username."
      />
    );

    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/please enter your username/i);
  });

  it('forwards input changes', () => {
    const handleChange = vi.fn();

    render(<IconInput label="Username" icon={<UserIcon />} value="" onChange={handleChange} />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'driver' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
