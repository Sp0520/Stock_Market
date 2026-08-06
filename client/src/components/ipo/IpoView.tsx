import React, { useState } from 'react';
import { Award } from 'lucide-react';

export const IpoView: React.FC = () => {
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [selectedIpo, setSelectedIpo] = useState<string>('ipo-1');
  const [allotmentResult, setAllotmentResult] = useState<any>(null);

  const ipos = [
    {
      id: "ipo-1",
      company: "Swiggy Limited",
      symbol: "SWIGGY",
      issuePrice: "₹371 - ₹390",
      lotSize: 38,
      minInvestment: "₹14,820",
      gmp: "+₹45.00 (11.5%)",
      status: "LISTED",
      subscription: "3.59x",
      listingDate: "2024-11-13",
      rating: "4.2 / 5",
      description: "Leading consumer tech platform for food ordering, quick commerce (Instamart), and hyper-local logistics."
    },
    {
      id: "ipo-2",
      company: "NTPC Green Energy Ltd",
      symbol: "NTPCGREEN",
      issuePrice: "₹102 - ₹108",
      lotSize: 138,
      minInvestment: "₹14,904",
      gmp: "+₹12.00 (11.1%)",
      status: "CURRENT",
      subscription: "2.42x",
      listingDate: "2026-08-14",
      rating: "4.5 / 5",
      description: "Wholly owned subsidiary of NTPC Limited driving utility-scale solar and wind power projects in India."
    },
    {
      id: "ipo-3",
      company: "Acme Solar Holdings Ltd",
      symbol: "ACMESOLAR",
      issuePrice: "₹275 - ₹289",
      lotSize: 51,
      minInvestment: "₹14,739",
      gmp: "+₹18.00 (6.2%)",
      status: "UPCOMING",
      subscription: "N/A",
      listingDate: "2026-08-27",
      rating: "3.8 / 5",
      description: "Independent renewable energy producer in India specializing in utility-scale solar power projects."
    }
  ];

  const handleCheckAllotment = () => {
    const chosen = ipos.find(i => i.id === selectedIpo) || ipos[0];
    const isAllotted = Math.random() > 0.4;
    setAllotmentResult({
      status: isAllotted ? "ALLOTTED" : "NOT ALLOTTED",
      company: chosen.company,
      pan: panNumber,
      lotSize: chosen.lotSize,
      message: isAllotted
        ? `Congratulations! 1 Lot (${chosen.lotSize} shares) of ${chosen.company} allotted to PAN ${panNumber}.`
        : `No allotment received for PAN ${panNumber}. Refund of ${chosen.minInvestment} initiated to bank account.`
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Allotment Status Checker Tool */}
      <div className="glass-card p-6 border-l-4 border-cyan-400 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          IPO Allotment Status Checker
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedIpo}
            onChange={(e) => setSelectedIpo(e.target.value)}
            className="glass-input text-xs text-white"
          >
            {ipos.map(i => (
              <option key={i.id} value={i.id} className="bg-slate-900">{i.company} ({i.status})</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Enter PAN Number (e.g. ABCDE1234F)"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            className="glass-input font-mono text-xs uppercase text-white"
          />

          <button 
            onClick={handleCheckAllotment}
            className="gradient-btn py-2.5 px-4 text-xs font-bold"
          >
            Check Status Now
          </button>
        </div>

        {allotmentResult && (
          <div className={`p-4 rounded-xl border text-xs font-semibold ${
            allotmentResult.status === 'ALLOTTED'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {allotmentResult.message}
          </div>
        )}
      </div>

      {/* Indian IPO List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ipos.map((ipo) => (
          <div key={ipo.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-white text-base">{ipo.company}</h4>
                  <span className="badge-exchange">{ipo.symbol}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  ipo.status === 'CURRENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-300'
                }`}>
                  {ipo.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2">{ipo.description}</p>

              <div className="mt-4 space-y-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue Price:</span>
                  <span className="text-white font-bold">{ipo.issuePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Min Investment:</span>
                  <span className="text-cyan-300 font-bold">{ipo.minInvestment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grey Market (GMP):</span>
                  <span className="text-emerald-400 font-bold">{ipo.gmp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription:</span>
                  <span className="text-purple-300 font-bold">{ipo.subscription}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert(`Applied for 1 Lot of ${ipo.company} via UPI mandating.`)}
              className="gradient-btn-green w-full py-2.5 rounded-xl text-xs font-bold text-black mt-4"
            >
              Apply via UPI ({ipo.minInvestment})
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
