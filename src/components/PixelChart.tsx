import { useEffect, useState } from 'react';

interface PixelChartProps {
  seed: string;
  width?: number;
  height?: number;
  priceData?: number[];
}

export default function PixelChart({ seed, width = 400, height = 200, priceData }: PixelChartProps) {
  const [data, setData] = useState<number[]>([]);
  const [animationOffset, setAnimationOffset] = useState(0);

  useEffect(() => {
    if (priceData && priceData.length > 0) {
      const min = Math.min(...priceData);
      const max = Math.max(...priceData);
      const range = max - min || 1;

      const normalizedData = priceData.map(val => {
        return ((val - min) / range) * 70 + 15;
      });

      setData(normalizedData);
    } else {
      const hash = seed.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);

      const random = (index: number) => {
        const x = Math.sin(Math.abs(hash) + index) * 10000;
        return x - Math.floor(x);
      };

      const points = 40;
      const baseValue = 50;
      const volatility = 30;
      const trend = random(1) > 0.5 ? 1 : -1;

      const chartData: number[] = [];
      let current = baseValue + random(0) * 20;

      for (let i = 0; i < points; i++) {
        const noise = (random(i * 2) - 0.5) * volatility;
        const trendEffect = trend * (i / points) * 15;
        current = Math.max(10, Math.min(90, current + noise + trendEffect));
        chartData.push(current);
      }

      setData(chartData);
    }

    const interval = setInterval(() => {
      setAnimationOffset((prev) => (prev + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, [seed, priceData]);

  const pixelSize = 4;
  const cols = Math.floor(width / pixelSize);
  const rows = Math.floor(height / pixelSize);

  const getPixelColor = (col: number, row: number) => {
    if (data.length === 0) return 'transparent';

    const dataIndex = Math.floor((col / cols) * data.length);
    const value = data[dataIndex];
    const normalizedRow = (rows - row) / rows * 100;

    const isLine = Math.abs(normalizedRow - value) < 3;
    const isFilled = normalizedRow < value;

    if (isLine) {
      const pulse = Math.sin((animationOffset + col) * 0.1) * 0.3 + 0.7;
      return `rgba(10, 173, 179, ${pulse})`;
    }

    if (isFilled) {
      const alpha = (normalizedRow / value) * 0.3;
      return `rgba(8, 137, 142, ${alpha})`;
    }

    const isGrid = col % 8 === 0 || row % 8 === 0;
    if (isGrid) {
      return 'rgba(6, 106, 110, 0.2)';
    }

    return 'transparent';
  };

  return (
    <div
      className="border-2 border-cyan-400"
      style={{
        width,
        height,
        backgroundColor: '#000',
        position: 'relative',
        imageRendering: 'pixelated',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
          gap: 0,
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          return (
            <div
              key={i}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: getPixelColor(col, row),
              }}
            />
          );
        })}
      </div>

      <div
        className="absolute top-2 left-2 text-cyan-400 font-bold text-xs doom-glow"
        style={{ fontFamily: 'monospace' }}
      >
        [LIVE]
      </div>

      <div
        className="absolute bottom-2 left-2 text-cyan-400 font-bold text-xs"
        style={{ fontFamily: 'monospace' }}
      >
        ▸ 24H PRICE ACTION
      </div>
    </div>
  );
}
