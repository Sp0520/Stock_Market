import React, { useState } from 'react';
import { Calculator, Star } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export const MutualFundsView: React.FC = () => {
  const [monthlySip, setMonthlySip] = useState<number>(10000);
  const [expectedReturn, setExpectedReturn] = useState<number>(15);
  const [investmentYears, setInvestmentYears] = useState<number>(10);

  const totalMonths = investmentYears * 12;
  const monthlyRate = expectedReturn / 12 / 100;
  const totalInvested = monthlySip * totalMonths;
  const estimatedFutureValue = Math.round(
    monthlySip * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );
  const estimatedWealthGain = estimatedFutureValue - totalInvested;

  const funds = [
    {
      id: "mf-1",
      name: "Parag Parikh Flexi Cap Fund Direct-Growth",
      category: "Equity - Flexi Cap",
      nav: "₹82.45",
      cagr3Y: "21.45%",
      cagr5Y: "23.10%",
      rating: "5 Star",
      expenseRatio: "0.62%",
      fundSize: "₹68,450 Cr",
      minSip: "₹1,000",
      risk: "Very High Risk",
      fundHouse: "PPFAS Mutual Fund"
    },
    {
      id: "mf-2",
      name: "Quant Small Cap Fund Direct-Growth",
      category: "Equity - Small Cap",
      nav: "₹264.10",
      cagr3Y: "32.80%",
      cagr5Y: "38.20%",
      rating: "5 Star",
      expenseRatio: "0.75%",
      fundSize: "₹22,150 Cr",
      minSip: "₹1,000",
      risk: "Very High Risk",
      fundHouse: "Quant Mutual Fund"
    },
    {
      id: "mf-3",
      name: "SBI Nifty Index Fund Direct-Growth",
      category: "Equity - Index Fund",
      nav: "₹212.80",
      cagr3Y: "16.40%",
      cagr5Y: "17.80%",
      rating: "4 Star",
      expenseRatio: "0.18%",
      fundSize: "₹12,890 Cr",
      minSip: "₹500",
      risk: "Very High Risk",
      fundHouse: "SBI Mutual Fund"
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Interactive SIP Calculator */}
      <div className="glass-card p-6 space-y-6 border-l-4 border-emerald-400">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            Interactive SIP Wealth Calculator (INR ₹)
          </h3>
          <span className="badge-gain">Wealth Growth Projection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Sliders */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Monthly SIP Investment:</span>
                <span className="text-cyan-300 font-mono text-sm">{formatINR(monthlySip)}</span>
              </div>
              <input
                type="range"
                min={500}
                max={100000}
                step={500}
                value={monthlySip}
                onChange={(e) => setMonthlySip(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Expected Annual Return Rate (CAGR):</span>
                <span className="text-emerald-400 font-mono text-sm">{expectedReturn}% p.a.</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={0.5}
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span>Investment Horizon:</span>
                <span className="text-purple-300 font-mono text-sm">{investmentYears} Years</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={investmentYears}
                onChange={(e) => setInvestmentYears(parseInt(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="bg-slate-950/60 p-6 rounded-2xl border border-white/10 space-y-4 font-mono">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Invested Amount:</span>
              <span className="text-white font-bold">{formatINR(totalInvested)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estimated Wealth Gain:</span>
              <span className="text-emerald-400 font-bold">+{formatINR(estimatedWealthGain)}</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
              <span className="text-xs text-slate-300 font-sans font-bold">Future Maturity Corpus:</span>
              <span className="text-2xl font-extrabold text-cyan-300">{formatINR(estimatedFutureValue, { compact: true })}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Mutual Funds Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {funds.map((mf) => (
          <div key={mf.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-base">{mf.name}</h4>
                  <span className="text-xs text-slate-400">{mf.category}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" /> {mf.rating}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current NAV</span>
                  <span className="text-white font-bold">{mf.nav}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">3Y Return</span>
                  <span className="text-emerald-400 font-bold">{mf.cagr3Y}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Expense Ratio</span>
                  <span className="text-slate-300">{mf.expenseRatio}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">AUM Fund Size</span>
                  <span className="text-cyan-300">{mf.fundSize}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert(`SIP of ₹${monthlySip} started for ${mf.name}`)}
              className="gradient-btn-green w-full py-2.5 rounded-xl text-xs font-bold text-black"
            >
              Start Auto-SIP ({mf.minSip}/mo)
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
