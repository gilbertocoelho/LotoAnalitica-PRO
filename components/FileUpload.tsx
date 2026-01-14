import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { DrawData } from '../types';
import { parseExcelDate } from '../utils/lotteryUtils';

interface FileUploadProps {
  onDataLoaded: (data: DrawData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = useCallback((file: File) => {
    setError(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Assume first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Basic validation and parsing logic for Lotofacil format
        // Usually: Concurso (Col A), Data (Col B), Bolas (Col C - Q or similar)
        // We will scan for lines that look like a draw
        const parsedDraws: DrawData[] = [];
        
        // Skip header usually, start iterating
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            // Heuristic: A valid row needs at least 17 columns (ID, Date, 15 balls)
            // And the first column should be a number (Concurso ID)
            if (row.length >= 17 && typeof row[0] === 'number') {
                const concurso = row[0];
                const dateRaw = row[1];
                
                // Extract balls. Usually columns 2 to 16 (0-indexed) or scattered.
                // We'll try to find the first 15 numbers in the row after the date.
                const potentialBalls: number[] = [];
                for(let j = 2; j < row.length; j++) {
                    const cell = row[j];
                    if (typeof cell === 'number' && cell >= 1 && cell <= 25) {
                        potentialBalls.push(cell);
                    }
                }

                // Take the first 15 valid numbers found
                if (potentialBalls.length >= 15) {
                    parsedDraws.push({
                        concurso,
                        data: parseExcelDate(dateRaw),
                        bolas: potentialBalls.slice(0, 15).sort((a, b) => a - b) // Ensure sorted for display
                    });
                }
            }
        }

        if (parsedDraws.length === 0) {
            throw new Error("Não foi possível identificar sorteios válidos. Verifique se o arquivo é o padrão da CAIXA (lotofacil.xlsx).");
        }

        onDataLoaded(parsedDraws);

      } catch (err: any) {
        setError(err.message || "Erro ao processar arquivo.");
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] p-6">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-5xl font-bold text-slate-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          LotoAnalitica Pro
        </h1>
        <p className="text-slate-500 text-lg">
          Carregue o histórico oficial (Excel) para desbloquear análises estatísticas profundas e insights com IA.
        </p>
      </div>

      <div
        className={`w-full max-w-xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer bg-white shadow-sm
          ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:shadow-md'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {loading ? (
            <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Processando milhares de jogos...</p>
            </div>
        ) : (
            <>
                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-8 h-8" />
                </div>
                <p className="text-slate-700 font-medium text-lg mb-2">Arraste o arquivo lotofacil.xlsx aqui</p>
                <p className="text-slate-400 text-sm">ou clique para selecionar do computador</p>
                <input
                id="fileInput"
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleChange}
                />
            </>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 max-w-xl w-full animate-pulse">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl w-full">
         <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
             <div className="font-bold text-slate-800 text-lg mb-1">Upload Seguro</div>
             <p className="text-slate-500 text-sm">Processamento 100% no navegador. Seus dados não saem do seu computador.</p>
         </div>
         <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
             <div className="font-bold text-slate-800 text-lg mb-1">Análise Completa</div>
             <p className="text-slate-500 text-sm">Frequência, atrasos, padrões de par/ímpar e soma total.</p>
         </div>
         <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
             <div className="font-bold text-slate-800 text-lg mb-1">IA Integrada</div>
             <p className="text-slate-500 text-sm">Utilize o Gemini para interpretar padrões e sugerir estratégias.</p>
         </div>
      </div>
    </div>
  );
};

export default FileUpload;
