type LogoMarkProps = {
  size?: number;
  title?: string;
};

export function LogoMark({ size = 36, title = "CandorLoop" }: LogoMarkProps) {
  return (
    <svg
      aria-label={title}
      className="logo-mark"
      height={size}
      role="img"
      viewBox="0 0 48 48"
      width={size}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="loop-gradient" x1="4" x2="44" y1="8" y2="40">
          <stop offset="0" stopColor="#8F7BFF" />
          <stop offset="0.52" stopColor="#44D5C5" />
          <stop offset="1" stopColor="#F2C66D" />
        </linearGradient>
      </defs>
      <path
        d="M17.7 13.4c-5.8 0-10.5 4.7-10.5 10.6s4.7 10.6 10.5 10.6c8.7 0 12-21.2 21.1-21.2 5.8 0 10.5 4.7 10.5 10.6s-4.7 10.6-10.5 10.6c-8.7 0-12-21.2-21.1-21.2Z"
        fill="none"
        stroke="url(#loop-gradient)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
        transform="translate(-4.2 0)"
      />
      <circle cx="24" cy="24" fill="#F7F5EF" r="2.3" />
    </svg>
  );
}
