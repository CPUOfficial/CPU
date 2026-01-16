interface PixelLogoProps {
  seed: string;
  size?: number;
}

export default function PixelLogo({ seed, size = 48 }: PixelLogoProps) {
  const generatePixelArt = (seed: string) => {
    const hash = seed.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hash2 = seed.split('').reverse().reduce((acc, char) => {
      return char.charCodeAt(0) * 31 + acc;
    }, 0);

    const hash3 = seed.length * 1000 + seed.charCodeAt(0) * 100 + seed.charCodeAt(seed.length - 1);

    const colors = [
      '#00ff00', '#ffff00', '#ff0000', '#00ffff',
      '#ff00ff', '#ffffff', '#0000ff', '#ff6600',
      '#00ff88', '#ff0088', '#8800ff', '#ffaa00',
      '#00aaff', '#88ff00', '#ff0044', '#44ff00',
    ];

    const pixels: boolean[] = [];
    let tempHash = Math.abs(hash);
    let tempHash2 = Math.abs(hash2);

    for (let i = 0; i < 48; i++) {
      const bit1 = (tempHash & (1 << (i % 31))) !== 0;
      const bit2 = (tempHash2 & (1 << ((i * 3) % 31))) !== 0;
      const density = (Math.abs(hash3) % 100) / 100;
      pixels.push(bit1 || (bit2 && Math.random() < density));
    }

    const primaryColor = colors[Math.abs(hash) % colors.length];
    const secondaryColor = colors[(Math.abs(hash2) + 5) % colors.length];
    const accentColor = colors[(Math.abs(hash3) + 7) % colors.length];

    return { pixels, primaryColor, secondaryColor, accentColor };
  };

  const { pixels, primaryColor, secondaryColor, accentColor } = generatePixelArt(seed);
  const pixelSize = size / 8;

  return (
    <div
      className="inline-block border-2 border-white"
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        backgroundColor: '#000'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0 }}>
        {Array.from({ length: 64 }).map((_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const mirroredCol = col < 4 ? col : 7 - col;
          const pixelIndex = row * 4 + mirroredCol;
          const isOn = pixels[pixelIndex % pixels.length];
          const colorChoice = (row * 8 + col) % 5;
          let color = primaryColor;
          if (colorChoice === 1) color = secondaryColor;
          if (colorChoice === 2) color = accentColor;

          return (
            <div
              key={i}
              style={{
                width: pixelSize,
                height: pixelSize,
                backgroundColor: isOn ? color : 'transparent',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
