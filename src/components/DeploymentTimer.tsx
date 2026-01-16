import { useState, useEffect, useRef } from 'react';
import { type AdminSettings } from '../lib/supabase';

interface DeploymentTimerProps {
  settings: AdminSettings | null;
}

export default function DeploymentTimer({ settings }: DeploymentTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--');
  const [isDeploying, setIsDeploying] = useState(false);
  const deploymentTriggered = useRef(false);

  const triggerDeployment = async () => {
    if (isDeploying || deploymentTriggered.current) return;

    setIsDeploying(true);
    deploymentTriggered.current = true;

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
        console.log('Automatic token generation successful');
      } else {
        console.error('Automatic token generation failed');
      }
    } catch (error) {
      console.error('Automatic token generation error:', error);
    } finally {
      setIsDeploying(false);
      setTimeout(() => {
        deploymentTriggered.current = false;
      }, 5000);
    }
  };

  useEffect(() => {
    if (!settings?.deployment_active || !settings?.last_deployment) {
      setTimeRemaining('STANDBY');
      return;
    }

    const interval = setInterval(() => {
      const lastDeploy = new Date(settings.last_deployment!).getTime();
      const nextDeploy = lastDeploy + settings.deployment_interval * 60 * 1000;
      const now = Date.now();
      const diff = nextDeploy - now;

      if (diff <= 0) {
        setTimeRemaining('DEPLOYING...');
        if (!deploymentTriggered.current && !isDeploying) {
          triggerDeployment();
        }
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        deploymentTriggered.current = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [settings, isDeploying]);

  return (
    <div className="border-2 border-white p-2" style={{ backgroundColor: '#000050' }}>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-gray-400">Interval</div>
          <div className="text-white font-bold">{settings?.deployment_interval || 20} MIN</div>
        </div>
        <div>
          <div className="text-gray-400">Status</div>
          <div className={`font-bold ${settings?.deployment_active ? 'text-cyan-400 doom-glow' : 'text-yellow-300 doom-glow'}`}>
            {settings?.deployment_active ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Next Deploy</div>
          <div className="text-yellow-300 font-bold doom-glow">{timeRemaining}</div>
        </div>
      </div>
    </div>
  );
}
