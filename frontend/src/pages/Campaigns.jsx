import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns, updateCampaign } from '../api/campaigns.js';
import { StatusBadge } from '../components/StatusBadge.jsx';

export function Campaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCampaigns().then((r) => { setCampaigns(r.data); setLoading(false); });
    }, []);

    const toggle = async (id, current) => {
        const status = current === 'active' ? 'paused' : 'active';
        await updateCampaign(id, { status });
        setCampaigns((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status } : c))
        );
    };

    if (loading) return <PageLoader />;

    const activeCnt = campaigns.filter(c => c.status === 'active').length;

    return (
        <div className="animate-fade-in" style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Campaigns</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {campaigns.length} total · {activeCnt} active
                    </p>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Status</th>
                            <th>Spend / Budget</th>
                            <th>ROAS</th>
                            <th>CTR</th>
                            <th>CPC</th>
                            <th>Revenue</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.map((c) => {
                            const pct = ((c.spend / c.daily_budget) * 100).toFixed(0);
                            const overBudget = Number(pct) >= 95;
                            return (
                                <tr key={c.id}>
                                    <td style={{ minWidth: '180px' }}>
                                        <Link
                                            to={`/campaigns/${c.id}`}
                                            style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', textDecoration: 'none', display: 'block', marginBottom: '2px', transition: 'color 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                        >
                                            {c.name}
                                        </Link>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                                            {c.keyword_count} keywords
                                        </span>
                                    </td>
                                    <td><StatusBadge status={c.status} /></td>
                                    <td style={{ minWidth: '160px' }}>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                            <span style={{ color: '#f59e0b' }}>${Number(c.spend).toFixed(2)}</span>
                                            <span style={{ color: 'var(--text-dim)' }}> / ${Number(c.daily_budget).toFixed(2)}</span>
                                        </div>
                                        <div className="progress-bar" style={{ width: '120px', marginBottom: '4px' }}>
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${Math.min(pct, 100)}%`,
                                                    background: overBudget
                                                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                                        : 'linear-gradient(90deg, #f59e0b, #d97706)',
                                                }}
                                            />
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: overBudget ? '#ef4444' : 'var(--text-dim)' }}>
                                            {pct}% used
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: Number(c.roas) >= 2 ? '#10b981' : '#ef4444' }}>
                                            {Number(c.roas).toFixed(2)}x
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {Number(c.ctr).toFixed(2)}%
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        ${Number(c.cpc).toFixed(2)}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#10b981', fontWeight: 500 }}>
                                        ${Number(c.revenue).toFixed(2)}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggle(c.id, c.status)}
                                            style={{
                                                fontSize: '11px',
                                                fontFamily: 'var(--font-mono)',
                                                padding: '5px 12px',
                                                borderRadius: '6px',
                                                border: `1px solid ${c.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                                background: c.status === 'active' ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                                                color: c.status === 'active' ? '#ef4444' : '#10b981',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.opacity = '0.75';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.opacity = '1';
                                            }}
                                        >
                                            {c.status === 'active' ? 'Pause' : 'Resume'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {campaigns.length === 0 && (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>No campaigns found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PageLoader() {
    return (
        <div style={{ padding: '28px 24px' }}>
            <div style={{ height: '28px', width: '140px', marginBottom: '24px' }} className="skeleton" />
            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div className="skeleton" style={{ height: '14px', width: '160px' }} />
                        <div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '5px' }} />
                        <div className="skeleton" style={{ height: '14px', width: '100px' }} />
                        <div className="skeleton" style={{ height: '14px', width: '50px', marginLeft: 'auto' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}