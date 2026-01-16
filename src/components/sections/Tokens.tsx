import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase, type Token } from '../../lib/supabase';
import PixelLogo from '../PixelLogo';
import PixelChart from '../PixelChart';

export default function Tokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTokens();

    const channel = supabase
      .channel('tokens_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tokens' },
        () => {
          fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (componentRef.current) {
      const scrollParent = componentRef.current.closest('.overflow-y-auto');
      if (scrollParent) {
        scrollParent.scrollTop = 0;
      }
    }
  }, [selectedToken]);

  const tokenMetrics = useMemo(() => {
    if (!selectedToken) return null;

    const solPriceUsd = 190;
    const marketCapUsd = selectedToken.market_cap || 0;

    const priceSol = (selectedToken as any).price_sol || 0;
    const priceUsd = (selectedToken as any).price_usd || 0;
    const priceChange24h = (selectedToken as any).price_change_24h || 0;
    const volume24hSol = (selectedToken as any).volume_24h_sol || 0;
    const liquiditySol = (selectedToken as any).liquidity_sol || 0;
    const holders = (selectedToken as any).holders || 0;
    const transactions24h = (selectedToken as any).transactions_24h || 0;
    const supply = (selectedToken as any).total_supply || '1000000000';

    return {
      priceInSol: priceSol.toFixed(9),
      priceInUsd: priceUsd.toFixed(8),
      solPriceUsd: solPriceUsd.toFixed(2),
      supply: parseInt(supply).toLocaleString(),
      holders: holders.toLocaleString(),
      volume24hSol: volume24hSol.toLocaleString(),
      priceChange24h: priceChange24h.toFixed(2),
      liquiditySol: liquiditySol.toLocaleString(),
      transactions24h: transactions24h.toLocaleString(),
      buyTax: 0,
      sellTax: 0,
      marketCapSol: (marketCapUsd / solPriceUsd).toFixed(2),
      fullyDiluted: marketCapUsd.toLocaleString(),
    };
  }, [selectedToken]);

  const contractAddress = useMemo(() => {
    if (!selectedToken) return '';

    if ((selectedToken as any).contract_address) {
      return (selectedToken as any).contract_address;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let result = '';
    const seed = selectedToken.logo_seed;
    for (let i = 0; i < 44; i++) {
      const index = (seed.charCodeAt(i % seed.length) + i) % chars.length;
      result += chars[index];
    }
    return result;
  }, [selectedToken]);

  const fetchTokens = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .order('deployed_at', { ascending: false });

    if (data) {
      setTokens(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="doom-panel-dark text-center py-12">
        <div className="text-cyan-400 font-bold doom-glow doom-blink text-xl">
          ▸▸▸ LOADING DEPLOYMENT RECORDS ◂◂◂
        </div>
        <div className="text-gray-400 mt-3">Please wait...</div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="doom-panel-dark text-center py-12">
        <div className="text-yellow-300 font-bold doom-glow text-xl mb-3">
          ⚠ NO TOKENS DEPLOYED ⚠
        </div>
        <div className="text-gray-400 mt-3">
          ▸ Awaiting first autonomous deployment
        </div>
      </div>
    );
  }

  if (selectedToken && tokenMetrics) {
    return (
      <div ref={componentRef} className="space-y-4">
        <button
          onClick={() => setSelectedToken(null)}
          className="doom-button flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          ◀ BACK TO TOKEN LIST
        </button>

        <div className="doom-panel-gray p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {selectedToken.logo_url ? (
                <img
                  src={selectedToken.logo_url}
                  alt={`${selectedToken.name} logo`}
                  className="w-24 h-24 object-contain border-4 border-black"
                />
              ) : (
                <PixelLogo seed={selectedToken.logo_seed} size={96} />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-black doom-text-shadow mb-2">{selectedToken.name}</h2>
              <div className="text-blue-700 font-bold text-2xl mb-3">${selectedToken.symbol}</div>
              <p className="text-black leading-relaxed text-lg">▸ {selectedToken.description}</p>
            </div>
          </div>
        </div>

        <div className="doom-panel-dark">
          <div className="doom-header">
            <span className="doom-glow">▸ LIVE PRICE CHART ▸</span>
          </div>
          <div className="flex justify-center p-4">
            <PixelChart
              seed={selectedToken.logo_seed + selectedToken.id}
              width={600}
              height={240}
              priceData={(selectedToken as any).chart_data}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="doom-panel-dark border-4 border-yellow-300">
            <div className="text-center mb-3 pb-3 border-b-2 border-yellow-300">
              <div className="text-yellow-300 text-sm mb-1 doom-glow">PRICE (SOL)</div>
              <div className="text-yellow-300 font-bold text-2xl doom-glow">{tokenMetrics.priceInSol} ◎</div>
            </div>
            <div className="text-center mb-3 pb-3 border-b-2 border-white">
              <div className="text-gray-300 text-sm mb-1">PRICE (USD)</div>
              <div className="text-cyan-400 font-bold text-xl doom-glow">${tokenMetrics.priceInUsd}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-1">24H CHANGE</div>
              <div className={`font-bold text-2xl ${parseFloat(tokenMetrics.priceChange24h) >= 0 ? 'text-cyan-400 doom-glow' : 'text-red-400'}`}>
                {parseFloat(tokenMetrics.priceChange24h) >= 0 ? '+' : ''}{tokenMetrics.priceChange24h}%
              </div>
            </div>
          </div>

          <div className="doom-panel-dark border-4 border-cyan-400">
            <div className="text-center mb-3 pb-3 border-b-2 border-cyan-400">
              <div className="text-cyan-400 text-sm mb-1 doom-glow">MARKET CAP (SOL)</div>
              <div className="text-cyan-400 font-bold text-3xl doom-glow">{tokenMetrics.marketCapSol} ◎</div>
            </div>
            <div className="text-center mb-3 pb-3 border-b-2 border-white">
              <div className="text-gray-300 text-sm mb-1">MARKET CAP (USD)</div>
              <div className="text-white font-bold text-xl">${tokenMetrics.fullyDiluted}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-1">24H VOLUME (SOL)</div>
              <div className="text-cyan-400 font-bold text-xl">{tokenMetrics.volume24hSol} ◎</div>
            </div>
          </div>

          <div className="doom-panel-dark border-4 border-cyan-400">
            <div className="text-center mb-3 pb-3 border-b-2 border-cyan-400">
              <div className="text-cyan-400 text-sm mb-1 doom-glow">LIQUIDITY (SOL)</div>
              <div className="text-cyan-400 font-bold text-3xl doom-glow">{tokenMetrics.liquiditySol} ◎</div>
            </div>
            <div className="text-center mb-3 pb-3 border-b-2 border-white">
              <div className="text-gray-300 text-sm mb-1">HOLDERS</div>
              <div className="text-cyan-400 font-bold text-2xl doom-glow">{tokenMetrics.holders}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-300 text-xs mb-1">24H TRANSACTIONS</div>
              <div className="text-white font-bold text-xl">{tokenMetrics.transactions24h}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="doom-panel-dark flex flex-col">
            <div className="doom-header">SUPPLY INFORMATION</div>
            <div className="flex-1 flex flex-col space-y-3">
              <div className="border-2 border-white p-4 bg-black bg-opacity-50 flex-1 flex flex-col justify-center min-h-[6rem]">
                <div className="text-gray-300 text-sm mb-1">Total Supply</div>
                <div className="text-white font-bold text-xl">{tokenMetrics.supply}</div>
              </div>
              <div className="border-2 border-white p-4 bg-black bg-opacity-50 flex-1 flex flex-col justify-center min-h-[6rem]">
                <div className="text-gray-300 text-sm mb-1">Circulating Supply</div>
                <div className="text-white font-bold text-xl">{tokenMetrics.supply}</div>
              </div>
            </div>
          </div>

          <div className="doom-panel-dark flex flex-col">
            <div className="doom-header">CONTRACT DETAILS</div>
            <div className="flex-1 flex flex-col space-y-3">
              <div className="border-2 border-white p-4 bg-black bg-opacity-50 flex-1 flex flex-col justify-center min-h-[6rem]">
                <div className="text-gray-300 text-sm mb-1">Contract Address</div>
                <div className="text-yellow-300 font-mono text-xs break-all doom-glow">{contractAddress}</div>
              </div>
              <div className="border-2 border-white p-4 bg-black bg-opacity-50 flex-1 flex flex-col justify-center min-h-[6rem]">
                <div className="text-gray-300 text-sm mb-1">Deployed At</div>
                <div className="text-white font-bold text-xl">{formatDate(selectedToken.deployed_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {selectedToken.pump_fun_url && (
          <a
            href={selectedToken.pump_fun_url}
            target="_blank"
            rel="noopener noreferrer"
            className="doom-button w-full text-center block text-xl"
          >
            ▶ VIEW ON PUMP.FUN ◀
          </a>
        )}
      </div>
    );
  }

  return (
    <div ref={componentRef} className="space-y-4">
      <div className="doom-panel-gray p-3 text-black flex justify-between items-center">
        <span className="font-bold text-xl">▸ Total Deployed: <span className="doom-badge-success ml-2">{tokens.length}</span></span>
        <span className="font-bold text-xl">▸ Status: <span className="doom-badge-success ml-2">OPERATIONAL</span></span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token, index) => {
          const solPrice = 190;
          const marketCapSol = (token.market_cap / solPrice).toFixed(2);
          return (
            <div
              key={token.id}
              className="doom-panel-dark hover:border-yellow-300 transition-all cursor-pointer border-4 flex flex-col"
              onClick={() => setSelectedToken(token)}
            >
              <div className="flex items-center gap-3 pb-3 mb-3 border-b-2 border-yellow-300">
                <div className="flex-shrink-0">
                  {token.logo_url ? (
                    <img
                      src={token.logo_url}
                      alt={`${token.name} logo`}
                      className="w-14 h-14 object-contain border-2 border-yellow-300"
                    />
                  ) : (
                    <PixelLogo seed={token.logo_seed} size={56} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate doom-text-shadow text-xl">{token.name}</div>
                  <div className="text-yellow-300 doom-glow font-bold text-lg">${token.symbol}</div>
                </div>
              </div>
              <div className="text-gray-100 mb-4 leading-relaxed flex-grow" style={{ minHeight: '4em' }}>
                ▸ {token.description}
              </div>
              <div className="border-2 border-cyan-400 p-3 bg-black bg-opacity-70 mb-3">
                <div className="text-cyan-400 mb-2 font-bold text-center doom-glow">▸ MARKET CAP ▸</div>
                <div className="text-cyan-400 font-bold doom-glow text-2xl text-center">{marketCapSol} ◎</div>
                <div className="text-gray-300 text-sm text-center mt-1">${token.market_cap.toLocaleString()}</div>
              </div>
              <div className="border-2 border-blue-400 p-3 bg-black bg-opacity-70 mb-3">
                <div className="text-blue-400 mb-2 font-bold text-center">▸ DEPLOYED ▸</div>
                <div className="text-white font-bold text-center">{formatDate(token.deployed_at)}</div>
              </div>
              <div className="text-center text-yellow-300 font-bold doom-glow doom-blink text-lg">
                ▶ CLICK FOR DETAILS ◀
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
