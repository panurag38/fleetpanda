interface IconProps {
  className?: string;
}

export const UserIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-3.038 0-5.5 1.462-5.5 3.267C6.5 18.538 8.962 20 12 20s5.5-1.462 5.5-2.483C17.5 15.712 15.038 14.25 12 14.25Z"
    />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M8 10V8a4 4 0 1 1 8 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h4V8a2 2 0 1 0-4 0v2Z"
    />
  </svg>
);

export const LogInIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M10 4a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4v2a1 1 0 0 0 1.707.707l6-6a1 1 0 0 0 0-1.414l-6-6A1 1 0 0 0 10 4Zm8 6h-5v2h5v-2Z"
    />
  </svg>
);

export const LogOutIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M14 4a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8v2a1 1 0 0 0 1.707.707l6-6a1 1 0 0 0 0-1.414l-6-6A1 1 0 0 0 14 4ZM8 12h9v2H8v-2Z"
    />
  </svg>
);

export const ShieldIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Zm0 10.5a2.5 2.5 0 1 0-2.5-2.5 2.5 2.5 0 0 0 2.5 2.5Z"
    />
  </svg>
);

export const TruckIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M3 6h11v9H3V6Zm12 2h2.4L19 11v4h-4v-7Zm-9 11a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm10 0a2 2 0 1 0-2-2 2 2 0 0 0 2 2Z"
    />
  </svg>
);

export const HomeIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 3 3 10.5V20a1 1 0 0 0 1 1h6v-6h4v6h6a1 1 0 0 0 1-1v-9.5L12 3Z"
    />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M6.225 4.811 4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811Z"
    />
  </svg>
);

export const RefreshIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M17.65 6.35A7.958 7.958 0 0 0 12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.67 4.22 1.78L13 11h7V4l-2.35 2.35Z"
    />
  </svg>
);

export const PlusIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path fill="currentColor" d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
  </svg>
);
