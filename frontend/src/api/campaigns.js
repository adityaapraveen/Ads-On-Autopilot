import client from './client.js';

export const getCampaigns = () => client.get('/campaigns');
export const getCampaign = (id) => client.get(`/campaigns/${id}`);
export const updateCampaign = (id, data) => client.patch(`/campaigns/${id}`, data);
export const updateKeyword = (id, data) => client.patch(`/keywords/${id}`, data);
export const getAgentRuns = () => client.get('/agent-runs');
export const getAgentRun = (id) => client.get(`/agent-runs/${id}`);
export const triggerOptimize = () => client.post('/optimize');
export const getOptimizeStatus = () => client.get('/optimize/status');