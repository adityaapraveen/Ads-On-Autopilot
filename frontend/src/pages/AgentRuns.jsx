import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAgentRuns } from '../api/campaigns.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDistanceToNow, format } from 'date-fns';

export function AgentRuns() {
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAgentRuns().then((r) => { setRuns(r.data); setLoading(false); });
    }, []);

    if (loading) return <PageLoader />;

    return (
        <div className="animate-fade-in" style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    Agent Runs
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {runs.length} total runs — AI optimization history
                </p>
            </div>

            {/* Run cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {runs.map((run, idx) => (
                    <Link key={run.id} to={`/runs/${run.id}`} style={{ textDecoration: 'none' }}>
                        <div
                            className="animate-fade-in"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                padding: '16px 20px',
                                transition: 'all 0.2s ease',
                                animationDelay: `${idx * 0.04}s`,
                                animationFillMode: 'both',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--border-bright)';
                                e.currentTarget.style.background = 'var(--bg-elevated)';
                                e.currentTarget.style.transform = 'translateX(3px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.background = 'var(--bg-card)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            {/* Top row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: run.summary ? '10px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <StatusBadge status={run.status} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.03em' }}>
                                        {run.id}
                                    </span>
                                </div>
                                <span style={{ color: 'var(--text-dim)', fontSize: '14px', transition: 'color 0.15s' }}>›</span>
                            </div>

                            {/* Meta pills */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                                <MetaPill label="decisions" value={run.decision_count} />
                                <MetaPill label="started" value={formatDistanceToNow(new Date(run.created_at), { addSuffix: true })} />
                                {run.completed_at && (
                                    <MetaPill label="completed" value={format(new Date(run.completed_at), 'HH:mm:ss')} />
                                )}
                            </div>

                            {/* Summary */}
                            {run.summary && (
                                <p style={{
                                    marginTop: '10px',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--text-muted)',
                                    lineHeight: 1.7,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    borderTop: '1px solid var(--border)',
                                    paddingTop: '10px',
                                }}>
                                    {run.summary}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}

                {runs.length === 0 && (
                    <div style={{
                        padding: '64px 24px',
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                    }}>
                        <div style={{ fontSize: '36px', marginBottom: '14px', opacity: 0.2 }}>◎</div>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                            No agent runs yet.
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                            Click RUN OPTIMIZER in the navbar to start.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetaPill({ label, value }) {
    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 9px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '5px',
        }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {value}
            </span>
        </div>
    );
}

function PageLoader() {
    return (
        <div style={{ padding: '28px 24px' }}>
            <div className="skeleton" style={{ height: '26px', width: '140px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '14px', width: '220px', marginBottom: '24px', borderRadius: '4px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '10px' }} />
                ))}
            </div>
        </div>
    );
}