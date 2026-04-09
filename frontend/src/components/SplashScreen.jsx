import { useEffect, useState } from 'react';

const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState('enter'); // enter → hold → exit

  useEffect(() => {
    // Phase 1: animate in (0–800ms)
    const holdTimer = setTimeout(() => setPhase('hold'), 800);
    // Phase 2: hold (800ms–2400ms)
    const exitTimer = setTimeout(() => setPhase('exit'), 2400);
    // Phase 3: exit animation finishes, reveal app (2400ms–3000ms)
    const doneTimer = setTimeout(() => onDone(), 3000);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4f46e5 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #818cf8, transparent)',
            top: '-80px', left: '-80px',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #c4b5fd, transparent)',
            bottom: '-60px', right: '-60px',
            animation: 'pulse 3s ease-in-out infinite 1.5s'
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #6366f1, transparent)',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            animation: 'pulse 4s ease-in-out infinite 0.5s'
          }}
        />
      </div>

      {/* Logo + text */}
      <div
        className={`flex flex-col items-center gap-6 transition-all duration-700 ${
          phase === 'enter' ? 'opacity-0 scale-90 translate-y-6' : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {/* Hexagon icon */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.25)' }}
          >
            {/* Hexagon SVG */}
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              <polygon
                points="24,4 42,14 42,34 24,44 6,34 6,14"
                fill="rgba(255,255,255,0.9)"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <polygon
                points="24,10 38,18 38,30 24,38 10,30 10,18"
                fill="rgba(79,70,229,0.8)"
              />
              <circle cx="24" cy="24" r="5" fill="white" />
            </svg>
          </div>
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-[28px] -z-10"
            style={{
              boxShadow: '0 0 60px 20px rgba(99,102,241,0.5)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1
            className="text-5xl font-black text-white tracking-tight leading-none"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
          >
            RESOLVE
          </h1>
          <p className="text-indigo-200 font-bold tracking-[0.4em] text-sm uppercase mt-2">
            City Portal
          </p>
        </div>

        {/* Tagline */}
        <p
          className={`text-indigo-200/70 text-sm font-medium text-center max-w-xs transition-all duration-700 delay-200 ${
            phase === 'enter' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          Your complaints. Our responsibility.
        </p>

        {/* Loading dots */}
        <div
          className={`flex gap-2 transition-all duration-700 delay-300 ${
            phase === 'enter' ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-2 h-2 bg-indigo-300 rounded-full"
              style={{ animation: `bounce 1s ease-in-out infinite ${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
