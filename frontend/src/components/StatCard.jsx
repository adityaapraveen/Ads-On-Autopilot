const trendIcons = { up: '↑', down: '↓', neutral: '—' };

export function StatCard({ label, value, sub, trend, accent }) {
    const trendColor =
        trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : 'var(--text-muted)';

    const glowColor = accent
        ? `${accent}18`
        : trend === 'up' ? 'rgba(16,185,129,0.06)' : 'transparent';

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 0.2s ease, transform 0.2s ease',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Accent glow top-right */}
            {accent && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '80px',
                    height: '80px',
                    background: `radial-gradient(circle at top right, ${accent}20, transparent 70%)`,
                    pointerEvents: 'none',
                }} />
            )}

            <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 500,
            }}>
                {label}
            </span>

            <span style={{
                fontSize: '26px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: accent || 'var(--text-primary)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
            }}>
                {value}
            </span>

            {sub && (
                <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: trendColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                }}>
                    {trend && <span>{trendIcons[trend]}</span>}
                    {sub}
                </span>
            )}
        </div>
    );
}