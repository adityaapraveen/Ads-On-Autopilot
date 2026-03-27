import { Link, useLocation } from 'react-router-dom';

const links = [
    { to: '/', label: 'Dashboard', icon: '⬡' },
    { to: '/campaigns', label: 'Campaigns', icon: '◈' },
    { to: '/runs', label: 'Agent Runs', icon: '◎' },
];

export function Navbar({ isRunning, onOptimize }) {
    return (
        <nav style={{
            borderBottom: '1px solid var(--border)',
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '0 24px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px', maxWidth: '1280px', margin: '0 auto' }}>
                {/* Logo + Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            boxShadow: '0 0 12px rgba(245, 158, 11, 0.3)',
                        }}>
                            ⚡
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: '#f59e0b', letterSpacing: '0.08em' }}>
                                ADS//AUTOPILOT
                            </span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginTop: '2px' }}>
                                AI-POWERED OPTIMIZER
                            </span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {links.map((l) => (
                            <NavLink key={l.to} to={l.to} label={l.label} icon={l.icon} />
                        ))}
                    </div>
                </div>

                {/* Run Button */}
                <button
                    onClick={onOptimize}
                    disabled={isRunning}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '8px 18px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '7px',
                        border: isRunning ? '1px solid var(--amber-dim)' : '1px solid rgba(245, 158, 11, 0.5)',
                        background: isRunning
                            ? 'rgba(245, 158, 11, 0.05)'
                            : 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))',
                        color: isRunning ? 'rgba(245, 158, 11, 0.5)' : '#f59e0b',
                        cursor: isRunning ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        letterSpacing: '0.05em',
                        boxShadow: isRunning ? 'none' : '0 2px 12px rgba(245, 158, 11, 0.15)',
                    }}
                    onMouseEnter={e => {
                        if (!isRunning) {
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = isRunning ? 'none' : '0 2px 12px rgba(245, 158, 11, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {isRunning ? (
                        <>
                            <span className="animate-pulse-amber" style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b' }} />
                            RUNNING...
                        </>
                    ) : (
                        <>
                            <span>▶</span>
                            RUN OPTIMIZER
                        </>
                    )}
                </button>
            </div>
        </nav>
    );
}

function NavLink({ to, label, icon }) {
    const { pathname } = useLocation();
    const active = pathname === to || (to !== '/' && pathname.startsWith(to));

    return (
        <Link
            to={to}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                borderRadius: '6px',
                transition: 'all 0.15s ease',
                textDecoration: 'none',
                background: active ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                border: active ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid transparent',
                color: active ? '#f59e0b' : 'var(--text-secondary)',
                letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-elevated)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                }
            }}
        >
            {label}
        </Link>
    );
}