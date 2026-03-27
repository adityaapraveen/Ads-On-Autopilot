import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaign, updateKeyword } from '../api/campaigns.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { StatCard } from '../components/StatCard.jsx';

export function CampaignDetail() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCampaign(id).then((r) => { setCampaign(r.data); setLoading(false); });
    }, [id]);

    const toggleKeyword = async (kwId, current) => {
        const status = current === 'active' ? 'paused' : 'active';
        await updateKeyword(kwId, { status });
        setCampaign((prev) => ({
            ...prev,
            keywords: prev.keywords.map((k) => (k.id === kwId ? { ...k, status } : k)),
        }));
    };

    if (loading) return <PageLoader />;
    if (!campaign) return (
        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#ef4444' }}>Campaign not found.</p>
        </div>
    );

    const spendPct = ((campaign.spend / campaign.daily_budget) * 100).toFixed(0);
    const overBudget = Number(spendPct) >= 95;

    return (
        <div className="animate-fade-in" style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
                <Link to="/campaigns" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                    Campaigns
                </Link>
                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>›</span>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{campaign.name}</span>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
                        {campaign.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <StatusBadge status={campaign.status} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                            ID: {campaign.id.slice(0, 18)}...
                        </span>
                    </div>
                </div>
                {/* Budget usage pill */}
                <div style={{
                    padding: '10px 16px',
                    background: overBudget ? 'rgba(239,68,68,0.08)' : 'var(--bg-elevated)',
                    border: `1px solid ${overBudget ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    textAlign: 'right',
                }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Budget Usage</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ width: '80px' }}>
                            <div className="progress-bar-fill" style={{
                                width: `${Math.min(spendPct, 100)}%`,
                                background: overBudget ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#f59e0b,#d97706)',
                            }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: overBudget ? '#ef4444' : '#f59e0b' }}>
                            {spendPct}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <StatCard label="Spend" value={`$${Number(campaign.spend).toFixed(2)}`} sub={`of $${Number(campaign.daily_budget).toFixed(2)} budget`} accent="#f59e0b" />
                <StatCard label="Revenue" value={`$${Number(campaign.revenue).toFixed(2)}`} accent="#10b981" />
                <StatCard
                    label="ROAS"
                    value={`${Number(campaign.roas).toFixed(2)}x`}
                    trend={Number(campaign.roas) >= 2 ? 'up' : 'down'}
                    sub={Number(campaign.roas) >= 2 ? 'healthy' : 'low'}
                />
                <StatCard label="CTR" value={`${Number(campaign.ctr).toFixed(2)}%`} sub={`${campaign.clicks} clicks`} />
            </div>

            {/* Keywords table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="section-label">Keywords</p>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        {campaign.keywords.length} total
                    </span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Keyword</th>
                            <th>Status</th>
                            <th>Bid</th>
                            <th>Spend</th>
                            <th>Revenue</th>
                            <th>ROAS</th>
                            <th>CTR</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaign.keywords.map((kw) => (
                            <tr key={kw.id}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {kw.keyword}
                                </td>
                                <td><StatusBadge status={kw.status} /></td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f59e0b', fontWeight: 500 }}>
                                    ${Number(kw.bid).toFixed(2)}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    ${Number(kw.spend).toFixed(2)}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#10b981', fontWeight: 500 }}>
                                    ${Number(kw.revenue).toFixed(2)}
                                </td>
                                <td>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: Number(kw.roas) >= 2 ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                                        {Number(kw.roas).toFixed(2)}x
                                    </span>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {Number(kw.ctr).toFixed(2)}%
                                </td>
                                <td>
                                    <button
                                        onClick={() => toggleKeyword(kw.id, kw.status)}
                                        style={{
                                            fontSize: '11px',
                                            fontFamily: 'var(--font-mono)',
                                            padding: '4px 10px',
                                            borderRadius: '5px',
                                            border: `1px solid ${kw.status === 'active' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                            background: kw.status === 'active' ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                                            color: kw.status === 'active' ? '#ef4444' : '#10b981',
                                            cursor: 'pointer',
                                            transition: 'opacity 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                    >
                                        {kw.status === 'active' ? 'Pause' : 'Resume'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PageLoader() {
    return (
        <div style={{ padding: '28px 24px' }}>
            <div className="skeleton" style={{ height: '12px', width: '160px', marginBottom: '20px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '28px', width: '220px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '20px', width: '100px', marginBottom: '24px', borderRadius: '5px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '10px' }} />
                ))}
            </div>
            <div className="skeleton" style={{ height: '300px', borderRadius: '10px' }} />
        </div>
    );
}