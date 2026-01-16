import { useState, useEffect, useRef } from 'react';
import { supabase, type AdminSettings } from '../lib/supabase';
import About from './sections/About';
import Wallet from './sections/Wallet';
import Tokens from './sections/Tokens';
import Suggestions from './sections/Suggestions';
import Database from './sections/Database';

interface MainLayoutProps {
  navigate: (path: string) => void;
}

export default function MainLayout({ navigate }: MainLayoutProps) {
  const [activeTab, setActiveTab] = useState('about');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [stats, setStats] = useState({
    totalTokens: 0,
    deploymentActive: false,
    statusMessage: 'Next Token Deployment',
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSettings();
    fetchStats();

    const channel = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_settings' },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    const statsInterval = setInterval(fetchStats, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const fetchStats = async () => {
    const [tokensResult, settingsResult] = await Promise.all([
      supabase.from('tokens').select('id', { count: 'exact' }),
      supabase
        .from('admin_settings')
        .select('deployment_active, status_message')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle(),
    ]);

    setStats({
      totalTokens: tokensResult.count || 0,
      deploymentActive: settingsResult.data?.deployment_active || false,
      statusMessage: settingsResult.data?.status_message || 'Next Token Deployment',
    });
  };

  const tabs = [
    { id: 'about', label: 'ABOUT' },
    { id: 'wallet', label: 'WALLET' },
    { id: 'tokens', label: 'TOKENS' },
    { id: 'suggestions', label: 'FEEDBACK' },
    { id: 'database', label: 'DATABASE' },
  ];

  return (
    <div className="h-screen overflow-hidden p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full h-full flex flex-col doom-window p-3">
        <div className="doom-title-bar mb-3 flex-shrink-0 flex justify-between items-center">
          <span className="doom-text-shadow">▶ CPU v2.0 - AUTONOMOUS TOKEN DEPLOYMENT SYSTEM</span>
          <span className="doom-text-shadow text-sm">{settings?.wallet_address || 'Treasury Not Set'}</span>
        </div>

        <div className="doom-panel-gray p-4 mb-3 text-black flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">▸ DEPLOYED:</span>
                <span className="doom-badge-success text-lg">{stats.totalTokens}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">▸ INTERVAL:</span>
                <span className="doom-badge text-lg">{settings?.deployment_interval || 20} MIN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">▸ STATUS:</span>
                <span className={stats.deploymentActive ? 'doom-badge-success doom-blink text-lg' : 'doom-badge-warning text-lg text-white'}>
                  {stats.deploymentActive ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/cpu_info"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#08898e] font-bold transition-all text-lg"
                style={{ color: '#066a6e' }}
              >
                @cpu_info
              </a>
              <span className="text-black">|</span>
              <a
                href="https://github.com/CPUOfficial/CPU"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#08898e] font-bold transition-all text-lg"
                style={{ color: '#066a6e' }}
              >
                DOCS
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-3 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                activeTab === tab.id ? 'doom-button-active' : 'doom-button'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div ref={scrollContainerRef} className="doom-panel-blue flex-1 overflow-y-auto">
          {activeTab === 'about' && <About />}
          {activeTab === 'wallet' && <Wallet settings={settings} />}
          {activeTab === 'tokens' && <Tokens />}
          {activeTab === 'suggestions' && <Suggestions />}
          {activeTab === 'database' && <Database />}
        </div>

        <div className="doom-footer mt-3 flex-shrink-0 flex justify-between items-center">
          <span className="doom-text-shadow">ESC=Exit | ENTER=Select | F1=Help | TAB=Next</span>
          <div className="flex items-center gap-4">
            <span className="text-yellow-300 doom-glow">▸ {settings?.wallet_address || 'Not Set'}</span>
            <span className="text-yellow-300">|</span>
            <a
              href="https://github.com/CPUOfficial/CPU"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-300 doom-glow hover:text-yellow-400 transition-all"
            >
              ▸ DOCS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
