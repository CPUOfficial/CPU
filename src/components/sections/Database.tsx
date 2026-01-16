import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Database() {
  const [stats, setStats] = useState({
    totalTokens: 0,
    totalSuggestions: 0,
    lastDeployment: null as string | null,
    deploymentActive: false,
  });

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    const [tokensResult, suggestionsResult, settingsResult] = await Promise.all([
      supabase.from('tokens').select('id', { count: 'exact' }),
      supabase.from('suggestions').select('id', { count: 'exact' }),
      supabase
        .from('admin_settings')
        .select('last_deployment, deployment_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle(),
    ]);

    setStats({
      totalTokens: tokensResult.count || 0,
      totalSuggestions: suggestionsResult.count || 0,
      lastDeployment: settingsResult.data?.last_deployment || null,
      deploymentActive: settingsResult.data?.deployment_active || false,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'NEVER';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="doom-panel-dark text-center">
          <div className="doom-header text-center">
            <span>DEPLOY</span>
          </div>
          <div className="space-y-3">
            <div className={`font-bold ${stats.deploymentActive ? 'doom-badge-success doom-blink' : 'doom-badge-warning'} w-full text-xl`}>
              {stats.deploymentActive ? '● ACTIVE' : '○ STANDBY'}
            </div>
            <div className="text-gray-300 font-bold">
              {formatDate(stats.lastDeployment)}
            </div>
          </div>
        </div>

        <div className="doom-panel-dark text-center">
          <div className="doom-header text-center">
            <span>TOKENS</span>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-bold text-cyan-400 doom-glow">
              {stats.totalTokens}
            </div>
            <div className="doom-badge w-full">AUTO RATE</div>
          </div>
        </div>

        <div className="doom-panel-dark text-center">
          <div className="doom-header text-center">
            <span>COMMUNITY</span>
          </div>
          <div className="space-y-3">
            <div className="text-4xl font-bold text-cyan-400 doom-glow">
              {stats.totalSuggestions}
            </div>
            <div className="doom-badge-success w-full">REAL-TIME</div>
          </div>
        </div>

        <div className="doom-panel-dark text-center">
          <div className="doom-header text-center">
            <span>PROTOCOL</span>
          </div>
          <div className="space-y-2">
            <div className="doom-badge-success w-full">▸ AI ONLINE</div>
            <div className="doom-badge-success w-full">▸ DB CONNECTED</div>
          </div>
        </div>
      </div>

      <div className="doom-panel-dark">
        <div className="doom-header">
          <span>DATABASE TABLES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-gray-700 p-4 bg-black bg-opacity-40 hover:border-cyan-400 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-white doom-text-shadow text-xl">admin_settings</span>
              <span className="doom-badge-success text-lg">ACTIVE</span>
            </div>
            <div className="text-gray-200 text-lg">▸ Core configuration table</div>
          </div>
          <div className="border-2 border-gray-700 p-4 bg-black bg-opacity-40 hover:border-cyan-400 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-white doom-text-shadow text-xl">tokens</span>
              <span className="doom-badge-success text-lg">{stats.totalTokens} REC</span>
            </div>
            <div className="text-gray-200 text-lg">▸ Deployment records</div>
          </div>
          <div className="border-2 border-gray-700 p-4 bg-black bg-opacity-40 hover:border-cyan-400 transition-all">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-white doom-text-shadow text-xl">suggestions</span>
              <span className="doom-badge-success text-lg">{stats.totalSuggestions} REC</span>
            </div>
            <div className="text-gray-200 text-lg">▸ Community feedback</div>
          </div>
        </div>
      </div>
    </div>
  );
}
