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
        <div className={`flex items-center h-9 lg:h-8 bg-black/40 border border-void-dim/30 hover:border-void-neon/50 transition-colors ${width}`}>
            <button onClick={handleDec} className="btn-step-mini border-r border-void-dim/30">
                −
            </button>
            <input
                type="number"
                value={value}
                onChange={handleInput}
                className="input-step-compact px-2"
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

    const removeCase = (id) => {
        if (confirm('案件を削除しますか？')) {
            setCases(cases.filter(c => c.id !== id));
        }
    };

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
                <div className="container-excel px-4 py-3 lg:py-4 flex flex-col lg:flex-row justify-between gap-4 lg:gap-6 items-center">

                    {/* Title */}
                    <div className="flex items-center gap-3 lg:gap-4 flex-none self-start lg:self-center">
                        <CalcIcon className="w-8 h-8 lg:w-12 lg:h-12 animate-pulse-neon" />
                        <div>
                            <h1 className="text-xl lg:text-3xl font-cyber font-bold tracking-[0.1em] text-white">
                                SES-CALC
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-void-neon">SYSTEM ONLINE</span>
                                <div className="w-1.5 h-1.5 bg-[#22c55e] shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* BIG TOTALS */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto justify-end flex-grow">
                        <div className="cyber-panel px-4 lg:px-6 py-2 lg:py-3 flex-1 sm:flex-none lg:min-w-[220px] text-right flex flex-col justify-center border-l-4 border-l-void-accent">
                            <div className="text-[10px] lg:text-xs font-jp font-bold text-void-textDim mb-0.5">売上総額</div>
                            <div className="text-2xl lg:text-3xl font-tech font-bold text-white leading-none">¥{formatJP(totals.sales)}</div>
                        </div>
                        <div className="cyber-panel px-4 lg:px-8 py-2 lg:py-3 flex-1 sm:flex-none lg:min-w-[260px] text-right border-l-4 border-l-void-neon bg-void-neon/10 flex flex-col justify-center">
                            <div className="text-[10px] lg:text-xs font-jp font-bold text-void-neon animate-pulse mb-0.5">粗利総額</div>
                            <div className="text-3xl lg:text-4xl font-tech font-bold text-void-neon drop-shadow-[0_0_8px_#d946ef] leading-none">¥{formatJP(totals.profit)}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- ACTION TOOLBAR --- */}
            <div className="flex-none bg-void-panel/50 border-b border-void-dim/30 z-20">
                <div className="container-excel px-4 py-3 flex items-center justify-between gap-4">
                    <button
                        onClick={addCase}
                        className="flex-1 lg:flex-none px-6 py-2.5 lg:py-2 bg-void-neon text-black font-jp font-bold text-sm tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 rounded-sm"
                    >
                        <span className="text-lg leading-none">+</span> 案件追加
                    </button>

                    <TaxSwitch isInclusive={taxIncluded} onChange={setTaxIncluded} />
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto relative z-10 custom-scroll">
                <div className="container-excel py-4 px-2 lg:px-4">

                    {/* Desktop Headers (Hidden on Mobile) */}
                    <div className="hidden lg:grid grid-definition grid-header uppercase tracking-widest mb-2">
                        <div className="cell-left">案件名</div>
                        <div className="cell-center">元単価</div>
                        <div className="cell-center">紹介単価</div>
                        <div className="cell-center">月数</div>
                        <div className="cell-center">期間売上</div>
                        <div className="cell-center">期間粗利</div>
                        <div></div>
                    </div>

                    {/* Project Rows / Cards */}
                    <div className="space-y-3 lg:space-y-0">
                        {cases.map((row) => {
                            const dSales = taxIncluded ? Math.floor(row.sales * 1.1) : row.sales;
                            const dCost = taxIncluded ? Math.floor(row.cost * 1.1) : row.cost;
                            const monthlyProfit = Math.max(0, dSales - dCost);
                            const periodProfit = monthlyProfit * row.duration;
                            const periodSales = dSales * row.duration;

                            return (
                                <div key={row.id} className="grid-definition grid-row">

                                    {/* Line 1: Name & Delete (Delete shown always or just on cards?) */}
                                    <div className="mobile-row-line lg:block cell-left">
                                        <div className="lg:hidden mobile-label">案件名</div>
                                        <div className="mobile-content w-full">
                                            <input
                                                type="text"
                                                value={row.name}
                                                onChange={(e) => updateCase(row.id, 'name', e.target.value)}
                                                placeholder="名称を入力..."
                                                className="w-full bg-transparent border-none focus:ring-0 outline-none text-white font-jp text-sm lg:text-base placeholder:text-void-dim/50 lg:pl-0"
                                            />
                                        </div>
                                        <button onClick={() => removeCase(row.id)} className="lg:hidden ml-2 text-void-dim hover:text-red-500 text-2xl px-2">×</button>
                                    </div>

                                    {/* Line 2: Prices (Row on Mobile) */}
                                    <div className="mobile-row-line lg:block cell-right">
                                        <div className="lg:hidden mobile-label">元単価</div>
                                        <div className="mobile-content">
                                            <CompactStepper
                                                value={row.sales}
                                                step={10000}
                                                onChange={(val) => updateCase(row.id, 'sales', val)}
                                            />
                                        </div>
                                    </div>

                                    <div className="mobile-row-line lg:block cell-right">
                                        <div className="lg:hidden mobile-label">紹介単価</div>
                                        <div className="mobile-content">
                                            <CompactStepper
                                                value={row.cost}
                                                step={10000}
                                                onChange={(val) => updateCase(row.id, 'cost', val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Line 3: Duration */}
                                    <div className="mobile-row-line lg:block cell-center">
                                        <div className="lg:hidden mobile-label">稼働月数</div>
                                        <div className="mobile-content">
                                            <CompactStepper
                                                value={row.duration}
                                                step={1}
                                                onChange={(val) => updateCase(row.id, 'duration', val)}
                                            />
                                        </div>
                                    </div>

                                    {/* Line 4: Period Totals (Read Only) */}
                                    <div className="mobile-row-line lg:block cell-right border-t border-void-dim/10 pt-2 lg:border-none lg:pt-0">
                                        <div className="lg:hidden mobile-label">期間売上</div>
                                        <div className="mobile-content font-tech font-bold text-lg text-white">
                                            ¥{formatJP(periodSales)}
                                        </div>
                                    </div>

                                    <div className="mobile-row-line lg:block cell-right">
                                        <div className="lg:hidden mobile-label text-void-neon">期間粗利</div>
                                        <div className="mobile-content font-tech font-bold text-xl text-void-neon drop-shadow-[0_0_5px_#d946ef]">
                                            ¥{formatJP(periodProfit)}
                                        </div>
                                    </div>

                                    {/* Desktop Delete */}
                                    <div className="hidden lg:flex cell-center">
                                        <button onClick={() => removeCase(row.id)} className="text-void-dim/50 hover:text-red-500 font-bold text-lg transition-colors">
                                            ×
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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

