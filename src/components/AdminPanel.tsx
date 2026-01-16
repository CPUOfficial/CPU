import { useState, useEffect } from 'react';
import { supabase, type AdminSettings, type Suggestion } from '../lib/supabase';
import DeploymentTimer from './DeploymentTimer';
import Popup from './Popup';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [launchTime, setLaunchTime] = useState('');
  const [deploymentInterval, setDeploymentInterval] = useState('20');
  const [deploymentActive, setDeploymentActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Next Token Deployment');

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenLogo, setTokenLogo] = useState('');
  const [tokenMarketCap, setTokenMarketCap] = useState('');
  const [tokenPumpFunUrl, setTokenPumpFunUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [tokenPriceSol, setTokenPriceSol] = useState('');
  const [tokenPriceUsd, setTokenPriceUsd] = useState('');
  const [tokenPriceChange, setTokenPriceChange] = useState('');
  const [tokenVolume24h, setTokenVolume24h] = useState('');
  const [tokenLiquidity, setTokenLiquidity] = useState('');
  const [tokenHolders, setTokenHolders] = useState('');
  const [tokenTransactions24h, setTokenTransactions24h] = useState('');
  const [tokenTotalSupply, setTokenTotalSupply] = useState('1000000000');
  const [tokenContractAddress, setTokenContractAddress] = useState('');

  useEffect(() => {
    if (authenticated) {
      fetchSettings();
      fetchSuggestions();
      fetchTokens();
    }
  }, [authenticated]);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (data) {
      setSettings(data);
      setWalletAddress(data.wallet_address || '');
      setLaunchTime(
        data.launch_time ? new Date(data.launch_time).toISOString().slice(0, 16) : ''
      );
      setDeploymentInterval(data.deployment_interval.toString());
      setDeploymentActive(data.deployment_active);
      setStatusMessage(data.status_message || 'Next Token Deployment');
    }
  };

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setSuggestions(data);
    }
  };

  const fetchTokens = async () => {
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .order('deployed_at', { ascending: false });

    if (data) {
      setTokens(data);
    }
  };

  const [adminPassword, setAdminPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'youaretheonlyone') {
      setAuthenticated(true);
      setAdminPassword(password);
      setError('');
    } else {
      setError('ACCESS DENIED');
    }
  };

  const callAdminOperation = async (operation: string, params: Record<string, any> = {}) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'X-Admin-Password': adminPassword,
          },
          body: JSON.stringify({ operation, ...params }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Operation failed');
      }

      return result;
    } catch (error) {
      console.error('Admin operation failed:', error);
      throw error;
    }
  };

  const updateSettings = async () => {
    try {
      await callAdminOperation('update_settings', {
        wallet_address: walletAddress,
        launch_time: launchTime,
        deployment_interval: deploymentInterval,
        deployment_active: deploymentActive,
        status_message: statusMessage,
      });
      setPopupMessage('CONFIGURATION UPDATED');
      fetchSettings();
    } catch (error) {
      setPopupMessage('UPDATE FAILED');
    }
  };

  const startDeployment = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        fetchTokens();
      }
    } catch (error) {
      console.error('Initial deployment failed:', error);
    }

    try {
      await callAdminOperation('start_deployment');
      setPopupMessage('DEPLOYMENT SYSTEM ACTIVATED');
      setDeploymentActive(true);
      fetchSettings();
    } catch (error) {
      setPopupMessage('DEPLOYMENT START FAILED');
    }
    setGenerating(false);
  };

  const stopDeployment = async () => {
    try {
      await callAdminOperation('stop_deployment');
      setPopupMessage('DEPLOYMENT SYSTEM DEACTIVATED');
      setDeploymentActive(false);
      fetchSettings();
    } catch (error) {
      setPopupMessage('DEPLOYMENT STOP FAILED');
    }
  };

  const deleteSuggestion = async (id: string) => {
    try {
      await callAdminOperation('delete_suggestion', { id });
      fetchSuggestions();
    } catch (error) {
      setPopupMessage('DELETE FAILED');
    }
  };

  const clearAllSuggestions = async () => {
    try {
      await callAdminOperation('clear_all_suggestions');
      fetchSuggestions();
      setPopupMessage('ALL SUGGESTIONS CLEARED');
    } catch (error) {
      setPopupMessage('CLEAR FAILED');
    }
  };

  const generateToken = async () => {
    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        setPopupMessage('TOKEN GENERATION SUCCESSFUL');
        fetchTokens();
      } else {
        setPopupMessage('TOKEN GENERATION FAILED');
      }
    } catch (error) {
      setPopupMessage('TOKEN GENERATION FAILED');
    }
    setGenerating(false);
  };

  const deleteToken = async (id: string) => {
    try {
      await callAdminOperation('delete_token', { id });
      fetchTokens();
      setPopupMessage('TOKEN DELETED');
    } catch (error) {
      setPopupMessage('DELETE FAILED');
    }
  };

  const clearAllTokens = async () => {
    try {
      await callAdminOperation('clear_all_tokens');
      fetchTokens();
      setPopupMessage('ALL TOKENS CLEARED');
    } catch (error) {
      setPopupMessage('CLEAR FAILED');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPopupMessage('FILE TOO LARGE (MAX 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTokenLogo(base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const createManualToken = async () => {
    if (!tokenName || !tokenSymbol || !tokenDescription) {
      setPopupMessage('NAME, SYMBOL, AND DESCRIPTION REQUIRED');
      return;
    }

    setGenerating(true);
    try {
      await callAdminOperation('create_manual_token', {
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        logo_seed: tokenName,
        logo_url: tokenLogo || null,
        market_cap: tokenMarketCap || '0',
        pump_fun_url: tokenPumpFunUrl || null,
        price_sol: tokenPriceSol || '0',
        price_usd: tokenPriceUsd || '0',
        price_change_24h: tokenPriceChange || '0',
        volume_24h_sol: tokenVolume24h || '0',
        liquidity_sol: tokenLiquidity || '0',
        holders: tokenHolders || '0',
        transactions_24h: tokenTransactions24h || '0',
        total_supply: tokenTotalSupply || '1000000000',
        contract_address: tokenContractAddress || null,
      });

      setPopupMessage('TOKEN CREATED SUCCESSFULLY');
      setTokenName('');
      setTokenSymbol('');
      setTokenDescription('');
      setTokenLogo('');
      setTokenMarketCap('');
      setTokenPumpFunUrl('');
      setLogoPreview('');
      setTokenPriceSol('');
      setTokenPriceUsd('');
      setTokenPriceChange('');
      setTokenVolume24h('');
      setTokenLiquidity('');
      setTokenHolders('');
      setTokenTransactions24h('');
      setTokenTotalSupply('1000000000');
      setTokenContractAddress('');
      fetchTokens();
    } catch (error) {
      setPopupMessage('TOKEN CREATION FAILED');
    }
    setGenerating(false);
  };

  if (!authenticated) {
    return (
      <div className="h-screen overflow-hidden p-6 flex items-center justify-center">
        <div className="doom-window p-3 max-w-md w-full">
          <div className="doom-title-bar mb-3 doom-text-shadow">
            ▶ ADMINISTRATOR ACCESS CONTROL
          </div>

          <div className="doom-panel-blue p-6">
            <div className="text-center mb-6">
              <div className="text-yellow-300 font-bold doom-glow text-xl mb-3 doom-blink">
                ⚠ [RESTRICTED ACCESS] ⚠
              </div>
              <div className="text-gray-300">
                Authorization Required
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 font-bold">▸ Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="doom-input w-full"
                  autoFocus
                />
              </div>

              {error && (
                <div className="border-2 border-red-500 bg-red-900 bg-opacity-50 p-3 text-center">
                  <p className="text-red-400 font-bold doom-glow">{error}</p>
                </div>
              )}

              <button type="submit" className="doom-button w-full">
                ▶ LOGIN ◀
              </button>

              <button
                type="button"
                onClick={onBack}
                className="doom-button w-full"
              >
                ◀ RETURN
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden p-6 flex items-center justify-center">
      <div className="max-w-6xl w-full h-full flex flex-col doom-window p-3">
        <div className="doom-title-bar mb-3 flex justify-between items-center flex-shrink-0">
          <span className="doom-text-shadow">▶ ADMINISTRATOR CONTROL PANEL</span>
          <button onClick={onBack} className="hover:text-yellow-300 px-3 border-l-2 border-white transition-all doom-text-shadow">
            [EXIT]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="doom-panel-blue">
              <div className="doom-header">
                <span>CONFIGURATION</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Wallet Address
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="doom-input w-full text-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Launch Time
                  </label>
                  <input
                    type="datetime-local"
                    value={launchTime}
                    onChange={(e) => setLaunchTime(e.target.value)}
                    className="doom-input w-full text-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={deploymentInterval}
                    onChange={(e) => setDeploymentInterval(e.target.value)}
                    className="doom-input w-full text-lg"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Status Message
                  </label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    className="doom-input w-full text-lg"
                    placeholder="Next Token Deployment"
                  />
                </div>

                <button
                  onClick={updateSettings}
                  className="doom-button w-full text-lg"
                >
                  ▶ SAVE CONFIG ◀
                </button>
              </div>
            </div>

            <div className="doom-panel-blue">
              <div className="doom-header">
                <span>DEPLOYMENT CONTROL</span>
              </div>

              <div className="space-y-3">
                <DeploymentTimer settings={settings} />

                <div className="border-2 border-white p-4 text-center bg-black bg-opacity-50">
                  <div className="text-gray-200 mb-2 font-bold text-lg">▸ Status</div>
                  <div
                    className={`font-bold text-2xl ${
                      deploymentActive ? 'text-cyan-400 doom-glow doom-blink' : 'text-yellow-300 doom-glow'
                    }`}
                  >
                    {deploymentActive ? '● ACTIVE' : '○ STANDBY'}
                  </div>
                </div>

                <button
                  onClick={startDeployment}
                  disabled={deploymentActive}
                  className="doom-button w-full disabled:opacity-50 text-lg"
                >
                  ▶ START DEPLOYMENT ◀
                </button>

                <button
                  onClick={stopDeployment}
                  disabled={!deploymentActive}
                  className="doom-button w-full disabled:opacity-50 text-lg"
                >
                  ◼ STOP DEPLOYMENT ◼
                </button>

                <div className="border-t-2 border-white pt-3">
                  <button
                    onClick={generateToken}
                    disabled={generating}
                    className="doom-button w-full disabled:opacity-50 text-lg"
                  >
                    {generating ? '▸▸▸ GENERATING...' : '▶ GENERATE TOKEN NOW ◀'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="doom-panel-blue mb-4">
            <div className="doom-header">
              <span>MANUAL TOKEN CREATION</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Token Name *
                  </label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="doom-input w-full text-lg"
                    placeholder="e.g., Bitcoin Protocol"
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Symbol *
                  </label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="doom-input w-full text-lg"
                    placeholder="e.g., BTC"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-200 mb-2 font-bold text-lg">
                  ▸ Description *
                </label>
                <textarea
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  className="doom-input w-full text-lg"
                  rows={4}
                  placeholder="Enter token description..."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Market Cap (USD)
                  </label>
                  <input
                    type="text"
                    value={tokenMarketCap}
                    onChange={(e) => setTokenMarketCap(e.target.value)}
                    className="doom-input w-full text-lg"
                    placeholder="0 or N/A"
                  />
                </div>

                <div>
                  <label className="block text-gray-200 mb-2 font-bold text-lg">
                    ▸ Pump.fun URL
                  </label>
                  <input
                    type="text"
                    value={tokenPumpFunUrl}
                    onChange={(e) => setTokenPumpFunUrl(e.target.value)}
                    className="doom-input w-full text-lg"
                    placeholder="https://pump.fun/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-200 mb-2 font-bold text-lg">
                  ▸ Token Logo
                </label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="doom-input w-full text-lg"
                    />
                    <div className="text-gray-300 text-sm mt-1">
                      Max 5MB • PNG, JPG, GIF, WebP
                    </div>
                  </div>
                  {logoPreview && (
                    <div className="border-2 border-white p-2 bg-black bg-opacity-50">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="doom-separator"></div>

              <div className="border-2 border-yellow-300 p-3 bg-black bg-opacity-30">
                <div className="text-yellow-300 font-bold mb-3 text-center">▸ PRICE & MARKET DATA ▸</div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Price (SOL)
                    </label>
                    <input
                      type="text"
                      value={tokenPriceSol}
                      onChange={(e) => setTokenPriceSol(e.target.value)}
                      className="doom-input w-full"
                      placeholder="0.000000001"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Price (USD)
                    </label>
                    <input
                      type="text"
                      value={tokenPriceUsd}
                      onChange={(e) => setTokenPriceUsd(e.target.value)}
                      className="doom-input w-full"
                      placeholder="0.00000001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ 24H Change (%)
                    </label>
                    <input
                      type="text"
                      value={tokenPriceChange}
                      onChange={(e) => setTokenPriceChange(e.target.value)}
                      className="doom-input w-full"
                      placeholder="+15.5 or -8.2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Volume 24H (SOL)
                    </label>
                    <input
                      type="text"
                      value={tokenVolume24h}
                      onChange={(e) => setTokenVolume24h(e.target.value)}
                      className="doom-input w-full"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Liquidity (SOL)
                    </label>
                    <input
                      type="text"
                      value={tokenLiquidity}
                      onChange={(e) => setTokenLiquidity(e.target.value)}
                      className="doom-input w-full"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Total Supply
                    </label>
                    <input
                      type="text"
                      value={tokenTotalSupply}
                      onChange={(e) => setTokenTotalSupply(e.target.value)}
                      className="doom-input w-full"
                      placeholder="1000000000"
                    />
                  </div>
                </div>
              </div>

              <div className="border-2 border-cyan-400 p-3 bg-black bg-opacity-30">
                <div className="text-cyan-400 font-bold mb-3 text-center">▸ COMMUNITY & ACTIVITY ▸</div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Holders
                    </label>
                    <input
                      type="text"
                      value={tokenHolders}
                      onChange={(e) => setTokenHolders(e.target.value)}
                      className="doom-input w-full"
                      placeholder="1500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-200 mb-2 font-bold">
                      ▸ Transactions 24H
                    </label>
                    <input
                      type="text"
                      value={tokenTransactions24h}
                      onChange={(e) => setTokenTransactions24h(e.target.value)}
                      className="doom-input w-full"
                      placeholder="850"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-200 mb-2 font-bold text-lg">
                  ▸ Contract Address (Solana)
                </label>
                <input
                  type="text"
                  value={tokenContractAddress}
                  onChange={(e) => setTokenContractAddress(e.target.value)}
                  className="doom-input w-full text-sm"
                  placeholder="Leave empty for auto-generate"
                  maxLength={44}
                />
              </div>

              <div className="border-t-2 border-white pt-3">
                <button
                  onClick={createManualToken}
                  disabled={generating || !tokenName || !tokenSymbol || !tokenDescription}
                  className="doom-button w-full disabled:opacity-50 text-lg"
                >
                  {generating ? '▸▸▸ CREATING TOKEN...' : '▶ CREATE TOKEN ◀'}
                </button>
              </div>

              <div className="border-2 border-yellow-300 p-3 bg-black bg-opacity-50">
                <p className="text-yellow-300 text-center text-sm">
                  ⚠ This token will appear as AI-generated to users ⚠
                </p>
              </div>
            </div>
          </div>

          <div className="doom-panel-blue mb-4">
            <div className="flex justify-between items-center doom-header">
              <span>TOKEN MANAGEMENT ({tokens.length})</span>
              <button
                onClick={clearAllTokens}
                className="doom-button"
              >
                PURGE ALL
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-yellow-300 font-bold doom-glow text-2xl">
                    ⚠ NO TOKENS DEPLOYED ⚠
                  </div>
                </div>
              ) : (
                tokens.map((token) => (
                  <div
                    key={token.id}
                    className="doom-list-item flex justify-between items-start gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-yellow-300 font-bold doom-glow text-lg">
                          ▸ {token.name} (${token.symbol})
                        </span>
                        <span className="text-gray-300 text-lg">
                          {new Date(token.deployed_at).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-100 leading-relaxed text-lg mb-2">{token.description}</p>
                      <div className="text-cyan-400 font-bold doom-glow">
                        Market Cap: ${token.market_cap.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteToken(token.id)}
                      className="doom-button flex-shrink-0 text-lg"
                    >
                      DEL
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="doom-panel-blue">
            <div className="flex justify-between items-center doom-header">
              <span>SUGGESTIONS MODERATION ({suggestions.length})</span>
              <button
                onClick={clearAllSuggestions}
                className="doom-button"
              >
                PURGE ALL
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-yellow-300 font-bold doom-glow text-2xl">
                    ⚠ NO RECORDS ⚠
                  </div>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="doom-list-item flex justify-between items-start gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-yellow-300 font-bold doom-glow text-lg">
                          ▸ {suggestion.username || 'ANON'}
                        </span>
                        <span className="text-gray-300 text-lg">
                          {new Date(suggestion.created_at).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-100 leading-relaxed text-lg">{suggestion.content}</p>
                    </div>
                    <button
                      onClick={() => deleteSuggestion(suggestion.id)}
                      className="doom-button flex-shrink-0 text-lg"
                    >
                      DEL
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="doom-footer mt-3 flex-shrink-0 flex justify-between">
          <span className="doom-text-shadow">ESC=Exit | All actions logged</span>
          <span className="text-yellow-300 doom-glow">▸ ADMIN MODE ACTIVE</span>
        </div>
      </div>
      {popupMessage && <Popup message={popupMessage} onClose={() => setPopupMessage('')} />}
    </div>
  );
}
