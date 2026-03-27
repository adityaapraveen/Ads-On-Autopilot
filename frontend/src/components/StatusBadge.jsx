const config = {
    active: {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.25)',
        color: '#10b981',
        dot: '#10b981',
    },
    paused: {
        bg: 'rgba(128, 128, 160, 0.08)',
        border: 'rgba(128, 128, 160, 0.15)',
        color: 'var(--text-muted)',
        dot: null,
    },
    running: {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.25)',
        color: '#f59e0b',
        dot: '#f59e0b',
    },
    completed: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'rgba(59, 130, 246, 0.2)',
        color: '#60a5fa',
        dot: null,
    },
    failed: {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
        dot: null,
    },
};

export function StatusBadge({ status }) {
    const s = config[status] || config.paused;

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            borderRadius: '5px',
            background: s.bg,
            border: `1px solid ${s.border}`,
            color: s.color,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
        }}>
            {s.dot && (
                <span
                    className={status === 'running' ? 'animate-pulse-amber' : ''}
                    style={{
                        display: 'inline-block',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: s.dot,
                        flexShrink: 0,
                    }}
                />
            )}
            {status}
        </span>
    );
}