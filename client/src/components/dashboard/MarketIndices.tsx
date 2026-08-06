import React, { useEffect, useRef } from 'react';
import type { MarketIndex } from '../../services/api';
import { formatPercent } from '../../utils/formatters';

interface MarketIndicesProps {
  indices: MarketIndex[];
}

const SparklineCanvas: React.FC<{ isPositive: boolean }> = ({ isPositive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isPositive ? '#00e676' : '#ff3d57';

    const points = [15, 22, 18, 28, 25, 34, 30, 42, 38, 48];
    const step = canvas.width / (points.length - 1);

    ctx.moveTo(0, canvas.height - (points[0] / 50) * canvas.height);
    for (let i = 1; i < points.length; i++) {
      const y = isPositive
        ? canvas.height - (points[i] / 50) * canvas.height
        : (points[i] / 50) * canvas.height;
      ctx.lineTo(i * step, y);
    }
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, isPositive ? 'rgba(0, 230, 118, 0.25)' : 'rgba(255, 61, 87, 0.25)');
    gradient.addColorStop(1, 'transparent');
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [isPositive]);

  return <canvas ref={canvasRef} width={80} height={35} className="block" />;
};

export const MarketIndices: React.FC<MarketIndicesProps> = ({ indices }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <span>🇮🇳 Indian Benchmark Indices</span>
          <span className="badge-exchange text-[10px]">NSE / BSE</span>
        </h3>
        <span className="text-[11px] text-slate-400">Updated Real-Time</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {indices.map((idx) => {
          const isPositive = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="glass-card p-3.5 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                  <span>{idx.symbol}</span>
                  <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{idx.exchange}</span>
                </div>
                <div className="text-base font-extrabold font-mono text-white">
                  {idx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? `+${idx.change.toFixed(2)}` : idx.change.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    {formatPercent(idx.changePercent)}
                  </div>
                </div>

                <SparklineCanvas isPositive={isPositive} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
