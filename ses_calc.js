const { useState, useEffect, useMemo } = React;

const formatJP = (val) => new Intl.NumberFormat('ja-JP').format(val);

const CalcIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
        <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v2h12V6H6zm0 4v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2zm-8 4v2h2v-2H6zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z" className="text-void-neon" />
    </svg>
);

const CompactStepper = ({ value, step, onChange, width = "w-full" }) => {
    const handleDec = () => onChange(Math.max(0, Number(value) - step));
    const handleInc = () => onChange(Number(value) + step);
    const handleInput = (e) => onChange(Math.max(0, Number(e.target.value)));

    return (
        <div className={`flex items-center h-8 bg-black/40 border border-void-dim/30 hover:border-void-neon/50 transition-colors ${width}`}>
            <button onClick={handleDec} className="btn-step-mini border-r border-void-dim/30">
                −
            </button>
            <input
                type="number"
                value={value}
                onChange={handleInput}
                className="input-step-compact px-1"
            />
            <button onClick={handleInc} className="btn-step-mini border-l border-void-dim/30">
                +
            </button>
        </div>
    );
};

const TaxSwitch = ({ isInclusive, onChange }) => (
    <div className={`tax-switch ${isInclusive ? 'inclusive' : ''}`} onClick={() => onChange(!isInclusive)}>
        <div className="tax-switch-thumb"></div>
        <div className={`tax-switch-label ${!isInclusive ? 'active' : ''}`}>税抜</div>
        <div className={`tax-switch-label ${isInclusive ? 'active' : ''}`}>税込</div>
    </div>
);

const App = () => {
    const [taxIncluded, setTaxIncluded] = useState(false);

    const initialData = [
        { id: 1, name: 'CYBER CORE DEV', sales: 900000, cost: 600000, duration: 6 },
    ];

    const [cases, setCases] = useState(() => {
        const saved = localStorage.getItem('ses_calc_void');
        return saved ? JSON.parse(saved) : initialData;
    });

    useEffect(() => {
        localStorage.setItem('ses_calc_void', JSON.stringify(cases));
    }, [cases]);

    const updateCase = (id, field, value) => {
        setCases(cases.map(c => {
            if (c.id === id) {
                const updated = { ...c, [field]: value };
                if (['sales', 'cost', 'duration'].includes(field)) {
                    updated[field] = Math.max(0, Number(value));
                }
                return updated;
            }
            return c;
        }));
    };

    const addCase = () => {
        const newId = cases.length > 0 ? Math.max(...cases.map(c => c.id)) + 1 : 1;
        setCases([...cases, { id: newId, name: '', sales: 0, cost: 0, duration: 1 }]);
    };

    const removeCase = (id) => setCases(cases.filter(c => c.id !== id));

    const totals = useMemo(() => {
        let totalPeriodSales = 0;
        let totalPeriodProfit = 0;
        const TAX_RATE = 1.1;

        cases.forEach(c => {
            const dSales = taxIncluded ? Math.floor(c.sales * TAX_RATE) : c.sales;
            const dCost = taxIncluded ? Math.floor(c.cost * TAX_RATE) : c.cost;
            const dMonthlyProfit = dSales - dCost;

            totalPeriodSales += dSales * c.duration;
            totalPeriodProfit += dMonthlyProfit * c.duration;
        });

        return { sales: totalPeriodSales, profit: totalPeriodProfit };
    }, [cases, taxIncluded]);

    return (
        <>
            {/* --- HEADER --- */}
            <header className="flex-none border-b border-void-dim bg-void-bg/90 backdrop-blur-md z-30 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
                <div className="container-excel px-6 py-4 flex flex-col lg:flex-row justify-between gap-6 items-center">

                    {/* Title (Left) */}
                    <div className="flex items-center gap-4 flex-none">
                        <CalcIcon className="w-10 h-10 md:w-12 md:h-12 animate-pulse-neon" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-cyber font-bold tracking-[0.1em] text-white">
                                SES-CALC
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-void-neon">SYSTEM ONLINE</span>
                                <div className="w-1.5 h-1.5 bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* BIG TOTALS (Right) - Both Bordered and Wider */}
                    <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-center lg:justify-end flex-grow">
                        <div className="cyber-panel px-6 py-3 min-w-[220px] text-right skew-x-[-10deg] flex flex-col justify-center">
                            <div className="text-xs font-jp font-bold text-void-textDim skew-x-[10deg] mb-1">売上総額</div>
                            <div className="text-3xl font-tech font-bold text-white skew-x-[10deg] leading-none">¥{formatJP(totals.sales)}</div>
                        </div>
                        <div className="cyber-panel px-8 py-3 min-w-[260px] text-right border-void-neon skew-x-[-10deg] bg-void-neon/10 flex flex-col justify-center">
                            <div className="text-xs font-jp font-bold text-void-neon skew-x-[10deg] animate-pulse mb-1">粗利総額</div>
                            <div className="text-4xl font-tech font-bold text-void-neon skew-x-[10deg] drop-shadow-[0_0_8px_#d946ef] leading-none">¥{formatJP(totals.profit)}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- ACTION TOOLBAR --- */}
            <div className="flex-none bg-void-panel/50 border-b border-void-dim/30 z-20">
                <div className="container-excel px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={addCase}
                        className="px-6 py-2 bg-void-neon text-black font-jp font-bold text-sm tracking-widest hover:bg-white hover:text-black hover:shadow-[0_0_15px_#d946ef] transition-all whitespace-nowrap clip-path-shred flex items-center gap-2"
                    >
                        <span className="text-lg leading-none pb-0.5">+</span> 案件追加
                    </button>

                    <TaxSwitch isInclusive={taxIncluded} onChange={setTaxIncluded} />
                </div>
            </div>

            {/* --- MAIN CONTENT (Excel Grid) --- */}
            <main className="flex-1 overflow-y-auto relative z-10 custom-scroll">
                <div className="container-excel px-2 md:px-4 py-4">

                    {/* Column Headers (All Centered) */}
                    <div className="grid-definition grid-header hidden md:grid uppercase tracking-widest">
                        <div>案件名</div>
                        <div>元単価</div>
                        <div>紹介単価</div>
                        <div>稼働月数</div>
                        <div>期間売上</div>
                        <div>期間粗利</div>
                        <div>{/* Spacer */}</div>
                    </div>

                    {/* Rows */}
                    <div className="border-t md:border-none border-void-dim/20">
                        {cases.map((row) => {
                            const dSales = taxIncluded ? Math.floor(row.sales * 1.1) : row.sales;
                            const dCost = taxIncluded ? Math.floor(row.cost * 1.1) : row.cost;
                            const monthlyProfit = Math.max(0, dSales - dCost);
                            const periodProfit = monthlyProfit * row.duration;
                            const periodSales = dSales * row.duration;

                            return (
                                <div key={row.id} className="cyber-panel-row grid-definition grid-row group">

                                    {/* Name */}
                                    <div className="cell-left">
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e) => updateCase(row.id, 'name', e.target.value)}
                                            placeholder="案件名..."
                                            className="w-full bg-transparent border-none focus:ring-0 outline-none text-white font-jp text-sm placeholder:text-void-dim/50"
                                        />
                                    </div>

                                    {/* Unit Price */}
                                    <div className="cell-right">
                                        <CompactStepper
                                            value={row.sales}
                                            step={10000}
                                            onChange={(val) => updateCase(row.id, 'sales', val)}
                                        />
                                    </div>

                                    {/* Cost */}
                                    <div className="cell-right">
                                        <CompactStepper
                                            value={row.cost}
                                            step={10000}
                                            onChange={(val) => updateCase(row.id, 'cost', val)}
                                        />
                                    </div>

                                    {/* Duration (Wide) */}
                                    <div className="cell-center">
                                        <CompactStepper
                                            value={row.duration}
                                            step={1}
                                            onChange={(val) => updateCase(row.id, 'duration', val)}
                                            width="w-full"
                                        />
                                    </div>

                                    {/* Period Sales */}
                                    <div className="cell-right">
                                        <div className="font-tech font-bold text-lg text-white">
                                            ¥{formatJP(periodSales)}
                                        </div>
                                    </div>

                                    {/* Period Profit */}
                                    <div className="cell-right">
                                        <div className="font-tech font-bold text-lg text-void-neon drop-shadow-[0_0_5px_#d946ef]">
                                            ¥{formatJP(periodProfit)}
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <div className="cell-center">
                                        <button onClick={() => removeCase(row.id)} className="text-void-dim/50 hover:text-red-500 font-bold text-lg transition-colors">
                                            ×
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    <div className="h-10"></div>
                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="flex-none p-2 border-t border-void-dim/30 bg-black/80 backdrop-blur-sm z-20 flex justify-center">
                <div className="text-[9px] text-void-dim/50 font-tech tracking-widest uppercase">
                    SES-CALC
                </div>
            </footer>
        </>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
