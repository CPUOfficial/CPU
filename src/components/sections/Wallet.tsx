import { type AdminSettings } from '../../lib/supabase';

interface WalletProps {
  settings: AdminSettings | null;
}

export default function Wallet({ settings }: WalletProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'NOT CONFIGURED';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-4">
      <div className="doom-panel-dark">
        <div className="doom-header">
          <span>TREASURY WALLET</span>
        </div>
        <div className="border-2 border-white p-4 bg-black bg-opacity-50">
          {settings?.wallet_address ? (
            <div className="space-y-3">
              <div className="text-gray-200 font-bold text-lg">▸ Address:</div>
              <div className="text-cyan-400 break-all font-mono doom-glow p-3 border-2 border-cyan-400 bg-black bg-opacity-30 text-lg">
                {settings.wallet_address}
              </div>
              <button
                onClick={() => {
                  if (settings.wallet_address) {
                    navigator.clipboard.writeText(settings.wallet_address);
                  }
                }}
                className="doom-button w-full mt-2 text-lg"
              >
                ▶ COPY ADDRESS ◀
              </button>
            </div>
          ) : (
            <div className="text-yellow-300 text-center py-8">
              <div className="font-bold doom-glow text-2xl mb-3">
                ⚠ WALLET NOT CONFIGURED ⚠
              </div>
              <div className="text-gray-200 text-lg">Check Twitter For Future Announcements</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="doom-panel-dark">
          <div className="doom-header">
            <span>LAUNCH SCHEDULE</span>
          </div>
          <div className="space-y-3 text-gray-100">
            <div className="flex justify-between border-b-2 border-gray-700 pb-2 text-lg">
              <span>▸ Launch Time:</span>
              <span className="text-white font-bold">{formatDate(settings?.launch_time || null)}</span>
            </div>
            <div className="flex justify-between border-b-2 border-gray-700 pb-2 text-lg">
              <span>▸ Interval:</span>
              <span className="doom-badge text-lg">{settings?.deployment_interval || 20} MIN</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span>▸ Status:</span>
              <span className={settings?.deployment_active ? 'doom-badge-success doom-blink text-lg' : 'doom-badge-warning text-lg'}>
                {settings?.deployment_active ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        <div className="doom-panel-dark">
          <div className="doom-header">
            <span>OPERATIONS</span>
          </div>
          <div className="text-gray-100 space-y-3">
            <div className="flex items-center gap-3 text-lg">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <span>Creator rewards auto-route</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <span>Autonomous fund management</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <span>Zero manual intervention</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <span className="text-cyan-400 font-bold text-xl">✓</span>
              <span>Self-sustained deployment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
