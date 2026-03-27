import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Campaigns } from './pages/Campaigns.jsx';
import { CampaignDetail } from './pages/CampaignDetail.jsx';
import { AgentRuns } from './pages/AgentRuns.jsx';
import { RunDetail } from './pages/RunDetail.jsx';
import { triggerOptimize, getOptimizeStatus } from './api/campaigns.js';
import { usePolling } from './hooks/usePolling.js';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await getOptimizeStatus();
      setIsRunning(res.isRunning);
    } catch { }
  }, []);

  useEffect(() => { checkStatus(); }, [checkStatus]);
  usePolling(checkStatus, 5000);

  const handleOptimize = async () => {
    if (isRunning) return;
    try {
      await triggerOptimize();
      setIsRunning(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        <Navbar isRunning={isRunning} onOptimize={handleOptimize} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/runs" element={<AgentRuns />} />
            <Route path="/runs/:id" element={<RunDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}