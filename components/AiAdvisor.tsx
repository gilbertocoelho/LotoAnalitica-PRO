import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, Bot, AlertTriangle, Key, BrainCircuit, LineChart, Target } from 'lucide-react';
import { AnalysisSummary } from '../types';

interface AiAdvisorProps {
  summary: AnalysisSummary;
}

const AiAdvisor: React.FC<AiAdvisorProps> = ({ summary }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [showKeyInput, setShowKeyInput] = useState(!process.env.API_KEY);

  // Auto-generate if key exists
  useEffect(() => {
    if (apiKey && !response) {
      // Default initial welcome
      handleGenerateInsight("Faça uma saudação curta e liste 3 insights rápidos sobre os dados carregados.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const handleGenerateInsight = async (customPrompt: string) => {
    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      const currentCycle = summary.cycles[summary.cycles.length - 1];
      const missingInCycle = currentCycle.endConcurso ? "Nenhum (Ciclo Fechado)" : currentCycle.missingNumbers.join(', ');

      const contextData = `
        DADOS ESTATÍSTICOS DA LOTOFÁCIL (Total: ${summary.totalDraws} jogos):
        
        1. DEZENAS QUENTES (Top 5): ${summary.mostFrequent.slice(0, 5).map(n => n.number).join(', ')}
        2. DEZENAS FRIAS (Top 5): ${summary.leastFrequent.slice(0, 5).map(n => n.number).join(', ')}
        3. ATRASOS CRÍTICOS: ${summary.mostOverdue.slice(0, 5).map(n => `Dezena ${n.number} (${n.delay}x)`).join(', ')}
        
        4. CICLOS:
           - Ciclo Atual: #${currentCycle.cycleNumber}
           - Tamanho Atual: ${currentCycle.length} sorteios
           - Falta sair: [${missingInCycle}]
        
        5. PADRÃO DO ÚLTIMO SORTEIO:
           - Soma: ${summary.lastDrawPattern.sum} (Média Geral: ${summary.averageSum.toFixed(0)})
           - Pares: ${summary.lastDrawPattern.even} | Ímpares: ${summary.lastDrawPattern.odd}
           - Primos: ${summary.lastDrawPattern.primes}
           - Fibonacci: ${summary.lastDrawPattern.fibonacci}
           - Repetidas do Anterior: ${summary.lastDrawPattern.repeated}
      `;

      const finalPrompt = `
        Você é um Assistente Virtual Especializado em Loterias (LotoAnalitica AI).
        Use os seguintes dados REAIS processados pelo sistema:
        ${contextData}

        TAREFA DO USUÁRIO: ${customPrompt}

        DIRETRIZES:
        - Use formatação Markdown (negrito, listas).
        - Seja analítico e matemático.
        - Se pedirem palpites, use a lógica de: equilibrar pares/ímpares, incluir números do ciclo aberto e misturar quentes/frias.
        - NUNCA garanta vitórias. Sempre reforce que é probabilidade.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: finalPrompt,
      });

      setResponse(result.text || "Não foi possível gerar uma resposta.");
    } catch (error: any) {
      setResponse(`Erro na IA: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      handleGenerateInsight(prompt);
      setPrompt('');
    }
  };

  const suggestionChips = [
    { icon: Target, label: "Gerar 3 Palpites Otimizados", prompt: "Gere 3 combinações de 15 números para o próximo concurso. Utilize a lógica de fechamento de ciclo (priorize números que faltam sair: " + (summary.cycles[summary.cycles.length-1].endConcurso ? 'nenhum, ciclo fechou' : summary.cycles[summary.cycles.length-1].missingNumbers.join(',')) + ") e equilibre com números quentes. Explique a lógica de cada jogo." },
    { icon: BrainCircuit, label: "Análise Comportamental", prompt: "Faça uma análise comportamental dos números. Quais números costumam sair juntos com os números mais atrasados? Identifique padrões de comportamento recentes." },
    { icon: LineChart, label: "Previsão de Ciclo", prompt: "Analise o Ciclo Atual. Com base na média histórica de duração dos ciclos, qual a probabilidade do ciclo fechar no próximo concurso? Devo apostar fixo nas dezenas que faltam?" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-900 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <div>
                <h2 className="font-semibold text-sm">Assistente Virtual Especializado</h2>
                <p className="text-[10px] text-slate-400">Powered by Gemini 3 Flash</p>
            </div>
        </div>
        {!process.env.API_KEY && (
            <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-xs bg-indigo-500/30 hover:bg-indigo-500/50 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
            >
                <Key className="w-3 h-3" /> API Key
            </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 relative">
        {showKeyInput && (
            <div className="absolute top-4 left-4 right-4 z-10 p-4 bg-white shadow-lg border border-yellow-200 rounded-xl animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-yellow-700 mb-2 font-semibold">
                    <AlertTriangle className="w-4 h-4" /> Configuração Obrigatória
                </div>
                <p className="text-sm text-slate-600 mb-3">
                    Insira sua chave Gemini API para ativar a Inteligência Artificial.
                </p>
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        placeholder="sk-..."
                        className="flex-1 p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button 
                        onClick={() => {
                            if(apiKey) {
                                setShowKeyInput(false);
                                handleGenerateInsight("Analise os dados e me dê boas vindas.");
                            }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 font-medium"
                    >
                        Ativar IA
                    </button>
                </div>
            </div>
        )}

        {response ? (
            <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                    <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div className="flex-1 bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                     <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                        {response.split('\n').map((line, i) => {
                            // Simple parser for bolding patterns like **text**
                            const parts = line.split('**');
                            return (
                                <p key={i} className="mb-2 last:mb-0 leading-relaxed">
                                    {parts.map((part, index) => 
                                        index % 2 === 1 ? <strong key={index} className="text-indigo-900">{part}</strong> : part
                                    )}
                                </p>
                            );
                        })}
                     </div>
                 </div>
            </div>
        ) : (
            !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                    <BrainCircuit className="w-16 h-16 mb-4" />
                    <p className="text-sm font-medium">O Assistente está pronto para analisar os dados.</p>
                </div>
            )
        )}
        
        {loading && (
             <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                <div className="flex-1 space-y-3 py-2">
                    <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                </div>
             </div>
        )}
      </div>

      {/* Action Chips */}
      <div className="bg-white border-t border-slate-100 p-3 flex gap-2 overflow-x-auto no-scrollbar">
        {suggestionChips.map((chip, idx) => (
            <button
                key={idx}
                onClick={() => handleGenerateInsight(chip.prompt)}
                disabled={loading || !apiKey}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border border-indigo-100 disabled:opacity-50"
            >
                <chip.icon className="w-3 h-3" />
                {chip.label}
            </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative group">
            <input
                type="text"
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm group-hover:bg-white"
                placeholder="Ex: Qual a tendência para números primos?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
            />
            <button 
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
            >
                <Send className="w-4 h-4" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default AiAdvisor;
