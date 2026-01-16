import { useEffect } from 'react';

interface PopupProps {
  message: string;
  onClose: () => void;
}

export default function Popup({ message, onClose }: PopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      <div className="doom-window p-3 max-w-md w-full relative z-10 animate-pulse">
        <div className="doom-panel-blue p-6 text-center">
          <div className="text-yellow-300 font-bold doom-glow text-xl doom-blink">
            ▸ {message} ▸
          </div>
        </div>
      </div>
    </div>
  );
}
