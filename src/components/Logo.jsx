export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="logo">
      <rect width="64" height="64" rx="14" fill="#1f2328" />
      <path d="M0 44 C14 34 24 40 34 32 S52 22 64 26 V64 H0Z" fill="#3a4048" />
      <path d="M0 52 C16 44 28 50 40 44 S56 38 64 40 V64 H0Z" fill="#59616b" />
      <path d="M12 54 C20 46 18 38 28 34 S42 30 46 18" stroke="#e8c26a" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="0.5 6" />
      <circle cx="46" cy="18" r="5" fill="#e8c26a" />
    </svg>
  );
}
