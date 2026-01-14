import { DrawData, NumberStat, AnalysisSummary, CycleData, PatternAnalysis } from '../types';

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23];
const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];

export const parseExcelDate = (excelDate: any): string => {
  if (typeof excelDate === 'number') {
    const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return date.toLocaleDateString('pt-BR');
  }
  return String(excelDate);
};

const getCommonArrayElements = (arr1: number[], arr2: number[]): number => {
  return arr1.filter(value => arr2.includes(value)).length;
};

const calculateCycles = (draws: DrawData[]): CycleData[] => {
  const cycles: CycleData[] = [];
  let currentSet = new Set<number>();
  let startConcurso = draws[0]?.concurso || 1;
  let cycleCount = 1;

  for (let i = 0; i < draws.length; i++) {
    const draw = draws[i];
    draw.bolas.forEach(b => currentSet.add(b));

    if (currentSet.size === 25) {
      // Cycle closed
      cycles.push({
        cycleNumber: cycleCount,
        startConcurso,
        endConcurso: draw.concurso,
        length: draw.concurso - startConcurso + 1,
        missingNumbers: []
      });
      currentSet.clear();
      cycleCount++;
      // Next cycle starts next draw (logic simplification for visual purposes)
      if (draws[i+1]) {
        startConcurso = draws[i+1].concurso;
      }
    }
  }

  // Handle open cycle
  if (currentSet.size > 0 && currentSet.size < 25) {
     const missing: number[] = [];
     for(let n=1; n<=25; n++) {
        if(!currentSet.has(n)) missing.push(n);
     }
     cycles.push({
        cycleNumber: cycleCount,
        startConcurso,
        endConcurso: null,
        length: draws[draws.length-1].concurso - startConcurso + 1,
        missingNumbers: missing
     });
  }

  return cycles;
};

export const analyzeDraws = (draws: DrawData[]): AnalysisSummary => {
  const sortedDraws = [...draws].sort((a, b) => a.concurso - b.concurso);
  const totalDraws = sortedDraws.length;
  const frequencyMap = new Map<number, number>();
  const lastAppearanceMap = new Map<number, number>();
  
  for (let i = 1; i <= 25; i++) {
    frequencyMap.set(i, 0);
    lastAppearanceMap.set(i, 0);
  }

  let totalSumAccumulator = 0;
  let totalOddCount = 0;
  let totalEvenCount = 0;

  sortedDraws.forEach((draw) => {
    const drawSum = draw.bolas.reduce((acc, curr) => acc + curr, 0);
    totalSumAccumulator += drawSum;

    const odds = draw.bolas.filter(n => n % 2 !== 0).length;
    totalOddCount += odds;
    totalEvenCount += (15 - odds);

    draw.bolas.forEach((num) => {
      frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
      lastAppearanceMap.set(num, draw.concurso);
    });
  });

  const lastConcurso = totalDraws > 0 ? sortedDraws[totalDraws - 1].concurso : 0;
  const stats: NumberStat[] = [];
  
  for (let i = 1; i <= 25; i++) {
    stats.push({
      number: i,
      frequency: frequencyMap.get(i) || 0,
      lastAppearance: lastAppearanceMap.get(i) || 0,
      delay: lastConcurso - (lastAppearanceMap.get(i) || 0)
    });
  }

  // Sorts
  const mostFrequent = [...stats].sort((a, b) => b.frequency - a.frequency);
  const leastFrequent = [...stats].sort((a, b) => a.frequency - b.frequency);
  const mostOverdue = [...stats].sort((a, b) => b.delay - a.delay);

  // Cycles
  const cycles = calculateCycles(sortedDraws);

  // Last Draw Analysis
  const lastDraw = sortedDraws[totalDraws - 1];
  const prevDraw = totalDraws > 1 ? sortedDraws[totalDraws - 2] : null;

  const lastPattern: PatternAnalysis = {
    primes: lastDraw.bolas.filter(n => PRIMES.includes(n)).length,
    fibonacci: lastDraw.bolas.filter(n => FIBONACCI.includes(n)).length,
    sum: lastDraw.bolas.reduce((a, b) => a + b, 0),
    even: lastDraw.bolas.filter(n => n % 2 === 0).length,
    odd: lastDraw.bolas.filter(n => n % 2 !== 0).length,
    repeated: prevDraw ? getCommonArrayElements(lastDraw.bolas, prevDraw.bolas) : 0
  };

  // Generate Algorithmic Alerts
  const alerts: string[] = [];
  
  // Alert 1: Open Cycle
  const currentCycle = cycles[cycles.length - 1];
  if (currentCycle && !currentCycle.endConcurso && currentCycle.length > 4) {
    alerts.push(`⚠️ Ciclo Atual está longo (${currentCycle.length} sorteios). Faltam sair: ${currentCycle.missingNumbers.join(', ')}.`);
  }

  // Alert 2: Extreme Delays
  mostOverdue.forEach(n => {
    if (n.delay > 10) alerts.push(`🚨 Dezena ${n.number} está crítica! Atrasada há ${n.delay} concursos.`);
  });

  // Alert 3: Sum Anomalies
  if (lastPattern.sum < 160 || lastPattern.sum > 240) {
    alerts.push(`📉 Soma do último sorteio (${lastPattern.sum}) saiu da média comum (180-220). Tendência de normalização.`);
  }

  return {
    totalDraws,
    mostFrequent,
    leastFrequent,
    mostOverdue,
    oddEvenRatio: { odd: totalOddCount, even: totalEvenCount },
    averageSum: totalDraws > 0 ? totalSumAccumulator / totalDraws : 0,
    cycles,
    lastDrawPattern: lastPattern,
    alerts
  };
};
