import React, { useState } from 'react';
import { AppState, DrawData } from './types';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<DrawData[]>([]);

  const handleDataLoaded = (loadedData: DrawData[]) => {
    setData(loadedData);
    setAppState(AppState.DASHBOARD);
  };

  const handleReset = () => {
    setData([]);
    setAppState(AppState.UPLOAD);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {appState === AppState.UPLOAD ? (
        <FileUpload onDataLoaded={handleDataLoaded} />
      ) : (
        <Dashboard data={data} onReset={handleReset} />
      )}
    </div>
  );
};

export default App;
