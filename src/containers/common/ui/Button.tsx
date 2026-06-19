import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  leadingIcon,
  trailingIcon,
  ...rest
}: ButtonProps) => {
  return (
    <button className={`button button--${variant} ${className}`.trim()} type={type} {...rest}>
      {leadingIcon ? <span className="button__icon button__icon--leading">{leadingIcon}</span> : null}
      <span className="button__label">{children}</span>
      {trailingIcon ? <span className="button__icon button__icon--trailing">{trailingIcon}</span> : null}
    </button>
  );
};
