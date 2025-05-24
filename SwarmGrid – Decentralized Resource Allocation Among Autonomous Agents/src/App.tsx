import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import Dashboard from './components/Dashboard';
import GridVisualization from './components/GridVisualization';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <SimulationProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
        <header className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-400">SwarmGrid</h1>
            <div className="text-sm text-gray-400">Decentralized Agent Simulation</div>
          </div>
        </header>
        
        <main className="flex-grow flex flex-col md:flex-row">
          <Sidebar />
          <GridVisualization />
        </main>
        
        <Dashboard />
      </div>
    </SimulationProvider>
  );
}

export default App;