import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgentRun } from '../api/campaigns.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { format } from 'date-fns';

const agentConfig = {
    analyst: { color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', label: 'Analyst' },
    bidOptimizer: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', label: 'Bid Optimizer' },
    budgetManager: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', label: 'Budget Manager' },
    reporter: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Reporter' },
};

const defaultAgent = { color: 'var(--text-secondary)', bg: 'var(--bg-elevated)', border: 'var(--border)', label: null };

export function RunDetail() {
    const { id } = useParams();
    const [run, setRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        getAgentRun(id).then((r) => { setRun(r.data); setLoading(false); });
    }, [id]);

    if (loading) return <PageLoader />;
    if (!run) return (
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#ef4444' }}>Run not found.</p>
        </div>
    );

    const decisions = run.decisions || [];

    return (
        <div className="animate-fade-in" style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <Link to="/runs" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    Agent Runs
                </Link>
                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>›</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {run.id.slice(0, 16)}...
                </span>
            </div>

            {/* Run header */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <StatusBadge status={run.status} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.03em' }}>
                            {run.id}
                        </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '5px', padding: '3px 9px' }}>
                        {decisions.length} decisions
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <TimeInfo label="Started" value={format(new Date(run.created_at), 'yyyy-MM-dd HH:mm:ss')} />
                    {run.completed_at && (
                        <TimeInfo label="Completed" value={format(new Date(run.completed_at), 'HH:mm:ss')} />
                    )}
                </div>
            </div>

            {/* Summary */}
            {run.summary && (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '16px',
                }}>
                    <p className="section-label" style={{ marginBottom: '10px' }}>Agent Summary</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                        {run.summary}
                    </p>
                </div>
            )}

            {/* Decision log */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <p className="section-label">Decision Log</p>
                    {decisions.length > 0 && (
                        <button
                            onClick={() => setExpanded(expanded !== null ? null : 0)}
                            style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                            {expanded !== null ? 'Collapse all' : 'Expand first'}
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {decisions.map((d, i) => {
                        const cfg = agentConfig[d.agent_name] || defaultAgent;
                        const isOpen = expanded === i;

                        return (
                            <div
                                key={d.id}
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    transition: 'border-color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = isOpen ? 'var(--border-bright)' : 'var(--border)'}
                            >
                                <button
                                    onClick={() => setExpanded(isOpen ? null : i)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '12px 16px',
                                        background: isOpen ? 'var(--bg-elevated)' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        {/* Agent badge */}
                                        <span style={{
                                            fontSize: '10px',
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: 600,
                                            padding: '3px 9px',
                                            borderRadius: '5px',
                                            background: cfg.bg,
                                            border: `1px solid ${cfg.border}`,
                                            color: cfg.color,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {cfg.label || d.agent_name}
                                        </span>

                                        {/* Action */}
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>
                                            {d.action}
                                        </span>

                                        {/* Entity */}
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {d.entity_name}
                                        </span>

                                        {/* Entity type */}
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 7px' }}>
                                            {d.entity_type}
                                        </span>
                                    </div>

                                    <span style={{
                                        color: 'var(--text-dim)',
                                        fontSize: '12px',
                                        transition: 'transform 0.2s ease, color 0.15s',
                                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                        display: 'inline-block',
                                        marginLeft: '12px',
                                        flexShrink: 0,
                                    }}>
                                        ▶
                                    </span>
                                </button>

                                {isOpen && (
                                    <div style={{
                                        borderTop: '1px solid var(--border)',
                                        background: 'var(--bg-surface)',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                    }}>
                                        {/* Reason */}
                                        <div>
                                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                                                Reason
                                            </p>
                                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                                {d.reason}
                                            </p>
                                        </div>

                                        {/* Before / After */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <StateDiff label="Before" data={d.before_state} />
                                            <StateDiff label="After" data={d.after_state} color="#10b981" />
                                        </div>

                                        {/* Timestamp */}
                                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', textAlign: 'right' }}>
                                            {format(new Date(d.created_at), 'HH:mm:ss.SSS')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {decisions.length === 0 && (
                        <div style={{
                            padding: '48px 24px',
                            textAlign: 'center',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                        }}>
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
                                No decisions logged for this run.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StateDiff({ label, data, color }) {
    return (
        <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: color || 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                {label}
            </p>
            <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: color ? `${color}cc` : 'var(--text-secondary)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '10px 12px',
                overflow: 'auto',
                maxHeight: '160px',
                lineHeight: 1.6,
            }}>
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}

function TimeInfo({ label, value }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>{value}</span>
        </div>
    );
}

function PageLoader() {
    return (
        <div style={{ padding: '28px 24px' }}>
            <div className="skeleton" style={{ height: '12px', width: '200px', marginBottom: '20px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '90px', width: '100%', borderRadius: '10px', marginBottom: '14px' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%', borderRadius: '10px', marginBottom: '14px' }} />
            {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '52px', width: '100%', borderRadius: '8px', marginBottom: '6px' }} />
            ))}
        </div>
    );
}