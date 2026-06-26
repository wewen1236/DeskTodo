interface ProgressRingProps {
  total: number
  completed: number
  size?: number
  strokeWidth?: number
  className?: string
}

export function ProgressRing({ total, completed, size = 48, strokeWidth = 4, className = '' }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const fraction = total > 0 ? completed / total : 0
  const offset = circumference * (1 - fraction)

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--win-border)"
          strokeWidth={strokeWidth}
        />
        {total > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--win-accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.3s ease' }}
          />
        )}
      </svg>
      <span className="absolute text-xs font-medium text-win-text" style={{ fontSize: size * 0.28 }}>
        {completed}/{total}
      </span>
    </div>
  )
}
