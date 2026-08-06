import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { formatINR, formatPercent } from '../../utils/formatters';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartProps {
  symbol: string;
  stockName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
}

export const TradingViewChart: React.FC<ChartProps> = ({
  symbol,
  stockName,
  currentPrice,
  priceChange,
  priceChangePercent
}) => {
  const [chartType, setChartType] = useState<'candlestick' | 'area' | 'line' | 'heikinAshi'>('candlestick');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [indicators, setIndicators] = useState<{ [key: string]: boolean }>({
    ema: true,
    vwap: true,
    volume: true,
    rsi: false,
    bollinger: false
  });
  const [candles, setCandles] = useState<Candle[]>([]);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = currentPrice || 3000;
    const points = timeframe === '1D' ? 40 : timeframe === '5D' ? 60 : timeframe === '1M' ? 30 : 90;
    const generated: Candle[] = [];
    let p = base * 0.95;

    for (let i = 0; i < points; i++) {
      const open = p;
      const change = (Math.random() - 0.48) * (base * 0.015);
      const close = Math.max(1, open + change);
      const high = Math.max(open, close) + Math.random() * (base * 0.008);
      const low = Math.min(open, close) - Math.random() * (base * 0.008);
      const volume = Math.floor(20000 + Math.random() * 80000);

      const d = new Date();
      d.setMinutes(d.getMinutes() - (points - i) * (timeframe === '1D' ? 5 : 60));

      generated.push({
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume
      });
      p = close;
    }

    if (generated.length > 0) {
      generated[generated.length - 1].close = currentPrice;
    }

    setCandles(generated);
    setHoveredCandle(generated[generated.length - 1]);
  }, [symbol, timeframe, currentPrice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const minPrice = Math.min(...candles.map(c => c.low)) * 0.995;
    const maxPrice = Math.max(...candles.map(c => c.high)) * 1.005;
    const priceRange = maxPrice - minPrice || 1;

    const chartBottom = indicators.volume ? height * 0.78 : height - 30;
    const chartHeight = chartBottom - 20;

    const step = width / (candles.length - 1 || 1);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter';

    for (let i = 1; i <= 4; i++) {
      const y = 20 + (chartHeight / 5) * i;
      const priceVal = maxPrice - (priceRange / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`₹${priceVal.toFixed(2)}`, width - 65, y - 4);
    }

    if (chartType === 'area' || chartType === 'line') {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = priceChange >= 0 ? '#00e676' : '#ff3d57';

      candles.forEach((c, idx) => {
        const x = idx * step;
        const y = chartBottom - ((c.close - minPrice) / priceRange) * chartHeight;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      if (chartType === 'area') {
        const grad = ctx.createLinearGradient(0, 0, 0, chartBottom);
        grad.addColorStop(0, priceChange >= 0 ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 61, 87, 0.3)');
        grad.addColorStop(1, 'transparent');
        ctx.lineTo(width, chartBottom);
        ctx.lineTo(0, chartBottom);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    } else {
      const candleWidth = Math.max(2, step * 0.65);

      candles.forEach((c, idx) => {
        const x = idx * step;
        const openY = chartBottom - ((c.open - minPrice) / priceRange) * chartHeight;
        const closeY = chartBottom - ((c.close - minPrice) / priceRange) * chartHeight;
        const highY = chartBottom - ((c.high - minPrice) / priceRange) * chartHeight;
        const lowY = chartBottom - ((c.low - minPrice) / priceRange) * chartHeight;

        const isBullish = c.close >= c.open;
        const color = isBullish ? '#00e676' : '#ff3d57';

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        ctx.fillStyle = color;
        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(closeY - openY));
        ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight);
      });
    }

    if (indicators.ema) {
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#00f2fe';
      const period = 5;
      candles.forEach((_, idx) => {
        if (idx < period) return;
        const slice = candles.slice(idx - period, idx);
        const avg = slice.reduce((sum, item) => sum + item.close, 0) / period;
        const x = idx * step;
        const y = chartBottom - ((avg - minPrice) / priceRange) * chartHeight;
        if (idx === period) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    if (indicators.volume) {
      const maxVol = Math.max(...candles.map(c => c.volume));
      const volTop = chartBottom + 10;
      const volHeight = height - volTop - 20;

      candles.forEach((c, idx) => {
        const x = idx * step;
        const barH = (c.volume / maxVol) * volHeight;
        ctx.fillStyle = c.close >= c.open ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 61, 87, 0.4)';
        ctx.fillRect(x - 2, height - barH - 10, 4, barH);
      });
    }
  }, [candles, chartType, indicators, priceChange]);

  const toggleIndicator = (key: string) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div ref={containerRef} className={`glass-card p-5 space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-8' : ''}`}>
      
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight">{symbol}</h2>
            <span className="badge-exchange">NSE</span>
            <span className="text-xs text-slate-400 font-medium">{stockName}</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-extrabold font-mono text-white">{formatINR(currentPrice)}</span>
            <span className={priceChange >= 0 ? "badge-gain text-sm" : "badge-loss text-sm"}>
              {formatINR(priceChange, { showSign: true })} ({formatPercent(priceChangePercent)})
            </span>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10">
          {['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'MAX'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setChartType('candlestick')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold ${chartType === 'candlestick' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}
          >
            📊 Candlestick
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold ${chartType === 'area' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}
          >
            📈 Area
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold ${chartType === 'line' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}
          >
            📉 Line
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Indicators:</span>
          {['ema', 'vwap', 'volume', 'rsi', 'bollinger'].map((ind) => (
            <button
              key={ind}
              onClick={() => toggleIndicator(ind)}
              className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] border transition-all ${
                indicators[ind]
                  ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                  : 'bg-slate-900/50 text-slate-500 border-white/5 hover:text-slate-300'
              }`}
            >
              {ind}
            </button>
          ))}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 ml-2"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {hoveredCandle && (
        <div className="flex items-center gap-4 text-xs font-mono bg-slate-900/40 p-2.5 rounded-xl border border-white/5 text-slate-300">
          <span>Time: <strong className="text-white">{hoveredCandle.time}</strong></span>
          <span>Open: <strong className="text-white">{formatINR(hoveredCandle.open)}</strong></span>
          <span>High: <strong className="text-emerald-400">{formatINR(hoveredCandle.high)}</strong></span>
          <span>Low: <strong className="text-rose-400">{formatINR(hoveredCandle.low)}</strong></span>
          <span>Close: <strong className="text-white">{formatINR(hoveredCandle.close)}</strong></span>
          <span>Vol: <strong className="text-cyan-300">{hoveredCandle.volume.toLocaleString('en-IN')}</strong></span>
        </div>
      )}

      <div className="relative w-full h-96 bg-slate-950/80 rounded-2xl border border-white/5 p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={380}
          className="w-full h-full block cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const idx = Math.floor((x / rect.width) * candles.length);
            if (candles[idx]) setHoveredCandle(candles[idx]);
          }}
        />
      </div>

    </div>
  );
};
