import React, { useMemo, useState } from 'react';
import { DrawData } from '../types';
import { analyzeDraws } from '../utils/lotteryUtils';
import HeatmapGrid from './HeatmapGrid';
import AiAdvisor from './AiAdvisor';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, Activity, AlertCircle, Grid3X3, ArrowUpRight, 
  Calendar, RotateCcw, TrendingUp, RefreshCw, Zap
} from 'lucide-react';

interface DashboardProps {
  data: DrawData[];
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'ai'>('overview');
  
  const summary = useMemo(() => analyzeDraws(data), [data]);

  // Data for frequency chart
  const frequencyChartData = useMemo(() => {
    return summary.mostFrequent.sort((a,b) => a.number - b.number).map(s => ({
      name: s.number.toString(),
      frequencia: s.frequency,
      atraso: s.delay
    }));
  }, [summary]);

  // Data for trend chart (last 50 draws)
  const trendData = useMemo(() => {
    return data.slice(-50).map(d => ({
        concurso: d.concurso,
        soma: d.bolas.reduce((a,b)=>a+b,0),
        pares: d.bolas.filter(n=>n%2===0).length
    }));
  }, [data]);

  const lastDraw = data[data.length - 1];
  const currentCycle = summary.cycles[summary.cycles.length - 1];

  return (
    <div className="min-h-screen pb-12 bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">L</div>
            <h1 className="font-bold text-slate-800 text-lg hidden sm:block tracking-tight">LotoAnalitica <span className="text-purple-600">Pro</span></h1>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
             <div className="hidden md:flex items-center px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Base Atualizada: {summary.totalDraws} Concursos
             </div>
             <button 
               onClick={onReset}
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-purple-200 rounded-lg text-slate-700 transition-all shadow-sm font-medium"
             >
               <RotateCcw className="w-4 h-4" />
               <span className="hidden sm:inline">Carregar Outro Arquivo</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-1">
            {[
                { id: 'overview', label: 'Dashboard & Alertas', icon: LayoutDashboard },
                { id: 'analysis', label: 'Análise Avançada', icon: Activity },
                { id: 'ai', label: 'IA & Recomendações', icon: Zap },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all whitespace-nowrap relative top-[1px] border-b-2
                        ${activeTab === tab.id 
                            ? 'border-purple-600 text-purple-700 bg-purple-50/50' 
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }
                    `}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>

        {/* CONTENT: OVERVIEW */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: KPI & Alerts */}
                <div className="space-y-6 lg:col-span-2">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Concurso Atual</span>
                                <Calendar className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight">#{lastDraw.concurso}</div>
                            <div className="text-xs text-slate-400 mt-1">{lastDraw.data}</div>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ciclo Atual</span>
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight flex items-baseline gap-1">
                                {currentCycle.length} <span className="text-sm font-normal text-slate-400">jogos</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                {currentCycle.missingNumbers.length > 0 
                                    ? `Faltam ${currentCycle.missingNumbers.length} dezenas` 
                                    : 'Ciclo Fechou!'}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Soma Recente</span>
                                <Activity className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight">{summary.lastDrawPattern.sum}</div>
                            <div className="text-xs text-slate-400 mt-1">Média Histórica: {summary.averageSum.toFixed(0)}</div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Repetidas</span>
                                <TrendingUp className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold text-slate-800 tracking-tight">{summary.lastDrawPattern.repeated}</div>
                            <div className="text-xs text-slate-400 mt-1">Do concurso anterior</div>
                        </div>
                    </div>

                    {/* Alerts Section */}
                    {summary.alerts.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Alertas Inteligentes & Anomalias
                            </h3>
                            <div className="space-y-3">
                                {summary.alerts.map((alert, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-100 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                                        <p className="text-slate-700 text-sm">{alert}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Result */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Resultado do Concurso #{lastDraw.concurso}</h3>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">{lastDraw.data}</span>
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2 mb-8">
                            {Array.from({length: 25}, (_, i) => i + 1).map(num => {
                                const isDrawn = lastDraw.bolas.includes(num);
                                return (
                                    <div 
                                        key={num} 
                                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all
                                            ${isDrawn 
                                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md scale-105 ring-2 ring-purple-100' 
                                                : 'bg-slate-50 text-slate-300'
                                            }
                                        `}
                                    >
                                        {num}
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Mini Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-50">
                             <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Primos</div>
                                <div className="font-bold text-slate-700 text-lg">{summary.lastDrawPattern.primes}</div>
                             </div>
                             <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Fibonacci</div>
                                <div className="font-bold text-slate-700 text-lg">{summary.lastDrawPattern.fibonacci}</div>
                             </div>
                             <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Pares</div>
                                <div className="font-bold text-slate-700 text-lg">{summary.lastDrawPattern.even}</div>
                             </div>
                             <div className="text-center">
                                <div className="text-xs text-slate-400 uppercase font-semibold">Ímpares</div>
                                <div className="font-bold text-slate-700 text-lg">{summary.lastDrawPattern.odd}</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Heatmap */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Grid3X3 className="w-5 h-5 text-purple-600" />
                        Mapa de Calor
                    </h3>
                    <div className="flex-1 flex flex-col justify-center">
                        <HeatmapGrid stats={summary.mostFrequent} />
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <h4 className="font-semibold text-slate-700 text-sm mb-2">Destaques do Mapa</h4>
                        <ul className="text-xs text-slate-500 space-y-1">
                            <li>🔥 <strong>Mais quente:</strong> {summary.mostFrequent[0].number} ({summary.mostFrequent[0].frequency}x)</li>
                            <li>❄️ <strong>Mais frio:</strong> {summary.leastFrequent[0].number} ({summary.leastFrequent[0].frequency}x)</li>
                            <li>⏳ <strong>Mais atrasado:</strong> {summary.mostOverdue[0].number} ({summary.mostOverdue[0].delay} concursos)</li>
                        </ul>
                    </div>
                </div>
            </div>
        )}

        {/* CONTENT: ANALYSIS */}
        {activeTab === 'analysis' && (
            <div className="space-y-6">
                
                {/* Cycles Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Análise de Ciclos</h3>
                            <p className="text-sm text-slate-500">Acompanhe quanto tempo leva para saírem todas as 25 dezenas.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                            <RefreshCw className="w-4 h-4" />
                            Ciclo Atual: {currentCycle.length} jogos
                        </div>
                    </div>
                    
                    {currentCycle.missingNumbers.length > 0 ? (
                        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                            <h4 className="text-blue-900 font-semibold mb-3">Dezenas que faltam para fechar o ciclo:</h4>
                            <div className="flex flex-wrap gap-3">
                                {currentCycle.missingNumbers.map(n => (
                                    <div key={n} className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-sm border border-blue-100">
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                            ✅ O Ciclo atual fechou no último concurso! Um novo ciclo começará no próximo.
                        </div>
                    )}

                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.cycles.slice(-20)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="cycleNumber" tickFormatter={(val) => `Ciclo ${val}`} tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} label={{ value: 'Duração (Jogos)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                                <Bar dataKey="length" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Duração" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Trends Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Tendência da Soma das Dezenas (Últimos 50)</h3>
                    <div className="h-[300px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorSum" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="concurso" tick={{fill: '#64748b', fontSize: 10}} axisLine={false} tickLine={false} />
                                <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                                <Area type="monotone" dataKey="soma" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSum)" />
                                {/* Reference Line for Average */}
                                <Line type="monotone" dataKey={() => summary.averageSum} stroke="#94a3b8" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Frequência Geral</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={frequencyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{fill: '#f1f5f9'}}
                                />
                                <Bar dataKey="frequencia" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}

        {/* CONTENT: AI */}
        {activeTab === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                 <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse [animation-delay:2s]"></div>
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                            <Zap className="w-6 h-6 text-yellow-300" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Sistema de Recomendação</h3>
                        <p className="text-indigo-200 mb-8 leading-relaxed text-sm">
                            Nossa Inteligência Artificial processa o padrão de {summary.totalDraws} concursos para identificar oportunidades matemáticas. 
                            <br/><br/>
                            O assistente pode sugerir jogos baseados em:
                        </p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <RefreshCw className="w-5 h-5 text-blue-400" />
                                <div>
                                    <div className="font-semibold text-sm">Fechamento de Ciclo</div>
                                    <div className="text-xs text-slate-400">Prioriza dezenas ausentes</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <Activity className="w-5 h-5 text-green-400" />
                                <div>
                                    <div className="font-semibold text-sm">Equilíbrio Estatístico</div>
                                    <div className="text-xs text-slate-400">Balanceamento Par/Ímpar/Soma</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                <TrendingUp className="w-5 h-5 text-orange-400" />
                                <div>
                                    <div className="font-semibold text-sm">Análise de Tendência</div>
                                    <div className="text-xs text-slate-400">Baseado nos últimos 10 concursos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 <div className="lg:col-span-2 h-full">
                    <AiAdvisor summary={summary} />
                 </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
