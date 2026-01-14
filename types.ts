export interface DrawData {
  concurso: number;
  data: string;
  bolas: number[];
}

export interface NumberStat {
  number: number;
  frequency: number;
  lastAppearance: number; // Concurso ID
  delay: number; // How many draws since last appearance
}

export interface PatternAnalysis {
  primes: number;
  fibonacci: number;
  sum: number;
  even: number;
  odd: number;
  repeated: number; // Repeated from previous draw
}

export interface CycleData {
  cycleNumber: number;
  startConcurso: number;
  endConcurso: number | null; // Null if current open cycle
  length: number; // How many draws to close
  missingNumbers: number[]; // If open
}

export interface AnalysisSummary {
  totalDraws: number;
  mostFrequent: NumberStat[];
  leastFrequent: NumberStat[];
  mostOverdue: NumberStat[]; 
  oddEvenRatio: { odd: number; even: number };
  averageSum: number;
  cycles: CycleData[];
  lastDrawPattern: PatternAnalysis;
  alerts: string[]; // Generated algorithmic alerts
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
}
