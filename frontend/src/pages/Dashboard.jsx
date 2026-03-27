import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCampaigns, getAgentRuns } from '../api/campaigns.js';
import { StatCard } from '../components/StatCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatDistanceToNow } from 'date-fns';
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from 'recharts';

export function Dashboard() {
    const [campaigns, setCampaigns] = useState([]);
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getCampaigns(), getAgentRuns()]).then(([c, r]) => {
            setCampaigns(c.data);
            setRuns(r.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <LoadingScreen />;

    const totalSpend = campaigns.reduce((s, c) => s + Number(c.spend), 0);
    const totalRevenue = campaigns.reduce((s, c) => s + Number(c.revenue), 0);
    const totalClicks = campaigns.reduce((s, c) => s + Number(c.clicks), 0);
    const overallRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00';
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;

    const spendData = campaigns.map((c) => ({
        name: c.name.split(' ').slice(0, 2).join(' '),
        spend: Number(c.spend),
        budget: Number(c.daily_budget),
        roas: Number(c.roas),
    }));

    return (
        <div className="animate-fade-in" style={{ padding: '28px 24px', maxWidth: '1280px', margin: '0 auto' }}>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                        System Overview
                    </h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
                    </p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 14px',
                    background: activeCampaigns > 0 ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                    border: `1px solid ${activeCampaigns > 0 ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                    borderRadius: '8px',
                }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: activeCampaigns > 0 ? '#10b981' : 'var(--text-muted)' }}>
                        {activeCampaigns}/{campaigns.length} campaigns active
                    </span>
                </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
                <StatCard label="Total Spend" value={`$${totalSpend.toFixed(2)}`} sub="today" accent="#f59e0b" />
                <StatCard label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} sub="today" accent="#10b981" />
                <StatCard
                    label="Overall ROAS"
                    value={`${overallRoas}x`}
                    sub={overallRoas >= 2 ? 'healthy' : 'needs attention'}
                    trend={overallRoas >= 2 ? 'up' : 'down'}
                />
                <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} sub="across all campaigns" />
            </div>

            {/* Charts + Runs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Spend vs Budget Chart */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px',
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <p className="section-label" style={{ marginBottom: '2px' }}>Spend vs Budget</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>per campaign</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={spendData}>
                            <defs>
                                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}
                                axisLine={false}
                                tickLine={false}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#13131c',
                                    border: '1px solid var(--border-bright)',
                                    borderRadius: '8px',
                                    fontFamily: 'JetBrains Mono',
                                    fontSize: '11px',
                                    color: 'var(--text-primary)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                }}
                                labelStyle={{ color: '#e8e8f0', marginBottom: '4px' }}
                                cursor={{ stroke: 'var(--border-bright)', strokeWidth: 1 }}
                            />
                            <Area type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={2} fill="url(#spendGrad)" dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }} name="Spend" />
                            <Line type="monotone" dataKey="budget" stroke="var(--border-accent)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="Budget" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Agent Runs */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <p className="section-label">Recent Agent Runs</p>
                        <Link to="/runs" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f59e0b', textDecoration: 'none', opacity: 0.8 }}>
                            View all →
                        </Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        {runs.slice(0, 5).map((run) => (
                            <Link
                                key={run.id}
                                to={`/runs/${run.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 12px',
                                    borderRadius: '7px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-surface)',
                                    transition: 'all 0.15s ease',
                                    cursor: 'pointer',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--border-bright)';
                                        e.currentTarget.style.background = 'var(--bg-elevated)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.background = 'var(--bg-surface)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <StatusBadge status={run.status} />
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            {run.id.slice(0, 10)}...
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                                            {run.decision_count} decisions
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                                            {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                                        </span>
                                        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>›</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {runs.length === 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '32px', textAlign: 'center' }}>
                                <span style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.3 }}>◎</span>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                                    No runs yet. Click RUN OPTIMIZER to start.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Campaign summary table */}
            <div style={{ marginTop: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p className="section-label">Campaign Summary</p>
                    <Link to="/campaigns" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f59e0b', textDecoration: 'none', opacity: 0.8 }}>
                        Manage campaigns →
                    </Link>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Status</th>
                            <th>Spend</th>
                            <th>Revenue</th>
                            <th>ROAS</th>
                            <th>CTR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {campaigns.slice(0, 4).map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <Link to={`/campaigns/${c.id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)', textDecoration: 'none', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                    >
                                        {c.name}
                                    </Link>
                                </td>
                                <td><StatusBadge status={c.status} /></td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#f59e0b' }}>${Number(c.spend).toFixed(2)}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#10b981' }}>${Number(c.revenue).toFixed(2)}</td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: Number(c.roas) >= 2 ? '#10b981' : '#ef4444' }}>
                                    {Number(c.roas).toFixed(2)}x
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {Number(c.ctr).toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LoadingScreen() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '14px' }}>
            <div style={{
                width: '36px',
                height: '36px',
                border: '2px solid var(--border-bright)',
                borderTopColor: '#f59e0b',
                borderRadius: '50%',
                animation: 'spin-slow 0.8s linear infinite',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                LOADING SYSTEM DATA...
            </span>
            <style>{`@keyframes spin-slow { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}