// client/src/components/icons/WalletBadgeIcon.jsx
'use client'

export default function WalletBadgeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="wallet-gradient" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="wallet-coin" x1="20" y1="10" x2="28" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#facc15" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        d="M6 8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3h-1.5A4.5 4.5 0 0 0 18 15.5 4.5 4.5 0 0 0 22.5 20H24v4a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"
        fill="url(#wallet-gradient)"
        opacity="0.85"
      />
      <path
        d="M10 6h7a4 4 0 0 1 4 4v2H10a4 4 0 0 1-4-4v-.5A1.5 1.5 0 0 1 7.5 6H10z"
        fill="#0f172a"
        opacity="0.3"
      />
      <rect x="6" y="10" width="18" height="12" rx="4" fill="#0f172a" opacity="0.45" />
      <rect x="8" y="12" width="14" height="8" rx="3" fill="#0f172a" opacity="0.55" />
      <circle cx="24" cy="15.5" r="3.5" fill="url(#wallet-coin)" />
      <rect x="20.5" y="14.75" width="7" height="1.5" rx="0.75" fill="#fbf4d6" opacity="0.8" />
    </svg>
  )
}
